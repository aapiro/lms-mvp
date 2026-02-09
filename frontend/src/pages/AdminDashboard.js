import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate()-29); return d.toISOString().slice(0,10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  const loadSummary = async () => {
    setError(null);
    try {
      const res = await api.get('/admin/metrics/summary');
      setSummary(res.data);
      setDebugInfo((d) => ({ ...d, lastSummaryFetch: new Date().toISOString(), summaryStatus: 'ok' }));
    } catch (e) {
      console.error('loadSummary error', e);
      setError('Error cargando summary: ' + (e.response?.status ? `${e.response.status} ${e.response.statusText}` : e.message));
      setDebugInfo((d) => ({ ...d, lastSummaryFetch: new Date().toISOString(), summaryStatus: 'error', summaryError: '' + (e.response?.data || e.message) }));
    }
  };

  const loadSeries = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/metrics/sales-timeseries?from=${from}&to=${to}&interval=day`);
      setSeries(res.data);
      setDebugInfo((d) => ({ ...d, lastSeriesFetch: new Date().toISOString(), seriesStatus: 'ok' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        // collect runtime debug info
        setDebugInfo({ apiBase: api.defaults.baseURL, tokenPresent: !!localStorage.getItem('token') });
        await loadSummary();
        await loadSeries();
      } catch (e) {
        console.error('Failed to load dashboard data', e);
        setError('No se pudieron cargar las métricas. Revisa que estés logueado y que el servidor responda.');
      }
    };
    boot();
  }, []);

  const chartData = {
    labels: series.map(s => s.date),
    datasets: [
      {
        label: 'Revenue (USD)',
        data: series.map(s => (s.revenueCents/100).toFixed(2)),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      }
    ]
  };

  return (
    <div className="admin-dashboard">
      {error && <div style={{ padding: 12, background: '#fee', color: '#900', borderRadius: 6 }}>{error}</div>}
      {/* DEBUG INFO */}
      <div style={{ marginTop: 10, padding: 8, background: '#f3f4f6', borderRadius: 6 }}>
        <strong>Debug:</strong>
        <div>API base: <code>{api.defaults.baseURL}</code></div>
        <div>Token present: <code>{!!localStorage.getItem('token') ? 'yes' : 'no'}</code></div>
        <div>Summary status: <code>{debugInfo.summaryStatus || '-'}</code></div>
        <div>Series status: <code>{debugInfo.seriesStatus || '-'}</code></div>
        {debugInfo.summaryError && <pre style={{ whiteSpace: 'pre-wrap', color: '#900' }}>{debugInfo.summaryError}</pre>}
      </div>

      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div>
          <label>From <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label>To <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
          <button onClick={() => { loadSeries(); loadSummary(); }}>Refrescar</button>
        </div>
      </div>

      <div className="kpis" style={{ display: 'flex', gap: 12 }}>
        <div className="card">
          <h3>Usuarios hoy</h3>
          <div className="value">{summary?.usersToday ?? '-'}</div>
        </div>
        <div className="card">
          <h3>Nuevos (7d)</h3>
          <div className="value">{summary?.newUsers7d ?? '-'}</div>
        </div>
        <div className="card">
          <h3>Ventas hoy</h3>
          <div className="value">${((summary?.revenueTodayCents||0)/100).toFixed(2)}</div>
        </div>
        <div className="card">
          <h3>Compras hoy</h3>
          <div className="value">{summary?.purchasesToday ?? '-'}</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Ingresos</h3>
        {loading ? <div>Cargando...</div> : (
          series && series.length > 0 ? <Line data={chartData} /> : <div>No hay datos para el rango seleccionado.</div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Top cursos (30d)</h3>
        {summary ? (
          summary.topCourses && summary.topCourses.length > 0 ? (
            <ul>
              {summary.topCourses.map(tc => (
                <li key={tc.courseId}>{tc.title} — {tc.salesCount}</li>
              ))}
            </ul>
          ) : (
            <div>No hay cursos con ventas en los últimos 30 días.</div>
          )
        ) : (
          <div>No summary available yet.</div>
        )}
      </div>

      {/* RAW JSON (debug) */}
      <div style={{ marginTop: 12 }}>
        <h4>Raw summary</h4>
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', background: '#fff', padding: 8 }}>{JSON.stringify(summary, null, 2)}</pre>
      </div>
    </div>
  );
}

export default AdminDashboard;
