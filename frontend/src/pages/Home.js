import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterEnrollment, setFilterEnrollment] = useState('');
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    loadCourses();
    api.get('/courses/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/courses/tags').then(r => setTags(r.data)).catch(() => {});

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

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterTag, filterEnrollment]);

  const loadCourses = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterTag) params.tag = filterTag;
      if (filterEnrollment) params.enrollmentType = filterEnrollment;
      const response = await api.get('/courses', { params });
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

        {/* Filters */}
        <div className="course-filters">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">Todas las etiquetas</option>
            {tags.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
          <select value={filterEnrollment} onChange={e => setFilterEnrollment(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="OPEN">Abiertos</option>
            <option value="PAID">De pago</option>
            <option value="INVITE_ONLY">Por invitación</option>
          </select>
          {(filterCategory || filterTag || filterEnrollment) && (
            <button className="btn-clear-filters" onClick={() => { setFilterCategory(''); setFilterTag(''); setFilterEnrollment(''); }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-info">
                  <div className="course-title-row">
                    <h3>{course.title}</h3>
                    {course.status && course.status !== 'PUBLISHED' && (
                      <span className={`badge-status badge-${course.status.toLowerCase()}`}>{course.status}</span>
                    )}
                  </div>
                  <p>{course.description}</p>
                  {(course.categories?.length > 0 || course.tags?.length > 0) && (
                    <div className="course-taxonomy">
                      {course.categories?.map(cat => <span key={cat} className="badge-cat">{cat}</span>)}
                      {course.tags?.map(tag => <span key={tag} className="badge-tag">{tag}</span>)}
                    </div>
                  )}
                  <div className="course-meta">
                    <span className="price">{course.price === 0 || course.price === '0' ? 'Free' : `$${course.price}`}</span>
                    <span className="lessons">{course.lessonCount} lessons</span>
                    {course.enrollmentType === 'INVITE_ONLY' && <span className="badge-invite">Solo invitados</span>}
                    {course.capacityLimit && (
                      <span className="badge-capacity">{course.enrolledCount}/{course.capacityLimit} plazas</span>
                    )}
                  </div>
                  {course.purchased && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progressPercentage || 0}%` }}></div>
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
