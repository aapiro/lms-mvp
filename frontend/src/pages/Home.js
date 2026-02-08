import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    loadCourses();

    const handler = (e) => {
      try {
        const detail = e.detail;
        if (detail && detail.courseId) {
          // reload courses to pick updated progress
          loadCourses();
        }
      } catch (err) { /* ignore */ }
    };

    window.addEventListener('courseProgressUpdated', handler);
    return () => window.removeEventListener('courseProgressUpdated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dev helper: quick login as admin when running locally
  const devLoginAdmin = async () => {
    try {
      const res = await api.post('/auth/login', { email: 'admin@lms.com', password: 'admin123' });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/admin';
    } catch (e) {
      console.error('Dev login failed', e);
      alert('Dev login failed');
    }
  };

  const enableDevLogin = process.env.REACT_APP_ENABLE_DEV_LOGIN === 'true';

  return (
    <div className="home-container">

      {/* Dev login button, visible only if REACT_APP_ENABLE_DEV_LOGIN=true at build time */}
      { enableDevLogin && (
        <div style={{ padding: 12 }}>
          <button onClick={devLoginAdmin} className="btn-create">Dev: Login as admin</button>
        </div>
      )}

      <main className="main-content">
        <h2>Available Courses</h2>
        
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="price">{course.price === 0 || course.price === '0' ? 'Free' : `$${course.price}`}</span>
                    <span className="lessons">{course.lessonCount} lessons</span>
                  </div>
                  {course.purchased && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progressPercentage || 0}%` }}
                      ></div>
                      <span className="progress-text">{course.progressPercentage || 0}% Complete</span>
                    </div>
                  )}
                </div>
                <Link to={`/course/${course.id}`} className="btn-view">
                  {course.purchased ? 'Continue Learning' : 'View Details'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
