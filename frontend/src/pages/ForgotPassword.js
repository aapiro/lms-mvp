import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError('Error al enviar solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Recuperar Contraseña</h1>
        {sent ? (
          <div>
            <p style={{ textAlign: 'center', color: 'var(--color-success)', marginBottom: 20 }}>
              Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
            <div className="auth-link">
              <Link to="/login">Volver al login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
