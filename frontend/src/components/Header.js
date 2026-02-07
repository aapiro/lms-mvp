import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1>LMS Platform</h1>
        <div className="header-actions">
          {user ? (
            <>
              <span>Welcome, {user.fullName}</span>
              {isAdmin() && <Link to="/admin" className="btn-admin">Admin Panel</Link>}
              <button onClick={logout} className="btn-logout">Logout</button>
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
