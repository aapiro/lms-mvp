import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const features = useFeatures();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, statsRes] = await Promise.all([
        api.get('/dashboard'),
        features.gamification ? api.get('/gamification/stats').catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      setData(dashRes.data);
      setStats(statsRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (!data) return <div className="error">No se pudo cargar el dashboard.</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Hola, {user?.fullName || 'Estudiante'}</h1>
        <p>Bienvenido de vuelta a tu espacio de aprendizaje.</p>
      </div>

      {/* Quick stats */}
      {stats && features.gamification && (
        <div className="dashboard-stats-row">
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🎯</span>
            <div className="dash-stat-info">
              <strong>{stats.totalXp} XP</strong>
              <span>Nivel {stats.level}</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🔥</span>
            <div className="dash-stat-info">
              <strong>{stats.currentStreak} días</strong>
              <span>Racha actual</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🏆</span>
            <div className="dash-stat-info">
              <strong>{stats.badgeCount}</strong>
              <span>Logros</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">📚</span>
            <div className="dash-stat-info">
              <strong>{data.totalEnrolled}</strong>
              <span>Cursos</span>
            </div>
          </div>
        </div>
      )}

      {/* Courses in progress */}
      <section className="dashboard-section">
        <h2>Continuar Aprendiendo</h2>
        {data.enrolledCourses.length === 0 ? (
          <div className="dash-empty">
            <p>Aún no te has inscrito en ningún curso.</p>
            <Link to="/" className="dash-browse-btn">Explorar cursos</Link>
          </div>
        ) : (
          <div className="dash-courses-grid">
            {data.enrolledCourses.map(course => (
              <Link key={course.courseId} to={`/course/${course.courseId}`} className="dash-course-card">
                <h3>{course.title}</h3>
                <p>{course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}</p>
                <span className="dash-course-action">Continuar &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <section className="dashboard-section">
          <h2>Cursos Sugeridos</h2>
          <div className="dash-courses-grid">
            {data.suggestions.map(course => (
              <Link key={course.id} to={`/course/${course.id}`} className="dash-suggestion-card">
                <h3>{course.title}</h3>
                <span className="dash-price">
                  {course.price === 0 || course.price === '0' ? 'Gratis' : `$${course.price}`}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
