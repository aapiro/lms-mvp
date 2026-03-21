import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function ActivityHeatmap({ data }) {
  const lookup = {};
  let maxCount = 1;
  data.forEach(({ dow, hour, count }) => {
    lookup[`${dow}-${hour}`] = count;
    if (count > maxCount) maxCount = count;
  });

  return (
    <div className="heatmap-container">
      <div className="heatmap-header-row">
        <div className="heatmap-day-label" />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="heatmap-hour-label">{h}</div>
        ))}
      </div>
      {Array.from({ length: 7 }, (_, dow) => (
        <div key={dow} className="heatmap-row">
          <div className="heatmap-day-label">{DOW_LABELS[dow]}</div>
          {Array.from({ length: 24 }, (_, hour) => {
            const count = lookup[`${dow}-${hour}`] || 0;
            const intensity = count / maxCount;
            return (
              <div
                key={hour}
                className="heatmap-cell"
                style={{
                  background: count === 0
                    ? 'rgba(102,126,234,0.05)'
                    : `rgba(102,126,234,${(0.15 + intensity * 0.85).toFixed(2)})`
                }}
                title={`${DOW_LABELS[dow]} ${String(hour).padStart(2, '0')}h — ${count} eventos`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [enrollmentsSeries, setEnrollmentsSeries] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [topCoursesMetric, setTopCoursesMetric] = useState('enrollments');
  const [heatmapData, setHeatmapData] = useState([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
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
        if (status === 401 || status === 403) { setSeries([]); return; }
        else throw e;
      }
      setSeries(res.data.map(s => ({ ...s, revenueCents: Number(s.revenueCents), salesCount: Number(s.salesCount) })));
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async (fromDate, toDate) => {
    const f = fromDate || from;
    const t = toDate || to;
    try {
      const res = await api.get(`/admin/metrics/enrollments-timeseries?from=${f}&to=${t}`);
      setEnrollmentsSeries(res.data);
    } catch (e) {
      console.error('loadEnrollments error', e);
    }
  };

  const loadTopCourses = async (metric) => {
    const m = metric || topCoursesMetric;
    try {
      const res = await api.get(`/admin/metrics/top-courses?metric=${m}&limit=10`);
      setTopCourses(res.data);
    } catch (e) {
      console.error('loadTopCourses error', e);
    }
  };

  const loadHeatmap = async () => {
    try {
      const res = await api.get('/admin/metrics/activity-heatmap?days=30');
      setHeatmapData(res.data);
    } catch (e) {
      console.error('loadHeatmap error', e);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadSummary(), loadSeries(), loadEnrollments(), loadTopCourses(), loadHeatmap()]);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
        setError('No se pudieron cargar las métricas. Revisa que estés logueado y que el servidor responda.');
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadSeries();
    loadSummary();
    loadEnrollments(from, to);
    loadTopCourses(topCoursesMetric);
    loadHeatmap();
  };

  // --- Chart data ---
  const revenueChartData = {
    labels: series.map(s => s.date),
    datasets: [{
      label: 'Revenue (USD)',
      data: series.map(s => (Number(s.revenueCents || 0) / 100)),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
    }]
  };

  const enrollmentsChartData = {
    labels: enrollmentsSeries.map(s => s.date),
    datasets: [{
      label: 'Inscripciones',
      data: enrollmentsSeries.map(s => s.enrollments),
      backgroundColor: 'rgba(102,126,234,0.7)',
      borderColor: 'rgba(102,126,234,1)',
      borderWidth: 1,
    }]
  };

  const topCoursesChartData = {
    labels: topCourses.map(c => c.title),
    datasets: [{
      label: topCoursesMetric === 'enrollments' ? 'Inscripciones' : 'Tasa completado (%)',
      data: topCourses.map(c => Number(c.value)),
      backgroundColor: 'rgba(39,174,96,0.7)',
      borderColor: 'rgba(39,174,96,1)',
      borderWidth: 1,
    }]
  };

  const revenueSummary = summary?.revenueSummary;
  const changePercent = revenueSummary?.changePercent ?? 0;

  return (
    <div className="admin-dashboard">
      {error && <div style={{ padding: 12, background: '#fee', color: '#900', borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div>
          <label>Desde <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label style={{ marginLeft: 8 }}>Hasta <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
          <button style={{ marginLeft: 8 }} onClick={handleRefresh}>Refrescar</button>
        </div>
      </div>

      {/* KPI Grid — 2 filas × 4 columnas */}
      <div className="kpis-grid">
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
          <div className="value">${((summary?.revenueTodayCents || 0) / 100).toFixed(2)}</div>
        </div>
        <div className="card">
          <h3>Compras hoy</h3>
          <div className="value">{summary?.purchasesToday ?? '-'}</div>
        </div>

        <div className="card">
          <h3>Activos (7d)</h3>
          <div className="value">{summary?.activeUsersCount ?? '-'}</div>
        </div>
        <div className="card">
          <h3>Cursos en progreso</h3>
          <div className="value">{summary?.coursesInProgress ?? '-'}</div>
        </div>
        <div className="card">
          <h3>Tasa completado</h3>
          <div className="value">
            {summary?.completionRate != null ? `${summary.completionRate}%` : '-'}
          </div>
        </div>
        <div className="card">
          <h3>Ingresos (mes)</h3>
          <div className="value">
            ${((revenueSummary?.currentMonthCents || 0) / 100).toFixed(2)}
          </div>
          {revenueSummary && (
            <span className={`change-badge ${changePercent >= 0 ? 'positive' : 'negative'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent}%
            </span>
          )}
        </div>
      </div>

      {/* Fila de gráficas: Ingresos + Inscripciones */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Ingresos en el tiempo</h3>
          {loading ? <div>Cargando...</div> : (
            series.length > 0
              ? <Line data={revenueChartData} options={{ plugins: { legend: { display: false } }, responsive: true }} />
              : <div className="no-data">No hay datos para el rango seleccionado.</div>
          )}
        </div>
        <div className="chart-card">
          <h3>Inscripciones en el tiempo</h3>
          {enrollmentsSeries.length > 0
            ? <Bar data={enrollmentsChartData} options={{ plugins: { legend: { display: false } }, responsive: true }} />
            : <div className="no-data">No hay inscripciones en el rango seleccionado.</div>
          }
        </div>
      </div>

      {/* Fila inferior: Top cursos + Heatmap */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Top cursos</h3>
            <select
              value={topCoursesMetric}
              onChange={e => { setTopCoursesMetric(e.target.value); loadTopCourses(e.target.value); }}
            >
              <option value="enrollments">Por inscripciones</option>
              <option value="completion_rate">Por tasa de completado</option>
            </select>
          </div>
          {topCourses.length > 0
            ? <Bar
                data={topCoursesChartData}
                options={{
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  responsive: true,
                  scales: { x: { beginAtZero: true } }
                }}
              />
            : <div className="no-data">No hay datos de cursos disponibles.</div>
          }
        </div>
        <div className="chart-card">
          <h3>Heatmap de actividad (30d)</h3>
          {heatmapData.length > 0
            ? <ActivityHeatmap data={heatmapData} />
            : <div className="no-data">Sin actividad reciente suficiente para mostrar el heatmap.</div>
          }
        </div>
      </div>

      {/* Top cursos lista (legacy) */}
      <div style={{ marginTop: 20 }}>
        <h3>Top cursos por ventas (30d)</h3>
        {summary ? (
          summary.topCourses && summary.topCourses.length > 0 ? (
            <ul>
              {summary.topCourses.map(tc => (
                <li key={tc.courseId}>{tc.title} — {tc.salesCount}</li>
              ))}
            </ul>
          ) : <div>No hay cursos con ventas en los últimos 30 días.</div>
        ) : <div>No summary available yet.</div>}
      </div>

    </div>
  );
}

export default AdminDashboard;
