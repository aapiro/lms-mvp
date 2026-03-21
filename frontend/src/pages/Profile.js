import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Edit profile form
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  // Change password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
      setEditForm({
        fullName: res.data.fullName || '',
        bio: res.data.bio || '',
        avatarUrl: res.data.avatarUrl || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      addToast('No se pudo cargar el perfil', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', editForm);
      setProfile(res.data);
      setEditMode(false);
      addToast('Perfil actualizado correctamente', { type: 'success' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al actualizar el perfil', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Las contraseñas no coinciden');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Contraseña cambiada correctamente', { type: 'success' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setPwSaving(false);
    }
  };

  const statusLabel = (status) => {
    const map = { NOT_STARTED: 'No iniciado', IN_PROGRESS: 'En progreso', COMPLETED: 'Completado' };
    return map[status] || status;
  };

  const statusClass = (status) => {
    const map = { NOT_STARTED: 'status-not-started', IN_PROGRESS: 'status-in-progress', COMPLETED: 'status-completed' };
    return map[status] || '';
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-avatar-wrapper">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {(profile.fullName || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="profile-name">{profile.fullName}</h2>
        <p className="profile-email">{profile.email}</p>
        <span className="profile-role-badge">{profile.role}</span>

        <nav className="profile-nav">
          <button
            className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            👤 Mi Información
          </button>
          <button
            className={`profile-nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 Mis Cursos
            {profile.enrollments && profile.enrollments.length > 0 && (
              <span className="profile-nav-badge">{profile.enrollments.length}</span>
            )}
          </button>
          <button
            className={`profile-nav-item ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            🏆 Certificados
            {profile.certificates && profile.certificates.length > 0 && (
              <span className="profile-nav-badge">{profile.certificates.length}</span>
            )}
          </button>
          <button
            className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Cambiar Contraseña
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="profile-main">

        {/* ── INFORMACIÓN ── */}
        {activeTab === 'info' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h3>Mi Información</h3>
              {!editMode && (
                <button className="btn-edit" onClick={() => setEditMode(true)}>Editar</button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Biografía</label>
                  <textarea
                    rows={4}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div className="form-group">
                  <label>URL del avatar</label>
                  <input
                    type="url"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="info-label">Nombre</span>
                  <span className="info-value">{profile.fullName}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Rol</span>
                  <span className="info-value">{profile.role}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Miembro desde</span>
                  <span className="info-value">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : '—'}
                  </span>
                </div>
                {profile.lastLogin && (
                  <div className="profile-info-item">
                    <span className="info-label">Último acceso</span>
                    <span className="info-value">
                      {new Date(profile.lastLogin).toLocaleString('es-ES')}
                    </span>
                  </div>
                )}
                {profile.bio && (
                  <div className="profile-info-item full-width">
                    <span className="info-label">Biografía</span>
                    <span className="info-value">{profile.bio}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MIS CURSOS ── */}
        {activeTab === 'courses' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h3>Mis Cursos</h3>
              <Link to="/" className="btn-browse">Explorar más cursos</Link>
            </div>

            {!profile.enrollments || profile.enrollments.length === 0 ? (
              <div className="empty-state">
                <p>Aún no estás inscrito en ningún curso.</p>
                <Link to="/" className="btn-browse">Explorar cursos</Link>
              </div>
            ) : (
              <div className="courses-list">
                {profile.enrollments.map((enrollment) => (
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
        )}

        {/* ── CERTIFICADOS ── */}
        {activeTab === 'certificates' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h3>Mis Certificados</h3>
            </div>

            {!profile.certificates || profile.certificates.length === 0 ? (
              <div className="empty-state">
                <p>Aún no tienes certificados. ¡Completa un curso para obtener el tuyo!</p>
              </div>
            ) : (
              <div className="certificates-list">
                {profile.certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="certificate-icon">🏆</div>
                    <div className="certificate-info">
                      <h4>{cert.courseTitle}</h4>
                      <p className="certificate-date">
                        Emitido el{' '}
                        {new Date(cert.issueDate).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                    {cert.certificateUrl && (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download-cert"
                      >
                        Ver certificado
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CAMBIAR CONTRASEÑA ── */}
        {activeTab === 'password' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h3>Cambiar Contraseña</h3>
            </div>
            <form onSubmit={handleChangePassword} className="profile-form">
              {pwError && <div className="error-message">{pwError}</div>}
              <div className="form-group">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={pwSaving}>
                  {pwSaving ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;


