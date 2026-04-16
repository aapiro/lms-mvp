import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './GamificationWidget.css';

function GamificationWidget({ variant = 'full' }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [lbPeriod, setLbPeriod] = useState('all_time');

  useEffect(() => {
    if (!user) return;
    loadStats();
    // Daily login ping
    api.post('/gamification/daily-login').catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (activeTab === 'leaderboard') loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, lbPeriod]);

  const loadStats = async () => {
    try {
      const res = await api.get('/gamification/stats');
      setStats(res.data);
    } catch { /* ignore */ }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await api.get(`/gamification/leaderboard?period=${lbPeriod}&limit=10`);
      setLeaderboard(res.data || []);
    } catch { /* ignore */ }
  };

  if (!user || !stats) return null;

  const xpProgress = stats.nextLevelXp > 0
    ? Math.min(100, Math.round((stats.totalXp / stats.nextLevelXp) * 100))
    : 100;

  return (
    <div className="gamification-widget">
      <div className="gw-tabs">
        <button className={`gw-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Mi Progreso</button>
        <button className={`gw-tab ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>Logros</button>
        <button className={`gw-tab ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>Ranking</button>
      </div>

      {activeTab === 'stats' && (
        <div className="gw-stats">
          <div className="gw-level-card">
            <div className="gw-level-badge">Nivel {stats.level}</div>
            <div className="gw-xp-info">
              <span className="gw-xp-total">{stats.totalXp} XP</span>
              <span className="gw-xp-next">{stats.nextLevelXp} XP para el siguiente nivel</span>
            </div>
            <div className="gw-xp-bar">
              <div className="gw-xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

          <div className="gw-streak-card">
            <div className="gw-streak-icon">🔥</div>
            <div>
              <strong>{stats.currentStreak} días</strong>
              <span className="gw-streak-label">Racha actual</span>
            </div>
            <div className="gw-streak-best">
              Mejor: {stats.longestStreak} días
            </div>
          </div>

          <div className="gw-quick-stats">
            <div className="gw-stat-item">
              <span className="gw-stat-value">{stats.badgeCount}</span>
              <span className="gw-stat-label">Logros</span>
            </div>
            <div className="gw-stat-item">
              <span className="gw-stat-value">{stats.level}</span>
              <span className="gw-stat-label">Nivel</span>
            </div>
            <div className="gw-stat-item">
              <span className="gw-stat-value">{stats.currentStreak}</span>
              <span className="gw-stat-label">Racha</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="gw-badges">
          {stats.badges && stats.badges.length > 0 ? (
            <div className="gw-badges-grid">
              {stats.badges.map(b => (
                <div key={b.id} className="gw-badge-card">
                  <span className="gw-badge-icon">{b.badgeIcon || '🏅'}</span>
                  <strong>{b.badgeName}</strong>
                  <span className="gw-badge-desc">{b.badgeDescription}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="gw-empty">Completa actividades para ganar logros.</div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="gw-leaderboard">
          <div className="gw-lb-period">
            <button className={lbPeriod === 'weekly' ? 'active' : ''} onClick={() => setLbPeriod('weekly')}>Semanal</button>
            <button className={lbPeriod === 'all_time' ? 'active' : ''} onClick={() => setLbPeriod('all_time')}>General</button>
          </div>
          <div className="gw-lb-list">
            {leaderboard.length === 0 ? (
              <div className="gw-empty">No hay datos en el ranking aún.</div>
            ) : (
              leaderboard.map((entry) => (
                <div key={entry.userId} className={`gw-lb-row ${entry.userId === user.id ? 'gw-lb-row--me' : ''}`}>
                  <span className="gw-lb-rank">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <div className="gw-lb-user">
                    <strong>{entry.fullName || 'Usuario'}</strong>
                    <span>Nivel {entry.level}</span>
                  </div>
                  <span className="gw-lb-xp">{entry.totalXp} XP</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact XP bar for the header */
export function XpBadge() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/gamification/stats').then(r => setStats(r.data)).catch(() => {});
  }, [user]);

  if (!user || !stats) return null;

  return (
    <div className="xp-badge" title={`${stats.totalXp} XP — Nivel ${stats.level}`}>
      <span className="xp-badge-level">Nv.{stats.level}</span>
      <span className="xp-badge-xp">{stats.totalXp} XP</span>
      {stats.currentStreak > 0 && <span className="xp-badge-streak">🔥{stats.currentStreak}</span>}
    </div>
  );
}

export default GamificationWidget;
