import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminInstructors() {
  const { addToast } = useToast();

  const [instructors, setInstructors] = useState([]);
  const [instructorPage, setInstructorPage] = useState(0);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [showInstructorDetail, setShowInstructorDetail] = useState(false);
  const [instructorDetail, setInstructorDetail] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileEditUserId, setProfileEditUserId] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', bio: '', avatarUrl: '' });

  useEffect(() => {
    loadInstructors(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInstructors = async (page = 0) => {
    setLoadingInstructors(true);
    try {
      const q = instructorSearch ? `&search=${encodeURIComponent(instructorSearch)}` : '';
      const res = await api.get(`/admin/instructors?page=${page}&size=20${q}`);
      setInstructors(res.data.content || res.data);
      setInstructorPage(page);
    } catch (err) {
      addToast('Error cargando instructores', { type: 'error' });
    } finally {
      setLoadingInstructors(false);
    }
  };

  const openInstructorDetail = async (id) => {
    try {
      const res = await api.get(`/admin/instructors/${id}`);
      setInstructorDetail(res.data);
      setShowInstructorDetail(true);
    } catch (err) {
      addToast('Error cargando detalle del instructor', { type: 'error' });
    }
  };

  const openProfileEdit = (user) => {
    setProfileEditUserId(user.id);
    setProfileForm({ fullName: user.fullName || '', bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
    setShowProfileEdit(true);
  };

  const saveProfile = async () => {
    try {
      await api.put(`/admin/instructors/${profileEditUserId}/profile`, profileForm);
      addToast('Perfil actualizado', { type: 'success' });
      setShowProfileEdit(false);
      loadInstructors(instructorPage);
    } catch (err) {
      addToast('Error guardando perfil', { type: 'error' });
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Instructores</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={instructorSearch}
          onChange={(e) => setInstructorSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button className="btn-create" onClick={() => loadInstructors(0)}>Buscar</button>
      </div>
      {loadingInstructors ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <div className="users-list">
          {instructors.length === 0 ? (
            <EmptyState icon="👥" title="Sin resultados" description="No se encontraron instructores." />
          ) : (
            instructors.map((ins) => (
              <div key={ins.id} className="admin-user-card">
                <div className="user-info">
                  <h3>{ins.fullName}</h3>
                  <p>{ins.email}</p>
                  <span className="meta">{ins.role} • {ins.courseCount || 0} cursos</span>
                </div>
                <div className="user-actions">
                  <button className="btn-detail" onClick={() => openInstructorDetail(ins.id)}>Ver detalle</button>
                  <button className="btn-edit" onClick={() => openProfileEdit(ins)}>Editar perfil</button>
                </div>
              </div>
            ))
          )}
          <Pagination
            currentPage={instructorPage}
            onPageChange={(page) => loadInstructors(page)}
            hasMore={instructors.length >= 20}
          />
        </div>
      )}

      {/* Instructor Detail Modal */}
      <Modal
        isOpen={showInstructorDetail && !!instructorDetail}
        onClose={() => { setShowInstructorDetail(false); setInstructorDetail(null); }}
        title={instructorDetail?.fullName || 'Detalle del Instructor'}
      >
        {instructorDetail && (
          <div>
            <p><strong>Email:</strong> {instructorDetail.email}</p>
            <p><strong>Rol:</strong> {instructorDetail.role}</p>
            {instructorDetail.bio && <p><strong>Bio:</strong> {instructorDetail.bio}</p>}
            {instructorDetail.lastLogin && <p><strong>Ultimo acceso:</strong> {new Date(instructorDetail.lastLogin).toLocaleString()}</p>}
            <p><strong>Cursos asignados:</strong> {instructorDetail.courseCount || 0}</p>
            {instructorDetail.courses && instructorDetail.courses.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Cursos</h4>
                {instructorDetail.courses.map((c, i) => (
                  <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <strong>{c.title}</strong>
                    <span className="meta"> • {c.enrollmentCount || 0} estudiantes</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

export default AdminInstructors;
