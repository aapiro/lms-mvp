import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import '../Admin.css';

function AdminUsers() {
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'USER' });
  const [userErrors, setUserErrors] = useState({ fullName: '', email: '', password: '' });
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const errors = { fullName: '', email: '', password: '' };
    if (!userForm.fullName || userForm.fullName.trim().length < 2) {
      errors.fullName = 'Nombre requerido (min 2 caracteres)';
    }
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!userForm.email || !emailRe.test(userForm.email)) {
      errors.email = 'Email invalido';
    }
    if (!isEditingUser) {
      if (!userForm.password || userForm.password.length < 8) {
        errors.password = 'Contrasena requerida (minimo 8 caracteres)';
      }
    } else {
      if (userForm.password && userForm.password.length > 0 && userForm.password.length < 8) {
        errors.password = 'Si cambia la contrasena, debe tener al menos 8 caracteres';
      }
    }

    setUserErrors(errors);
    if (errors.fullName || errors.email || errors.password) {
      addToast('Por favor corrige los campos del formulario', { type: 'error' });
      return;
    }

    try {
      if (isEditingUser && editingUserId) {
        const payload = { fullName: userForm.fullName, email: userForm.email, role: userForm.role };
        if (userForm.password) payload.password = userForm.password;
        await api.put(`/admin/users/${editingUserId}`, payload);
        addToast('Usuario actualizado correctamente', { type: 'success' });
      } else {
        await api.post('/admin/users', userForm);
        addToast('Usuario creado correctamente', { type: 'success' });
      }

      setUserForm({ fullName: '', email: '', password: '', role: 'USER' });
      setShowUserForm(false);
      setIsEditingUser(false);
      setEditingUserId(null);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error || (isEditingUser ? 'Error actualizando usuario' : 'Error creando usuario');
      addToast(msg, { type: 'error' });
    }
  };

  const handleEditUserClick = (user) => {
    setIsEditingUser(true);
    setEditingUserId(user.id);
    setUserForm({ fullName: user.fullName || '', email: user.email || '', password: '', role: user.role || 'USER' });
    setShowUserForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      addToast('Usuario eliminado', { type: 'success' });
      loadUsers();
    } catch (err) {
      addToast('No se pudo eliminar el usuario', { type: 'error' });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const openUserDetail = (id) => {
    const u = users.find((x) => Number(x.id) === Number(id));
    if (u) {
      setUserDetail(u);
      setShowUserDetail(true);
    } else {
      loadUsers().then(() => {
        const uu = users.find((x) => Number(x.id) === Number(id));
        if (uu) {
          setUserDetail(uu);
          setShowUserDetail(true);
        } else {
          addToast('Usuario no encontrado', { type: 'error' });
        }
      });
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Usuarios</h2>
        <button onClick={() => { setIsEditingUser(false); setEditingUserId(null); setUserForm({ fullName: '', email: '', password: '', role: 'USER' }); setShowUserForm(!showUserForm); }} className="btn-create">
          {showUserForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {showUserForm && (
        <form onSubmit={handleSaveUser} className="admin-form">
          <input
            type="text"
            placeholder="Full Name"
            value={userForm.fullName}
            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            required
          />
          {userErrors.fullName && <div className="field-error">{userErrors.fullName}</div>}
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />
          {userErrors.email && <div className="field-error">{userErrors.email}</div>}
          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            autoComplete="new-password"
          />
          {userErrors.password && <div className="field-error">{userErrors.password}</div>}
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            className="role-select"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-submit">{isEditingUser ? 'Update User' : 'Create User'}</button>
            <button type="button" className="btn-cancel" onClick={() => { setShowUserForm(false); setIsEditingUser(false); setEditingUserId(null); setUserForm({ fullName: '', email: '', password: '', role: 'USER' }); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="admin-user-card">
            <div className="user-info">
              <h3>{user.fullName}</h3>
              <p>{user.email}</p>
              <span className="meta">{user.role}</span>
            </div>
            <div className="user-actions">
              <button
                onClick={() => openUserDetail(user.id)}
                className="btn-detail"
              >
                Ver detalle
              </button>
              <button
                onClick={() => handleEditUserClick(user)}
                className="btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDeleteId(user.id)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserDetail && !!userDetail}
        onClose={() => { setShowUserDetail(false); setUserDetail(null); }}
        title={userDetail?.fullName || 'Detalle del Usuario'}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-edit" onClick={() => { setShowUserDetail(false); setUserDetail(null); handleEditUserClick(userDetail); }}>Editar</button>
            <button className="btn-cancel" onClick={() => { setShowUserDetail(false); setUserDetail(null); }}>Cerrar</button>
          </div>
        }
      >
        {userDetail && (
          <div>
            <p><strong>Email:</strong> {userDetail.email}</p>
            <p><strong>Rol:</strong> {userDetail.role}</p>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar usuario"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
            <button className="btn-delete" onClick={() => handleDeleteUser(confirmDeleteId)}>Eliminar</button>
          </div>
        }
      >
        <p>¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}

export default AdminUsers;
