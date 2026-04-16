import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminCategories() {
  const { addToast } = useToast();

  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [showTagForm, setShowTagForm] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '', slug: '' });
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadCategoriesAdmin();
    loadTagsAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategoriesAdmin = async () => {
    try {
      const res = await api.get('/admin/categories');
      setAllCategories(res.data);
    } catch (err) {
      addToast('Error cargando categorias', { type: 'error' });
    }
  };

  const loadTagsAdmin = async () => {
    try {
      const res = await api.get('/admin/tags');
      setAllTags(res.data);
    } catch (err) {
      addToast('Error cargando etiquetas', { type: 'error' });
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (isEditingCategory && editingCategoryId) {
        await api.put(`/admin/categories/${editingCategoryId}`, categoryForm);
        addToast('Categoria actualizada', { type: 'success' });
      } else {
        await api.post('/admin/categories', categoryForm);
        addToast('Categoria creada', { type: 'success' });
      }
      setCategoryForm({ name: '', slug: '', description: '' });
      setShowCategoryForm(false);
      setIsEditingCategory(false);
      setEditingCategoryId(null);
      loadCategoriesAdmin();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error guardando categoria', { type: 'error' });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      addToast('Categoria eliminada', { type: 'success' });
      loadCategoriesAdmin();
    } catch (err) {
      addToast('Error eliminando categoria', { type: 'error' });
    }
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    try {
      if (isEditingTag && editingTagId) {
        await api.put(`/admin/tags/${editingTagId}`, tagForm);
        addToast('Etiqueta actualizada', { type: 'success' });
      } else {
        await api.post('/admin/tags', tagForm);
        addToast('Etiqueta creada', { type: 'success' });
      }
      setTagForm({ name: '', slug: '' });
      setShowTagForm(false);
      setIsEditingTag(false);
      setEditingTagId(null);
      loadTagsAdmin();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error guardando etiqueta', { type: 'error' });
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await api.delete(`/admin/tags/${id}`);
      addToast('Etiqueta eliminada', { type: 'success' });
      loadTagsAdmin();
    } catch (err) {
      addToast('Error eliminando etiqueta', { type: 'error' });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'category') {
      await handleDeleteCategory(confirmAction.id);
    } else if (confirmAction.type === 'tag') {
      await handleDeleteTag(confirmAction.id);
    }
    setConfirmAction(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Categorias y Etiquetas</h2>
      </div>

      {/* ─ Categories ─ */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Categorias</h3>
          <button
            className="btn-create"
            onClick={() => {
              setIsEditingCategory(false);
              setEditingCategoryId(null);
              setCategoryForm({ name: '', slug: '', description: '' });
              setShowCategoryForm(!showCategoryForm);
            }}
          >
            {showCategoryForm ? 'Cancelar' : '+ Nueva Categoria'}
          </button>
        </div>

        {showCategoryForm && (
          <form onSubmit={handleSaveCategory} className="admin-form" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Nombre de la categoria"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Slug (ej: desarrollo-web)"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Descripcion (opcional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-submit">{isEditingCategory ? 'Actualizar' : 'Crear Categoria'}</button>
              <button type="button" className="btn-cancel" onClick={() => { setShowCategoryForm(false); setIsEditingCategory(false); setEditingCategoryId(null); setCategoryForm({ name: '', slug: '', description: '' }); }}>Cancelar</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allCategories.length === 0 ? (
            <EmptyState title="Sin categorías" description="No hay categorías creadas todavía." />
          ) : (
            allCategories.map((cat) => (
              <div key={cat.id} className="admin-user-card">
                <div className="user-info">
                  <h3 style={{ marginBottom: 2 }}>{cat.name}</h3>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    <span className="meta">slug: {cat.slug}</span>
                    {cat.description && <span> — {cat.description}</span>}
                  </p>
                </div>
                <div className="user-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setIsEditingCategory(true);
                      setEditingCategoryId(cat.id);
                      setCategoryForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '' });
                      setShowCategoryForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => setConfirmAction({ type: 'category', id: cat.id })}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─ Tags ─ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Etiquetas (Tags)</h3>
          <button
            className="btn-create"
            onClick={() => {
              setIsEditingTag(false);
              setEditingTagId(null);
              setTagForm({ name: '', slug: '' });
              setShowTagForm(!showTagForm);
            }}
          >
            {showTagForm ? 'Cancelar' : '+ Nueva Etiqueta'}
          </button>
        </div>

        {showTagForm && (
          <form onSubmit={handleSaveTag} className="admin-form" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Nombre de la etiqueta"
              value={tagForm.name}
              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Slug (ej: javascript)"
              value={tagForm.slug}
              onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-submit">{isEditingTag ? 'Actualizar' : 'Crear Etiqueta'}</button>
              <button type="button" className="btn-cancel" onClick={() => { setShowTagForm(false); setIsEditingTag(false); setEditingTagId(null); setTagForm({ name: '', slug: '' }); }}>Cancelar</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allTags.length === 0 ? (
            <EmptyState title="Sin etiquetas" description="No hay etiquetas creadas todavía." />
          ) : (
            allTags.map((tag) => (
              <div key={tag.id} className="admin-user-card">
                <div className="user-info">
                  <h3 style={{ marginBottom: 2 }}>{tag.name}</h3>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    <span className="meta">slug: {tag.slug}</span>
                  </p>
                </div>
                <div className="user-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setIsEditingTag(true);
                      setEditingTagId(tag.id);
                      setTagForm({ name: tag.name || '', slug: tag.slug || '' });
                      setShowTagForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => setConfirmAction({ type: 'tag', id: tag.id })}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'category' ? 'Eliminar Categoria' : 'Eliminar Etiqueta'}
      >
        <p>
          {confirmAction?.type === 'category'
            ? 'Eliminar esta categoria?'
            : 'Eliminar esta etiqueta?'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Cancelar</button>
          <button className="btn-delete" onClick={handleConfirmAction}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCategories;
