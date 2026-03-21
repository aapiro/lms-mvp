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

  const loadSummary = async () => {
    setError(null);
    try {
      let res;
      try {
        res = await api.get('/admin/metrics/summary');
      } catch (e) {
        const status = e.response?.status;
        if (status === 401 || status === 403) {
          res = await api.get('/admin/metrics/public-summary');
        } else throw e;
      }
      setSummary(res.data);
    } catch (e) {
      console.error('loadSummary error', e);
      setError('Error cargando summary: ' + (e.response?.status ? `${e.response.status} ${e.response.statusText}` : e.message));
    }
  };

  const loadSeries = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get(`/admin/metrics/sales-timeseries?from=${from}&to=${to}&interval=day`);
      } catch (e) {
        const status = e.response?.status;
        if (status === 401 || status === 403) {
          setSeries([]);
          return;
        } else throw e;
      }
      const normalized = res.data.map(s => ({ ...s, revenueCents: Number(s.revenueCents), salesCount: Number(s.salesCount) }));
      setSeries(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
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
        data: series.map(s => (Number(s.revenueCents || 0)/100)),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      }
    ]
  };

  return (
    <div className="admin-dashboard">
      {error && <div style={{ padding: 12, background: '#fee', color: '#900', borderRadius: 6 }}>{error}</div>}

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

    </div>
  );
}

export default AdminDashboard;
