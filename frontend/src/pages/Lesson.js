import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import './Lesson.css';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';
import AiTutor from '../components/domain/AiTutor';
import { useFeatures } from '../context/FeatureContext';

function Lesson() {
  const toast = useToast();
  const { user } = useAuth();
  const features = useFeatures();
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlayable, setIsPlayable] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const videoElRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const positionSaveRef = useRef(null);

  // Course data for lesson navigation
  const [courseData, setCourseData] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(-1);
  const [allLessons, setAllLessons] = useState([]);

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadLesson closes over id; listing it would duplicate [id]
  }, [id]);

  useEffect(() => {
    // initialize Plyr when lesson.video is loaded
    if (lesson && lesson.lessonType === 'VIDEO' && window.Plyr) {
      // destroy previous instance if exists
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch(e) { /* ignore */ }
      }
      const videoEl = document.querySelector('.video-container video');
      if (videoEl) {
        videoElRef.current = videoEl;
        playerRef.current = new window.Plyr(videoEl, { controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'] });

        // wire events
        videoEl.addEventListener('play', () => setIsPlaying(true));
        videoEl.addEventListener('pause', () => {
          setIsPlaying(false);
          // Save position on pause
          if (user && videoEl.currentTime > 0) {
            api.put(`/progress/lessons/${id}/position`, { positionSeconds: Math.floor(videoEl.currentTime) }).catch(() => {});
          }
        });
        videoEl.addEventListener('error', (e) => {
          console.error('Video playback error', e);
          setIsPlaying(false);
          setIsPlayable(false);
        });
      }
    }
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch(e) { /* ignore */ }
      }
      // remove listeners if present
      if (videoElRef.current) {
        try {
          videoElRef.current.removeEventListener('play', () => setIsPlaying(true));
          videoElRef.current.removeEventListener('pause', () => setIsPlaying(false));
        } catch(e) {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  useEffect(() => {
    // After lesson loads, detect if browser can play the file mime
    if (!lesson || lesson.lessonType !== 'VIDEO') return;

    const fileUrl = lesson.fileUrl || '';
    const extMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const mimeMap = {
      mp4: 'video/mp4',
      m4v: 'video/x-m4v',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska'
    };
    const mime = mimeMap[ext] || 'video/mp4';

    const tmp = document.createElement('video');
    const can = tmp.canPlayType(mime);
    // canPlayType returns '', 'probably', or 'maybe'
    setIsPlayable(Boolean(can && can !== ''));
  }, [lesson]);

  // Fetch course data when lesson loads (for navigation)
  useEffect(() => {
    if (!lesson || !lesson.courseId) return;
    api.get(`/courses/${lesson.courseId}`)
      .then(res => {
        const course = res.data;
        setCourseData(course);

        // Flatten lessons from modules or use flat list
        let flat = [];
        if (course.modules && course.modules.length > 0) {
          course.modules.forEach(mod => {
            if (mod.lessons) {
              flat = flat.concat(mod.lessons);
            }
          });
        } else if (course.lessons) {
          flat = course.lessons;
        }
        setAllLessons(flat);

        const idx = flat.findIndex(l => String(l.id) === String(id));
        setLessonIndex(idx);
      })
      .catch(() => {
        // ignore - navigation just won't show
      });
  }, [lesson, id]);

  const tryPlay = async () => {
    // Attempt to play via Plyr instance or native video element; must be triggered by user gesture
    try {
      if (playerRef.current && typeof playerRef.current.play === 'function') {
        await playerRef.current.play();
      } else {
        const vid = document.querySelector('.video-container video');
        if (vid) {
          await vid.play();
        }
      }
    } catch (err) {
      console.warn('Autoplay blocked or play failed:', err);
      setIsPlayable(false);
    }
  };

  // Streaming endpoint: proxied por nginx (prod) y por CRA proxy (dev)
  // Evita presigned URLs con host.docker.internal que no resuelve en el browser
  const streamUrl = `/api/lessons/${id}/stream`;

  const loadLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      console.debug('loadLesson: token present?', !!token);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`/lessons/${id}`, { headers });
      console.debug('loadLesson: response.data.completed =', response.data?.completed);
      const lessonData = response.data;

      // Redirect if drip-locked
      if (lessonData.available === false) {
        navigate(`/course/${lessonData.courseId}`, {
          state: { dripMessage: 'Esta lección aún no está disponible.' }
        });
        return;
      }

      setLesson(lessonData);
      setVideoSrc(streamUrl);

      // Resume video position if available
      if (lessonData.lastPositionSeconds && lessonData.lastPositionSeconds > 0 && lessonData.lessonType === 'VIDEO') {
        setTimeout(() => {
          const vid = document.querySelector('.video-container video');
          if (vid) vid.currentTime = lessonData.lastPositionSeconds;
        }, 500);
      }

      // Start position save interval for video
      if (lessonData.lessonType === 'VIDEO' && user) {
        clearInterval(positionSaveRef.current);
        positionSaveRef.current = setInterval(() => {
          const vid = document.querySelector('.video-container video');
          if (vid && !vid.paused && vid.currentTime > 0) {
            api.put(`/progress/lessons/${id}/position`, { positionSeconds: Math.floor(vid.currentTime) }).catch(() => {});
          }
        }, 15000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    try {
      const response = await api.post(`/progress/lessons/${id}/complete?courseId=${lesson.courseId}`);
      const percent = response.data?.progressPercentage;
      // reload lesson from backend to reflect persisted state
      await loadLesson();

      // mark local lesson as completed if applicable (loadLesson will set it)

      // Dispatch a custom event so other parts of the app could refresh if they listen
      try {
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { detail: { courseId: lesson.courseId, progressPercentage: percent } }));
      } catch(e) { /* ignore in non-browser env */ }

      // Optionally fetch latest course details to show updated progress somewhere
      try {
        await api.get(`/courses/${lesson.courseId}`);
      } catch(e) {
        // ignore
      }

      if (toast) toast.addToast('Lesson marked as completed! Course progress: ' + (percent != null ? percent + '%' : 'updated'), { type: 'success' });
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      if (toast) toast.addToast(err.response?.data?.error || 'Failed to mark lesson completed', { type: 'error' });
    }
  };

  const unmarkCompleted = async () => {
    try {
      const response = await api.delete(`/progress/lessons/${id}/complete?courseId=${lesson.courseId}`);
      const percent = response.data?.progressPercentage;
      // reload to reflect persisted change
      await loadLesson();

      try {
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { detail: { courseId: lesson.courseId, progressPercentage: percent } }));
      } catch(e) { /* ignore */ }

      try { await api.get(`/courses/${lesson.courseId}`); } catch(e) {}

      if (toast) toast.addToast('Lesson marked as incomplete. Course progress: ' + (percent != null ? percent + '%' : 'updated'), { type: 'success' });
    } catch (err) {
      console.error('Error unmarking lesson complete:', err);
      if (toast) toast.addToast(err.response?.data?.error || 'Failed to unmark lesson', { type: 'error' });
    } finally {
      setShowUnmarkConfirm(false);
    }
  };

  // Cleanup position save interval on unmount
  useEffect(() => {
    return () => { clearInterval(positionSaveRef.current); };
  }, []);

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get(`/lessons/${id}/summary`);
      setSummary(res.data);
    } catch { setSummary({ summary: 'No se pudo generar el resumen.', keyConcepts: '' }); }
    finally { setSummaryLoading(false); }
  };

  const handleDownload = () => {
    window.open(streamUrl, '_blank', 'noopener');
  };

  // Navigation helpers
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!lesson) return <div className="error">Lesson not found</div>;

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button onClick={() => navigate(`/course/${lesson?.courseId}`)} className="btn-back">
          ← Back to Course
        </button>

        {/* Course name link */}
        {courseData && (
          <div className="lesson-course-link">
            <Link to={`/course/${courseData.id}`}>{courseData.title}</Link>
          </div>
        )}

        {/* Lesson position indicator */}
        {allLessons.length > 0 && lessonIndex >= 0 && (
          <span className="lesson-position">
            Lección {lessonIndex + 1} de {allLessons.length}
          </span>
        )}

        <h1>{lesson?.title}</h1>
      </div>

      <div className="lesson-content">
        {lesson.lessonType === 'VIDEO' ? (
          <div className="video-container">
            <video controls width="100%" onEnded={markCompleted} crossOrigin="anonymous">
              <source src={videoSrc || streamUrl} type={ (() => {
                // Detectar mime desde fileUrl (presigned) o del streamUrl como fallback
                const url = lesson.fileUrl || streamUrl;
                const m = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                const ext = m ? m[1].toLowerCase() : '';
                const map = { mp4: 'video/mp4', m4v: 'video/x-m4v', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/quicktime' };
                return map[ext] || 'video/mp4';
              })() } />
            </video>

            {/* Play overlay for user gesture to start playback (improves autoplay behavior) */}
            {!isPlaying && isPlayable && (
              <div className="play-overlay" onClick={tryPlay} role="button" tabIndex={0}>
                ▶ Play
              </div>
            )}

            {!isPlayable && (
              <div className="video-fallback">
                <p>Este navegador no puede reproducir el formato de este video (probablemente codec). Puedes descargarlo y reproducirlo localmente o usar un navegador con soporte para este formato.</p>
                <button onClick={handleDownload} className="btn-download">Descargar video</button>
              </div>
            )}
          </div>
        ) : lesson.lessonType === 'PDF' ? (
          <div className="pdf-container">
            <iframe
              src={streamUrl}
              width="100%"
              height="800px"
              title={lesson.title}
            />
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-download"
            >
              Download PDF
            </a>
          </div>
        ) : lesson.lessonType === 'AUDIO' ? (
          <div className="audio-container">
            <audio controls style={{ width: '100%' }} onEnded={markCompleted}>
              <source src={streamUrl} />
              Tu navegador no soporta la reproducción de audio.
            </audio>
            <a href={streamUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
              Descargar audio
            </a>
          </div>
        ) : null}
      </div>

      <div className="lesson-actions">
        {user ? (
          lesson.completed ? (
            <>
              <button onClick={() => setShowUnmarkConfirm(true)} className="btn-complete btn-unmark">
                Unmark
              </button>
              {showUnmarkConfirm && (
                <ConfirmModal
                  title="Unmark lesson"
                  message="Are you sure you want to mark this lesson as incomplete? This will update your course progress."
                  onConfirm={unmarkCompleted}
                  onCancel={() => setShowUnmarkConfirm(false)}
                />
              )}
            </>
          ) : (
            <button onClick={markCompleted} className="btn-complete">
              Mark as Completed
            </button>
          )
        ) : (
          <p className="login-hint">
            <a href="/login">Inicia sesión</a> para registrar tu progreso en este curso.
          </p>
        )}
       </div>

      {/* AI Summary */}
      {features.aiTutor && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {!summary && (
            <button
              onClick={loadSummary}
              disabled={summaryLoading}
              className="btn-complete"
              style={{ background: 'var(--color-info)' }}
            >
              {summaryLoading ? 'Generando resumen...' : 'Resumir lección'}
            </button>
          )}
          {summary && (
            <div style={{
              marginTop: 12, padding: 20, background: 'var(--color-bg-alt)',
              borderRadius: 'var(--radius-lg)', textAlign: 'left', lineHeight: 1.6
            }}>
              <h3 style={{ margin: '0 0 12px', color: 'var(--color-text)' }}>Resumen</h3>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                {summary.summary}
              </div>
              {summary.keyConcepts && (
                <div style={{ marginTop: 12 }}>
                  <strong style={{ color: 'var(--color-text)', fontSize: 13 }}>Conceptos clave:</strong>
                  <p style={{ color: 'var(--color-primary)', fontSize: 13, margin: '4px 0 0' }}>{summary.keyConcepts}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Previous / Next lesson navigation */}
      {allLessons.length > 1 && (
        <div className="lesson-nav">
          <button
            className="btn-lesson-nav btn-prev"
            disabled={!prevLesson}
            onClick={() => prevLesson && navigate(`/lesson/${prevLesson.id}`)}
          >
            ← Anterior
          </button>
          <button
            className="btn-lesson-nav btn-next"
            disabled={!nextLesson}
            onClick={() => nextLesson && navigate(`/lesson/${nextLesson.id}`)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* AI Tutor floating chat */}
      {features.aiTutor && lesson && lesson.courseId && <AiTutor courseId={lesson.courseId} />}
    </div>
  );
}

export default Lesson;
