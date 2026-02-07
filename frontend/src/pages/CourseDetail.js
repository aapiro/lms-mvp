import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCourse();
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
      alert(err.response?.data?.error || 'Purchase failed');
      setPurchasing(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    // Backend marks free courses as purchased; however as a guard, allow access if price is 0
    const isFree = course.price === 0 || course.price === '0' || (typeof course.price === 'object' && course.price?.value === 0);
    if (course.purchased || isFree) {
      navigate(`/lesson/${lessonId}`);
    } else {
      alert('You need to purchase this course first');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!course) return <div className="error">Course not found</div>;

  return (
    <div className="course-detail-container">
      <button className="btn-back" onClick={() => navigate('/')}>← Back to Courses</button>
      <div className="course-header">
        <h1>{course.title}</h1>
        {/* Prominent Free badge */}
        {(course.price === 0 || course.price === '0') && <span className="badge-free header-badge">Free</span>}
        <div className="course-meta">
          <span>{course.description}</span>
          <div>{course.lessons && course.lessons.length} lessons</div>
        </div>
      </div>

      <div className="course-actions">
        {course.purchased ? (
          <div className="purchased-info">
            <span className="badge-owned">✓ Owned</span>
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${course.progressPercentage || 0}%` }}
                ></div>
              </div>
              <span>{course.progressPercentage || 0}% Complete</span>
            </div>
          </div>
        ) : (
          // if price is zero show Free label and no purchase button
          (course.price === 0 || course.price === '0') ? (
            <div className="purchase-section">
              <span className="price">Free</span>
            </div>
          ) : (
            <div className="purchase-section">
              <span className="price">${course.price}</span>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="btn-purchase"
              >
                {purchasing ? 'Processing...' : 'Purchase Course'}
              </button>
            </div>
          )
        )}
      </div>

      <div className="lessons-section">
        <h2>Course Content</h2>
        
        {course.lessons && course.lessons.length > 0 ? (
          <div className="lessons-list">
            {course.lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className={`lesson-item ${lesson.completed ? 'completed' : ''} ${!course.purchased ? 'locked' : ''}`}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div className="lesson-info">
                  <span className="lesson-icon">
                    {lesson.completed ? '✓' : lesson.lessonType === 'VIDEO' ? '▶' : '📄'}
                  </span>
                  <div>
                    <h3>{lesson.title}</h3>
                    <span className="lesson-meta">
                      {lesson.lessonType} 
                      {lesson.durationSeconds && ` • ${Math.floor(lesson.durationSeconds / 60)} min`}
                    </span>
                  </div>
                </div>
                {!(course.purchased || course.price === 0 || course.price === '0') && <span className="lock-icon">🔒</span>}
              </div>
            ))}
          </div>
        ) : (
          <p>No lessons available yet.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
