import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './NotificationBell.css';

function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      try {
        const res = await api.get('/notifications');
        setNotifications(Array.isArray(res.data) ? res.data.slice(0, 20) : []);
      } catch { /* ignore */ }
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (!user) return null;

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-trigger" onClick={openDropdown} aria-label="Notificaciones">
        🔔
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">
            <strong>Notificaciones</strong>
            {unreadCount > 0 && (
              <button className="bell-mark-all" onClick={markAllAsRead}>Marcar todas leídas</button>
            )}
          </div>
          <div className="bell-dropdown-list">
            {notifications.length === 0 ? (
              <div className="bell-empty">Sin notificaciones</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`bell-item ${n.isRead ? '' : 'bell-item--unread'}`}
                  onClick={() => { if (!n.isRead) markAsRead(n.id); if (n.resourceUrl) window.location.href = n.resourceUrl; }}
                >
                  <div className="bell-item-title">{n.title}</div>
                  <div className="bell-item-message">{n.message?.substring(0, 80)}{n.message?.length > 80 ? '...' : ''}</div>
                  <div className="bell-item-time">{timeAgo(n.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
