import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Lesson.css';

function Lesson() {
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

  useEffect(() => {
    loadLesson();
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
        videoEl.addEventListener('pause', () => setIsPlaying(false));
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

  const loadLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data);
      // prefer backend streaming endpoint which supports Range and avoids presigned URL issues
      setVideoSrc(`/api/lessons/${id}/stream`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    try {
      await api.post(`/progress/lessons/${id}/complete?courseId=${lesson.courseId}`);
      alert('Lesson marked as completed!');
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const handleDownload = () => {
    if (!lesson || !lesson.fileUrl) return;
    window.open(lesson.fileUrl, '_blank', 'noopener');
  };

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!lesson) return <div className="error">Lesson not found</div>;

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button onClick={() => navigate(`/course/${lesson?.courseId}`)} className="btn-back">
          ← Back to Course
        </button>
        <h1>{lesson?.title}</h1>
      </div>

      <div className="lesson-content">
        {lesson.lessonType === 'VIDEO' ? (
          <div className="video-container">
            <video controls width="100%" onEnded={markCompleted} crossOrigin="anonymous">
              <source src={videoSrc || lesson.fileUrl} type={ (() => {
                // guess mime from extension for the source type attribute
                const m = lesson.fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
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
              src={lesson.fileUrl} 
              width="100%" 
              height="800px"
              title={lesson.title}
            />
            <a 
              href={lesson.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-download"
            >
              Download PDF
            </a>
          </div>
        ) : null}
      </div>

      <div className="lesson-actions">
        <button onClick={markCompleted} className="btn-complete">
          Mark as Completed
        </button>
      </div>
    </div>
  );
}

export default Lesson;
