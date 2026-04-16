import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import ProfileInfo from './profile/ProfileInfo';
import ProfileCourses from './profile/ProfileCourses';
import ProfileCertificates from './profile/ProfileCertificates';
import ProfilePassword from './profile/ProfilePassword';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Error loading profile:', err);
      addToast('No se pudo cargar el perfil', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (!profile) return null;

  const tabs = [
    { key: 'info', label: '👤 Mi Información' },
    { key: 'courses', label: '📚 Mis Cursos', badge: profile.enrollments?.length },
    { key: 'certificates', label: '🏆 Certificados', badge: profile.certificates?.length },
    { key: 'password', label: '🔒 Cambiar Contraseña' },
  ];

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-avatar-wrapper">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {(profile.fullName || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="profile-name">{profile.fullName}</h2>
        <p className="profile-email">{profile.email}</p>
        <span className="profile-role-badge">{profile.role}</span>

        <nav className="profile-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`profile-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.badge > 0 && <span className="profile-nav-badge">{tab.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="profile-main">
        {activeTab === 'info' && (
          <ProfileInfo profile={profile} onProfileUpdate={setProfile} />
        )}
        {activeTab === 'courses' && (
          <ProfileCourses enrollments={profile.enrollments} />
        )}
        {activeTab === 'certificates' && (
          <ProfileCertificates certificates={profile.certificates} />
        )}
        {activeTab === 'password' && (
          <ProfilePassword />
        )}
      </main>
    </div>
  );
}

export default Profile;
