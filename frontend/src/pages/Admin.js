import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';
import AdminDashboard from './AdminDashboard';
import AdminCourses from './admin/AdminCourses';
import AdminUsers from './admin/AdminUsers';
import AdminPurchases from './admin/AdminPurchases';
import AdminAuditLogs from './admin/AdminAuditLogs';
import AdminStudents from './admin/AdminStudents';
import AdminInstructors from './admin/AdminInstructors';
import AdminRoles from './admin/AdminRoles';
import AdminModules from './admin/AdminModules';
import AdminCategories from './admin/AdminCategories';
import AdminDevConfig from './admin/AdminDevConfig';
import AdminMonitoring from './admin/AdminMonitoring';

function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (!isAdmin()) return;
    loadCourses();
    api.get('/admin/categories').then(r => setAllCategories(r.data)).catch(() => {});
    api.get('/admin/tags').then(r => setAllTags(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'cursos', label: 'Cursos' },
    { key: 'lecciones', label: 'Lecciones' },
    { key: 'evaluaciones', label: 'Evaluaciones' },
    { key: 'compras', label: 'Compras' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'monitoreo', label: 'Monitoreo' },
    { key: 'desarrollo', label: 'Desarrollo' },
    { key: 'audit', label: 'Audit Logs' },
    { key: 'students', label: 'Estudiantes' },
    { key: 'instructors', label: 'Instructores' },
    { key: 'admin-mgmt', label: 'Gestión Roles' },
    { key: 'modulos', label: 'Módulos' },
    { key: 'categorias', label: 'Categorías/Tags' },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div className="admin-section">
            <AdminDashboard />
          </div>
        );
      case 'cursos':
        return (
          <AdminCourses
            courses={courses}
            loadCourses={loadCourses}
            allCategories={allCategories}
            allTags={allTags}
          />
        );
      case 'usuarios':
        return <AdminUsers />;
      case 'compras':
        return <AdminPurchases />;
      case 'monitoreo':
        return <AdminMonitoring />;
      case 'audit':
        return <AdminAuditLogs />;
      case 'students':
        return <AdminStudents />;
      case 'instructors':
        return <AdminInstructors />;
      case 'admin-mgmt':
        return <AdminRoles />;
      case 'modulos':
        return <AdminModules courses={courses} />;
      case 'categorias':
        return <AdminCategories />;
      case 'desarrollo':
        return <AdminDevConfig />;
      case 'lecciones':
        return (
          <div className="admin-section">
            <div className="section-header"><h2>Lecciones</h2></div>
            <p>Gestión de lecciones (próximamente).</p>
          </div>
        );
      case 'evaluaciones':
        return (
          <div className="admin-section">
            <div className="section-header"><h2>Evaluaciones</h2></div>
            <p>Gestión de evaluaciones (próximamente).</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={() => navigate('/')} className="btn-back">
          &larr; Back to Home
        </button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h3>Administración</h3>
          <nav className="admin-nav">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`admin-menu-item ${selectedMenu === item.key ? 'active' : ''}`}
                onClick={() => setSelectedMenu(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default Admin;
