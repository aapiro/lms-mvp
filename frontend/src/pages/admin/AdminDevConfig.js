import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import '../Admin.css';

function AdminDevConfig() {
  const { addToast } = useToast();

  const [devConfig, setDevConfig] = useState({ maintenance: false, devPayments: false });

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
      addToast('Configuracion guardada', { type: 'success' });
    } catch (err) {
      addToast('Error al guardar configuracion', { type: 'error' });
      console.error('Error saving dev config:', err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Desarrollo</h2>
      </div>

      <div className="dev-config-form">
        <div className="dev-config-row">
          <label className="dev-config-label">
            <input
              type="checkbox"
              checked={devConfig.maintenance}
              onChange={(e) => saveDevConfig({ ...devConfig, maintenance: e.target.checked })}
            />
            <span>Modo mantenimiento</span>
          </label>
        </div>

        <div className="dev-config-row">
          <label className="dev-config-label">
            <input
              type="checkbox"
              checked={devConfig.devPayments}
              onChange={(e) => saveDevConfig({ ...devConfig, devPayments: e.target.checked })}
            />
            <span>Modo desarrollo de compras (passthrough)</span>
          </label>
          <p className="dev-config-description">
            Cuando esta activo, las compras se procesan sin pasar por Stripe. Usar solo en entornos de desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDevConfig;
