import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Nueva Contraseña</h1>
        {success ? (
          <div>
            <p style={{ textAlign: 'center', color: 'var(--color-success)', marginBottom: 20 }}>
              Contraseña restablecida exitosamente.
            </p>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
