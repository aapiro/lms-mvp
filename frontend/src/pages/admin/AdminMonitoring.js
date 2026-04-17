import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import '../Admin.css';

function AdminMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'security') loadSecurityEvents();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/admin/monitoring/dashboard');
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadSecurityEvents = async () => {
    try {
      const res = await api.get('/admin/monitoring/security/events?hours=48&limit=50');
      setSecurityEvents(res.data || []);
    } catch { /* ignore */ }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando monitoreo...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No se pudo cargar el monitoreo.</div>;

  const { system, performance, security, sessions } = data;

  return (
    <div>
      <div className="section-header">
        <h2>Monitoreo del Sistema</h2>
        <button className="btn-create" onClick={loadDashboard}>Refrescar</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['overview', 'performance', 'security', 'sessions', 'errors'].map(tab => (
          <button
            key={tab}
            className={`admin-menu-item ${activeTab === tab ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'General' : tab === 'performance' ? 'Rendimiento' :
             tab === 'security' ? 'Seguridad' : tab === 'sessions' ? 'Sesiones' : 'Errores'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* System Health */}
          <div className="admin-section">
            <h3 style={{ margin: '0 0 16px' }}>Estado del Sistema</h3>
            <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="card">
                <h3>Uptime</h3>
                <div className="value">{system?.uptime?.days}d {system?.uptime?.hours}h</div>
              </div>
              <div className="card">
                <h3>Heap Memory</h3>
                <div className="value">{system?.jvm?.heapUsagePercent}%</div>
                <small>{system?.jvm?.heapUsedMb}MB / {system?.jvm?.heapMaxMb}MB</small>
              </div>
              <div className="card">
                <h3>Threads</h3>
                <div className="value">{system?.jvm?.threadCount}</div>
                <small>Peak: {system?.jvm?.peakThreadCount}</small>
              </div>
              <div className="card">
                <h3>Base de Datos</h3>
                <div className="value" style={{ color: system?.database?.status === 'UP' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {system?.database?.status}
                </div>
                <small>{system?.database?.responseTimeMs}ms</small>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="admin-section">
            <h3 style={{ margin: '0 0 16px' }}>Dependencias</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              {system?.services && Object.entries(system.services).map(([name, status]) => (
                <div key={name} style={{
                  padding: '12px 20px', borderRadius: 'var(--radius-md)',
                  background: status === 'UP' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  fontWeight: 600, fontSize: 14
                }}>
                  {name}: {status}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="admin-section">
            <h3 style={{ margin: '0 0 16px' }}>Resumen 24h</h3>
            <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="card">
                <h3>Requests</h3>
                <div className="value">{performance?.totalRequests24h || 0}</div>
              </div>
              <div className="card">
                <h3>Errores</h3>
                <div className="value" style={{ color: 'var(--color-danger)' }}>{performance?.errors24h || 0}</div>
              </div>
              <div className="card">
                <h3>Error Rate</h3>
                <div className="value">{performance?.errorRate24h || 0}%</div>
              </div>
              <div className="card">
                <h3>Usuarios Online</h3>
                <div className="value">{sessions?.activeUsers || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="admin-section">
          <h3 style={{ margin: '0 0 16px' }}>Rendimiento por Endpoint (última hora)</h3>
          {performance?.endpoints?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: 10 }}>Endpoint</th>
                    <th style={{ padding: 10 }}>Método</th>
                    <th style={{ padding: 10 }}>Requests</th>
                    <th style={{ padding: 10 }}>Avg (ms)</th>
                    <th style={{ padding: 10 }}>Max (ms)</th>
                    <th style={{ padding: 10 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.endpoints.map((ep, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ep.endpoint}</td>
                      <td style={{ padding: 10 }}><span className="badge-status" style={{ background: ep.method === 'GET' ? 'var(--color-info-light)' : 'var(--color-warning-light)' }}>{ep.method}</span></td>
                      <td style={{ padding: 10, fontWeight: 600 }}>{ep.requests}</td>
                      <td style={{ padding: 10, color: ep.avgMs > 500 ? 'var(--color-danger)' : ep.avgMs > 200 ? 'var(--color-warning)' : 'var(--color-success)' }}>{ep.avgMs}</td>
                      <td style={{ padding: 10, color: ep.maxMs > 1000 ? 'var(--color-danger)' : 'inherit' }}>{ep.maxMs}</td>
                      <td style={{ padding: 10 }}>
                        {ep.avgMs < 200 ? '🟢' : ep.avgMs < 500 ? '🟡' : '🔴'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>No hay datos de rendimiento aún. Los datos se acumulan cada minuto.</p>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-section">
            <h3 style={{ margin: '0 0 16px' }}>Resumen de Seguridad (24h)</h3>
            <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {security?.events24h && Object.entries(security.events24h).map(([type, count]) => (
                <div key={type} className="card">
                  <h3>{type.replace(/_/g, ' ')}</h3>
                  <div className="value" style={{
                    color: type.includes('FAILED') || type.includes('LIMITED') || type.includes('SUSPICIOUS')
                      ? 'var(--color-danger)' : 'var(--color-text)'
                  }}>{count}</div>
                </div>
              ))}
              <div className="card">
                <h3>Rate Limited</h3>
                <div className="value" style={{ color: 'var(--color-warning)' }}>{security?.rateLimited24h || 0}</div>
              </div>
            </div>
          </div>

          {security?.topFailedLoginIps?.length > 0 && (
            <div className="admin-section">
              <h3 style={{ margin: '0 0 12px' }}>Top IPs con Login Fallido</h3>
              {security.topFailedLoginIps.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <code>{item.ip}</code>
                  <strong style={{ color: 'var(--color-danger)' }}>{item.attempts} intentos</strong>
                </div>
              ))}
            </div>
          )}

          <div className="admin-section">
            <h3 style={{ margin: '0 0 12px' }}>Eventos Recientes</h3>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {securityEvents.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 12, fontWeight: 600, fontSize: 11,
                    background: ev.severity === 'CRITICAL' ? 'var(--color-danger-light)' :
                                ev.severity === 'WARN' ? 'var(--color-warning-light)' : 'var(--color-bg-alt)',
                    color: ev.severity === 'CRITICAL' ? 'var(--color-danger)' :
                           ev.severity === 'WARN' ? 'var(--color-warning-text)' : 'var(--color-text-muted)'
                  }}>{ev.severity}</span>
                  <span style={{ fontWeight: 600, minWidth: 140 }}>{ev.eventType}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{ev.email || ev.ipAddress || ''}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>{new Date(ev.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {securityEvents.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Sin eventos de seguridad recientes.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="admin-section">
          <h3 style={{ margin: '0 0 16px' }}>Sesiones Activas</h3>
          <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card">
              <h3>Usuarios Online</h3>
              <div className="value">{sessions?.activeUsers || 0}</div>
              <small>últimos 15 min</small>
            </div>
            <div className="card">
              <h3>Sesiones Activas</h3>
              <div className="value">{sessions?.activeSessions || 0}</div>
            </div>
            <div className="card">
              <h3>Dispositivos</h3>
              <div style={{ marginTop: 8 }}>
                {sessions?.deviceBreakdown && Object.entries(sessions.deviceBreakdown).map(([device, count]) => (
                  <div key={device} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' }}>
                    <span>{device === 'DESKTOP' ? '🖥️' : device === 'MOBILE' ? '📱' : device === 'TABLET' ? '📋' : '❓'} {device}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === 'errors' && (
        <div className="admin-section">
          <h3 style={{ margin: '0 0 16px' }}>Errores Recientes</h3>
          {data.recentErrors?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentErrors.map((err, i) => (
                <div key={i} className="audit-log-item">
                  <div className="log-info">
                    <span className="log-action" style={{ color: 'var(--color-danger)' }}>{err.errorType}</span>
                    <span className="log-date">{new Date(err.lastSeen).toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>x{err.count}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>{err.message}</p>
                  {err.endpoint && <code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{err.endpoint}</code>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>No hay errores recientes.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminMonitoring;