import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminStudents() {
  const { addToast } = useToast();

  const [students, setStudents] = useState([]);
  const [studentPage, setStudentPage] = useState(0);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  const [showStudentProgress, setShowStudentProgress] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileEditUserId, setProfileEditUserId] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', bio: '', avatarUrl: '' });

  useEffect(() => {
    loadStudents(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async (page = 0) => {
    setLoadingStudents(true);
    try {
      const q = studentSearch ? `&search=${encodeURIComponent(studentSearch)}` : '';
      const res = await api.get(`/admin/students?page=${page}&size=20${q}`);
      setStudents(res.data.content || res.data);
      setStudentPage(page);
    } catch (err) {
      addToast('Error cargando estudiantes', { type: 'error' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const openStudentDetail = async (id) => {
    try {
      const res = await api.get(`/admin/students/${id}`);
      setStudentDetail(res.data);
      setShowStudentDetail(true);
    } catch (err) {
      addToast('Error cargando detalle del estudiante', { type: 'error' });
    }
  };

  const openStudentProgress = async (id) => {
    try {
      const res = await api.get(`/admin/students/${id}/progress`);
      setStudentProgress(res.data);
      setShowStudentProgress(true);
    } catch (err) {
      addToast('Error cargando progreso', { type: 'error' });
    }
  };

  const openProfileEdit = (user) => {
    setProfileEditUserId(user.id);
    setProfileForm({ fullName: user.fullName || '', bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
    setShowProfileEdit(true);
  };

  const saveProfile = async () => {
    try {
      await api.put(`/admin/students/${profileEditUserId}/profile`, profileForm);
      addToast('Perfil actualizado', { type: 'success' });
      setShowProfileEdit(false);
      loadStudents(studentPage);
    } catch (err) {
      addToast('Error guardando perfil', { type: 'error' });
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.put(`/admin/management/users/${userId}/active`, { active: !currentActive });
      addToast(`Usuario ${!currentActive ? 'activado' : 'desactivado'}`, { type: 'success' });
      loadStudents(studentPage);
    } catch (err) {
      addToast('Error cambiando estado del usuario', { type: 'error' });
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Estudiantes</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button className="btn-create" onClick={() => loadStudents(0)}>Buscar</button>
      </div>
      {loadingStudents ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <div className="users-list">
          {students.length === 0 ? (
            <EmptyState icon="👥" title="Sin resultados" description="No se encontraron estudiantes." />
          ) : (
            students.map((s) => (
              <div key={s.id} className="admin-user-card">
                <div className="user-info">
                  <h3>{s.fullName}</h3>
                  <p>{s.email}</p>
                  <span className="meta">{s.role} • {s.isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="user-actions">
                  <button className="btn-detail" onClick={() => openStudentDetail(s.id)}>Ver detalle</button>
                  <button className="btn-create" onClick={() => openStudentProgress(s.id)}>Progreso</button>
                  <button className="btn-edit" onClick={() => openProfileEdit(s)}>Editar perfil</button>
                  <button
                    className={s.isActive ? 'btn-delete' : 'btn-submit'}
                    onClick={() => handleToggleActive(s.id, s.isActive)}
                  >
                    {s.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))
          )}
          <Pagination
            currentPage={studentPage}
            onPageChange={(page) => loadStudents(page)}
            hasMore={students.length >= 20}
          />
        </div>
      )}

      {/* Student Detail Modal */}
      <Modal
        isOpen={showStudentDetail && !!studentDetail}
        onClose={() => { setShowStudentDetail(false); setStudentDetail(null); }}
        title={studentDetail?.fullName || 'Detalle del Estudiante'}
      >
        {studentDetail && (
          <div>
            <p><strong>Email:</strong> {studentDetail.email}</p>
            <p><strong>Rol:</strong> {studentDetail.role}</p>
            <p><strong>Estado:</strong> {studentDetail.isActive ? 'Activo' : 'Inactivo'}</p>
            {studentDetail.bio && <p><strong>Bio:</strong> {studentDetail.bio}</p>}
            {studentDetail.lastLogin && <p><strong>Ultimo acceso:</strong> {new Date(studentDetail.lastLogin).toLocaleString()}</p>}
            <p><strong>Inscripciones:</strong> {studentDetail.enrollmentCount || 0}</p>
            <p><strong>Certificados:</strong> {studentDetail.certificateCount || 0}</p>
            {studentDetail.enrollments && studentDetail.enrollments.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Inscripciones</h4>
                {studentDetail.enrollments.map((enr, i) => (
                  <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <strong>{enr.courseTitle}</strong>
                    {' — '}{enr.progressPercent != null ? enr.progressPercent.toFixed(0) : 0}% completado
                    {enr.completedAt && <span className="meta"> • Completado {new Date(enr.completedAt).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Student Progress Modal */}
      <Modal
        isOpen={showStudentProgress}
        onClose={() => { setShowStudentProgress(false); setStudentProgress([]); }}
        title="Progreso del Estudiante"
      >
        <div>
          {studentProgress.length === 0 ? (
            <p>No hay progreso registrado.</p>
          ) : (
            studentProgress.map((prog, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 4 }}>{prog.courseTitle}</h4>
                <div style={{ background: '#eee', borderRadius: 4, height: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${prog.progressPercent || 0}%`, height: '100%', background: '#667eea' }} />
                </div>
                <span className="meta">{prog.completedLessons}/{prog.totalLessons} lecciones • {prog.progressPercent != null ? prog.progressPercent.toFixed(0) : 0}%</span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        title="Editar Perfil"
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre completo</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>URL de Avatar</label>
            <input
              type="text"
              value={profileForm.avatarUrl}
              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-submit" onClick={saveProfile}>Guardar</button>
            <button className="btn-cancel" onClick={() => setShowProfileEdit(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStudents;
