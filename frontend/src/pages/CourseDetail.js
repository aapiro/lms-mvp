import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import Assessments from './Assessments';
import CourseReviews from '../components/domain/CourseReviews';
import AiTutor from '../components/domain/AiTutor';
import { useFeatures } from '../context/FeatureContext';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = useFeatures();
  const { addToast } = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadCourse closes over id; listing it would duplicate [id]
  }, [id]);

  useEffect(() => {
    // Listen for progress updates (dispatched from Lesson page)
    const handler = (e) => {
      try {
        const detail = e.detail;
        if (detail && detail.courseId && Number(detail.courseId) === Number(id)) {
          loadCourse();
        }
      } catch (err) {
        /* ignore */
      }
    };

    window.addEventListener('courseProgressUpdated', handler);
    return () => window.removeEventListener('courseProgressUpdated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const response = await api.post(`/payments/checkout/${id}`);
      window.location.href = response.data.url;
    } catch (err) {
      addToast(err.response?.data?.error || 'Purchase failed', { type: 'error' });
      setPurchasing(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    // Backend marks free courses as purchased; however as a guard, allow access if price is 0
    const isFree = course.price === 0 || course.price === '0' || (typeof course.price === 'object' && course.price?.value === 0);
    if (course.purchased || isFree) {
      navigate(`/lesson/${lessonId}`);
    } else {
      addToast('You need to purchase this course first', { type: 'error' });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!course) return <div className="error">Course not found</div>;

  const isFree = course.price === 0 || course.price === '0';

  // Helper: get lesson icon
  const getLessonIcon = (lesson) => {
    if (lesson.completed) return '✓';
    if (!lesson.available) return '🔒';
    if (lesson.lessonType === 'VIDEO') return '▶';
    if (lesson.lessonType === 'AUDIO') return '🎵';
    return '📄';
  };

  // Render a single lesson row
  const LessonRow = ({ lesson }) => (
    <div
      key={lesson.id}
      className={`lesson-item ${lesson.completed ? 'completed' : ''} ${!lesson.available ? 'drip-locked' : ''} ${!course.purchased && !isFree ? 'locked' : ''}`}
      onClick={() => lesson.available && handleLessonClick(lesson.id)}
      style={{ cursor: lesson.available ? 'pointer' : 'default' }}
    >
      <div className="lesson-info">
        <span className="lesson-icon">{getLessonIcon(lesson)}</span>
        <div>
          <h3>{lesson.title}</h3>
          <span className="lesson-meta">
            {lesson.lessonType}
            {lesson.durationSeconds && ` • ${Math.floor(lesson.durationSeconds / 60)} min`}
            {!lesson.available && lesson.availableFrom && (
              <span className="drip-lock"> — Disponible el {new Date(lesson.availableFrom).toLocaleDateString()}</span>
            )}
            {!lesson.available && lesson.releaseAfterDays && !lesson.availableFrom && (
              <span className="drip-lock"> — Disponible {lesson.releaseAfterDays} días tras la inscripción</span>
            )}
          </span>
        </div>
      </div>
      {!lesson.available && <span className="lock-icon">🔒</span>}
      {lesson.available && !(course.purchased || isFree) && <span className="lock-icon">🔒</span>}
    </div>
  );

  return (
    <div className="course-detail-container">
      <button className="btn-back" onClick={() => navigate('/')}>← Back to Courses</button>

      <div className="course-header">
        <div className="course-title-row">
          <h1>{course.title}</h1>
          {isFree && <span className="badge-free header-badge">Free</span>}
          {course.enrollmentType === 'INVITE_ONLY' && <span className="badge-invite">Solo invitados</span>}
        </div>
        {(course.categories?.length > 0 || course.tags?.length > 0) && (
          <div className="course-taxonomy">
            {course.categories?.map(cat => <span key={cat} className="badge-cat">{cat}</span>)}
            {course.tags?.map(tag => <span key={tag} className="badge-tag">{tag}</span>)}
          </div>
        )}
        <div className="course-meta">
          <span>{course.description}</span>
          <div>
            {course.lessons && course.lessons.length} lessons
            {course.capacityLimit && (
              <span className="badge-capacity" style={{ marginLeft: 8 }}>
                {course.enrolledCount}/{course.capacityLimit} plazas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prerequisites warning */}
      {!course.prerequisitesMet && course.prerequisites?.length > 0 && (
        <div className="prereq-warning">
          <strong>⚠️ Prerrequisitos pendientes:</strong>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {course.prerequisites.filter(p => !p.completed).map(p => (
              <Link key={p.courseId} to={`/course/${p.courseId}`} className="prereq-link">
                {p.courseTitle}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="course-actions">
        {course.purchased && user ? (
          <div className="purchased-info">
            <span className="badge-owned">✓ Owned</span>
            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${course.progressPercentage || 0}%` }}></div>
              </div>
              <span>{course.progressPercentage || 0}% Complete</span>
            </div>
          </div>
        ) : isFree ? (
          <div className="purchase-section"><span className="price">Free</span></div>
        ) : (
          <div className="purchase-section" style={{ flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span className="price">
                {couponDiscount ? (
                  <>
                    <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 8 }}>${course.price}</span>
                    ${(course.price * (1 - couponDiscount / 100)).toFixed(2)}
                  </>
                ) : `$${course.price}`}
              </span>
              <button onClick={handlePurchase} disabled={purchasing} className="btn-purchase">
                {purchasing ? 'Processing...' : 'Comprar Curso'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
              <input
                type="text"
                placeholder="Código de cupón"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--color-input-border)', borderRadius: 'var(--radius-md)', fontSize: 13 }}
              />
              <button
                onClick={async () => {
                  setCouponError('');
                  setCouponDiscount(null);
                  if (!couponCode.trim()) return;
                  try {
                    const res = await api.post('/coupons/validate', { code: couponCode.trim() });
                    setCouponDiscount(res.data.discountPercent);
                    addToast(`Cupón aplicado: ${res.data.discountPercent}% de descuento`, { type: 'success' });
                  } catch (err) {
                    setCouponError(err.response?.data?.error || 'Cupón no válido');
                    setCouponDiscount(null);
                  }
                }}
                className="btn-create"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                Aplicar
              </button>
            </div>
            {couponError && <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>{couponError}</span>}
            {couponDiscount && <span style={{ color: 'var(--color-success)', fontSize: 12, fontWeight: 600 }}>Descuento del {couponDiscount}% aplicado</span>}
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => handleTabChange('lessons')}>Lessons</button>
        <button className={`tab ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => handleTabChange('assessments')}>Assessments</button>
        {features.reviews && <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}>Reseñas</button>}
      </div>

      <div className="content-section">
        {activeTab === 'lessons' && (
          <div className="lessons-section">
            <h2>Course Content</h2>

            {/* If modules exist, group lessons by module */}
            {course.modules && course.modules.length > 0 ? (
              course.modules.map(mod => (
                <div key={mod.id} className="module-section">
                  <h3 className="module-title">{mod.title}</h3>
                  {mod.description && <p className="module-description">{mod.description}</p>}
                  <div className="lessons-list">
                    {mod.lessons && mod.lessons.length > 0
                      ? mod.lessons.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)
                      : <p style={{ color: '#999', padding: '8px 0' }}>No hay lecciones en este módulo.</p>
                    }
                  </div>
                </div>
              ))
            ) : (
              /* Flat list (backward compat) */
              course.lessons && course.lessons.length > 0 ? (
                <div className="lessons-list">
                  {course.lessons.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)}
                </div>
              ) : (
                <p>No lessons available yet.</p>
              )
            )}
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="assessments-section">
            <h2>Assessments</h2>
            <Assessments courseId={course.id} />
          </div>
        )}

        {activeTab === 'reviews' && features.reviews && (
          <div className="lessons-section">
            <CourseReviews courseId={course.id} userHasPurchased={course.purchased} />
          </div>
        )}
      </div>

      {/* AI Tutor floating chat */}
      {features.aiTutor && <AiTutor courseId={course.id} />}
    </div>
  );
}

export default CourseDetail;
