import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import '../Admin.css';

const FEATURE_FLAGS = [
  { key: 'aiTutor', label: 'Tutor AI', description: 'Chat inteligente con IA que asiste al estudiante en cada curso.' },
  { key: 'gamification', label: 'Gamificación (XP, badges, leaderboard)', description: 'Sistema de puntos, logros, rachas y ranking entre estudiantes.' },
  { key: 'notifications', label: 'Notificaciones', description: 'Campana de notificaciones in-app para los usuarios.' },
  { key: 'reviews', label: 'Reseñas de cursos', description: 'Los estudiantes pueden calificar y comentar cursos.' },
  { key: 'globalSearch', label: 'Búsqueda global', description: 'Barra de búsqueda de cursos en el header.' },
  { key: 'waitlist', label: 'Lista de espera', description: 'Permite a los usuarios unirse a waitlist cuando un curso está lleno.' },
];

function AdminDevConfig() {
  const { addToast } = useToast();

  const [devConfig, setDevConfig] = useState({
    maintenance: false,
    devPayments: false,
    aiTutor: true,
    gamification: true,
    notifications: true,
    reviews: true,
    globalSearch: true,
    waitlist: true,
  });

  useEffect(() => {
    loadDevConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDevConfig = async () => {
    try {
      const res = await api.get('/admin/dev');
      setDevConfig(res.data);
    } catch (err) {
      console.error('Error loading dev config:', err);
    }
  };

  const saveDevConfig = async (newConfig) => {
    try {
      const res = await api.post('/admin/dev', newConfig);
      setDevConfig(res.data);
      addToast('Configuración guardada', { type: 'success' });
    } catch (err) {
      addToast('Error al guardar configuración', { type: 'error' });
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Configuración</h2>
      </div>

      {/* Dev toggles */}
      <div className="admin-section" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text)' }}>Desarrollo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={devConfig.maintenance}
              onChange={(e) => saveDevConfig({ ...devConfig, maintenance: e.target.checked })}
            />
            <strong>Modo mantenimiento</strong>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={devConfig.devPayments}
              onChange={(e) => saveDevConfig({ ...devConfig, devPayments: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <div>
              <strong>Modo desarrollo de compras (passthrough)</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Cuando está activo, las compras se procesan sin pasar por Stripe.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Feature flags */}
      <div className="admin-section">
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text)' }}>Funcionalidades</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>
          Activa o desactiva funcionalidades de la plataforma. Los cambios se aplican inmediatamente.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURE_FLAGS.map((flag) => (
            <label key={flag.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!devConfig[flag.key]}
                onChange={(e) => saveDevConfig({ ...devConfig, [flag.key]: e.target.checked })}
                style={{ marginTop: 3 }}
              />
              <div>
                <strong>{flag.label}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {flag.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDevConfig;
