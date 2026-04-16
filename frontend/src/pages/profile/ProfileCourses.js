import React from 'react';
import { Link } from 'react-router-dom';

function ProfileCourses({ enrollments }) {
  const statusLabel = (status) => {
    const map = { NOT_STARTED: 'No iniciado', IN_PROGRESS: 'En progreso', COMPLETED: 'Completado' };
    return map[status] || status;
  };

  const statusClass = (status) => {
    const map = { NOT_STARTED: 'status-not-started', IN_PROGRESS: 'status-in-progress', COMPLETED: 'status-completed' };
    return map[status] || '';
  };

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h3>Mis Cursos</h3>
        <Link to="/" className="btn-browse">Explorar más cursos</Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="empty-state">
          <p>Aún no estás inscrito en ningún curso.</p>
          <Link to="/" className="btn-browse">Explorar cursos</Link>
        </div>
      ) : (
        <div className="courses-list">
          {enrollments.map((enrollment) => (
            <div key={enrollment.courseId} className="enrollment-card">
              <div className="enrollment-info">
                <h4>{enrollment.courseTitle}</h4>
                <div className="enrollment-meta">
                  <span className={`enrollment-status ${statusClass(enrollment.status)}`}>
                    {statusLabel(enrollment.status)}
                  </span>
                  <span className="enrollment-lessons">
                    {enrollment.completedLessons}/{enrollment.totalLessons} lecciones
                  </span>
                  {enrollment.purchasedAt && (
                    <span className="enrollment-date">
                      Inscrito: {new Date(enrollment.purchasedAt).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
                <div className="enrollment-progress-bar">
                  <div
                    className="enrollment-progress-fill"
                    style={{ width: `${enrollment.completionPercentage || 0}%` }}
                  />
                </div>
                <span className="enrollment-pct">{enrollment.completionPercentage || 0}% completado</span>
              </div>
              <Link to={`/course/${enrollment.courseId}`} className="btn-continue">
                {enrollment.status === 'COMPLETED' ? 'Ver curso' : 'Continuar'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileCourses;
