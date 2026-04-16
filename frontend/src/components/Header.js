import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './domain/NotificationBell';
import SearchBar from './domain/SearchBar';
import './Header.css';

function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">LMS Platform</Link>

        <SearchBar />

        {/* Hamburger button (mobile only) */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop nav */}
        <div className="header-actions desktop-nav">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && <NotificationBell />}

          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className="user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-greeting">Hola, {user.fullName}</span>
                <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown" role="menu">
                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                    Mi Perfil
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-separator" />
                  <button onClick={() => { setDropdownOpen(false); logout(); }} className="dropdown-item dropdown-logout" role="menuitem">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu} />}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <div className="mobile-user-info">
                <span className="user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
                <span>Hola, {user.fullName}</span>
              </div>
              <Link to="/profile" className="mobile-menu-item" onClick={closeMobileMenu}>Mi Perfil</Link>
              {isAdmin() && (
                <Link to="/admin" className="mobile-menu-item" onClick={closeMobileMenu}>Admin Panel</Link>
              )}
              <div className="dropdown-separator" />
              <button onClick={toggleTheme} className="mobile-menu-item">
                {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
              </button>
              <button onClick={() => { closeMobileMenu(); logout(); }} className="mobile-menu-item mobile-logout">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-item" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="mobile-menu-item" onClick={closeMobileMenu}>Register</Link>
              <button onClick={toggleTheme} className="mobile-menu-item">
                {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
