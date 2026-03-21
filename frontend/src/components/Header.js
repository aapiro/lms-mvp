import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">LMS Platform</Link>
        <div className="header-actions">
          {user ? (
            <>
              <span>Hola, {user.fullName}</span>
              <Link to="/profile" className="btn-profile">Mi Perfil</Link>
              {isAdmin() && <Link to="/admin" className="btn-admin">Admin Panel</Link>}
              <button onClick={logout} className="btn-logout">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
