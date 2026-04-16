import React, { useState } from 'react';
import { useToast } from '../../components/ToastProvider';
import api from '../../api/api';

function ProfileInfo({ profile, onProfileUpdate }) {
  const { addToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', editForm);
      onProfileUpdate(res.data);
      setEditMode(false);
      addToast('Perfil actualizado correctamente', { type: 'success' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al actualizar el perfil', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
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
            <button type="button" className="btn-cancel" onClick={() => setEditMode(false)} disabled={saving}>
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
  );
}

export default ProfileInfo;
