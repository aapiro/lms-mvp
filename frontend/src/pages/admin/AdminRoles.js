import React, { useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import '../Admin.css';

function AdminRoles() {
  const { addToast } = useToast();

  const [mgmtUserId, setMgmtUserId] = useState('');
  const [mgmtNewRole, setMgmtNewRole] = useState('STUDENT');
  const [certUserId, setCertUserId] = useState('');
  const [certCourseId, setCertCourseId] = useState('');
  const [showConfirmRole, setShowConfirmRole] = useState(false);

  const requestChangeRole = () => {
    if (!mgmtUserId.trim()) {
      addToast('Ingrese un User ID', { type: 'error' });
      return;
    }
    setShowConfirmRole(true);
  };

  const handleChangeRole = async () => {
    setShowConfirmRole(false);
    try {
      await api.put(`/admin/management/users/${mgmtUserId}/role`, { role: mgmtNewRole });
      addToast('Rol actualizado correctamente', { type: 'success' });
      setMgmtUserId('');
      setMgmtNewRole('STUDENT');
    } catch (err) {
      addToast('Error al cambiar rol', { type: 'error' });
      console.error('Error changing role:', err);
    }
  };

  const handleIssueCertificate = async () => {
    if (!certUserId.trim() || !certCourseId.trim()) {
      addToast('Ingrese User ID y Course ID', { type: 'error' });
      return;
    }

    try {
      await api.post(`/admin/management/certificates/${certUserId}/${certCourseId}`);
      addToast('Certificado emitido correctamente', { type: 'success' });
      setCertUserId('');
      setCertCourseId('');
    } catch (err) {
      addToast('Error al emitir certificado', { type: 'error' });
      console.error('Error issuing certificate:', err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Gestion de Roles y Permisos</h2>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <h3>Cambiar Rol de Usuario</h3>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={mgmtUserId}
              onChange={(e) => setMgmtUserId(e.target.value)}
              placeholder="ID del usuario"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Nuevo Rol</label>
            <select
              value={mgmtNewRole}
              onChange={(e) => setMgmtNewRole(e.target.value)}
              className="form-input"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="INSTRUCTOR">INSTRUCTOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button className="btn btn--primary" onClick={requestChangeRole}>
            Cambiar Rol
          </button>
        </div>

        <div className="admin-card">
          <h3>Emitir Certificado</h3>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={certUserId}
              onChange={(e) => setCertUserId(e.target.value)}
              placeholder="ID del usuario"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Course ID</label>
            <input
              type="text"
              value={certCourseId}
              onChange={(e) => setCertCourseId(e.target.value)}
              placeholder="ID del curso"
              className="form-input"
            />
          </div>
          <button className="btn btn--primary" onClick={handleIssueCertificate}>
            Emitir Certificado
          </button>
        </div>
      </div>

      {/* Confirm Role Change Modal */}
      <Modal
        isOpen={showConfirmRole}
        onClose={() => setShowConfirmRole(false)}
        title="Cambiar Rol"
      >
        <p>Cambiar rol del usuario {mgmtUserId} a {mgmtNewRole}?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn--outline" onClick={() => setShowConfirmRole(false)}>Cancelar</button>
          <button className="btn btn--primary" onClick={handleChangeRole}>Confirmar</button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminRoles;
