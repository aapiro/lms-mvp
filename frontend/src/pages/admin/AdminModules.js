import React, { useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminModules({ courses }) {
  const { addToast } = useToast();

  const [modulesCourseId, setModulesCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', moduleOrder: 1 });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadModules = async (courseId) => {
    try {
      const res = await api.get(`/admin/courses/${courseId}/modules`);
      setModules(res.data);
    } catch (err) {
      addToast('Error al cargar modulos', { type: 'error' });
      console.error('Error loading modules:', err);
    }
  };

  const handleCourseSelect = (courseId) => {
    setModulesCourseId(courseId);
    if (courseId) {
      loadModules(courseId);
    } else {
      setModules([]);
    }
    setShowModuleForm(false);
    setIsEditingModule(false);
    setEditingModuleId(null);
  };

  const handleNewModule = () => {
    setModuleForm({ title: '', description: '', moduleOrder: modules.length + 1 });
    setIsEditingModule(false);
    setEditingModuleId(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (mod) => {
    setModuleForm({
      title: mod.title || '',
      description: mod.description || '',
      moduleOrder: mod.moduleOrder || 1,
    });
    setIsEditingModule(true);
    setEditingModuleId(mod.id);
    setShowModuleForm(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    try {
      if (isEditingModule) {
        await api.put(`/admin/modules/${editingModuleId}`, {
          ...moduleForm,
          courseId: modulesCourseId,
        });
        addToast('Modulo actualizado', { type: 'success' });
      } else {
        await api.post(`/admin/courses/${modulesCourseId}/modules`, moduleForm);
        addToast('Modulo creado', { type: 'success' });
      }
      setShowModuleForm(false);
      setIsEditingModule(false);
      setEditingModuleId(null);
      loadModules(modulesCourseId);
    } catch (err) {
      addToast('Error al guardar modulo', { type: 'error' });
      console.error('Error saving module:', err);
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      await api.delete(`/admin/modules/${id}`);
      addToast('Modulo eliminado', { type: 'success' });
      loadModules(modulesCourseId);
    } catch (err) {
      addToast('Error al eliminar modulo', { type: 'error' });
      console.error('Error deleting module:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDeleteModule(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Modulos</h2>
      </div>

      <div className="form-group">
        <label>Seleccionar Curso</label>
        <select
          value={modulesCourseId}
          onChange={(e) => handleCourseSelect(e.target.value)}
          className="form-input"
        >
          <option value="">-- Seleccionar curso --</option>
          {(courses || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {!modulesCourseId && (
        <EmptyState icon="📚" description="Selecciona un curso para ver sus módulos." />
      )}

      {modulesCourseId && (
        <button className="btn btn--primary btn--sm" onClick={handleNewModule}>
          + Nuevo Modulo
        </button>
      )}

      {showModuleForm && (
        <form className="admin-form" onSubmit={handleSaveModule}>
          <h3>{isEditingModule ? 'Editar Modulo' : 'Nuevo Modulo'}</h3>
          <div className="form-group">
            <label>Titulo</label>
            <input
              type="text"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Descripcion</label>
            <textarea
              value={moduleForm.description}
              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              className="form-input"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={moduleForm.moduleOrder}
              onChange={(e) => setModuleForm({ ...moduleForm, moduleOrder: parseInt(e.target.value, 10) || 1 })}
              className="form-input"
              min={1}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              {isEditingModule ? 'Guardar Cambios' : 'Crear Modulo'}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                setShowModuleForm(false);
                setIsEditingModule(false);
                setEditingModuleId(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="module-list">
        {modules.length === 0 && modulesCourseId && <EmptyState icon="📦" title="Sin módulos" description="No hay módulos en este curso. Crea uno para organizar las lecciones." />}
        {modules.map((mod) => (
          <div key={mod.id} className="module-card">
            <div className="module-card__header">
              <h4>{mod.title}</h4>
              <span className="module-card__order">Orden: {mod.moduleOrder}</span>
            </div>
            {mod.description && <p className="module-card__description">{mod.description}</p>}
            <p className="module-card__lessons">
              Lecciones: {mod.lessonCount != null ? mod.lessonCount : (mod.lessons ? mod.lessons.length : 0)}
            </p>
            <div className="module-card__actions">
              <button className="btn btn--sm btn--outline" onClick={() => handleEditModule(mod)}>
                Editar
              </button>
              <button className="btn btn--sm btn--danger" onClick={() => setConfirmDeleteId(mod.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar Modulo"
      >
        <p>Eliminar este modulo?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn--outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
          <button className="btn btn--sm btn--danger" onClick={handleConfirmDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminModules;
