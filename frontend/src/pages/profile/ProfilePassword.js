import React, { useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';

function ProfilePassword() {
  const { addToast } = useToast();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

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

  return (
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
  );
}

export default ProfilePassword;
