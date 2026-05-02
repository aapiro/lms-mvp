import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Modal from '../../components/common/Modal';
import '../Admin.css';

function AdminCourses({ courses, loadCourses, allCategories, allTags }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    thumbnailUrl: '',
    status: 'PUBLISHED',
    enrollmentType: 'OPEN',
    capacityLimit: '',
    certificateTemplate: '',
    categoryIds: [],
    tagIds: [],
    prerequisiteCourseIds: []
  });

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    lessonOrder: 1,
    durationSeconds: '',
    file: null,
    moduleId: '',
    releaseAfterDays: '',
    availableFrom: ''
  });

  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [courseDetail, setCourseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [prereqNewCourseId, setPrereqNewCourseId] = useState('');

  const [showCourseStudents, setShowCourseStudents] = useState(false);
  const [courseStudentsList, setCourseStudentsList] = useState([]);
  const [courseStudentsCourse, setCourseStudentsCourse] = useState(null);
  const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const resetCourseForm = () => {
    setCourseForm({ title: '', description: '', price: '', thumbnailUrl: '', status: 'PUBLISHED', enrollmentType: 'OPEN', capacityLimit: '', certificateTemplate: '', categoryIds: [], tagIds: [], prerequisiteCourseIds: [] });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...courseForm,
        price: courseForm.price !== '' ? courseForm.price : 0,
        capacityLimit: courseForm.capacityLimit !== '' ? Number(courseForm.capacityLimit) : null,
      };
      if (isEditing && editingCourseId) {
        await api.put(`/admin/courses/${editingCourseId}`, payload);
        addToast('Curso actualizado', { type: 'success' });
      } else {
        await api.post('/admin/courses', payload);
        addToast('Curso creado', { type: 'success' });
      }
      resetCourseForm();
      setShowCourseForm(false);
      setIsEditing(false);
      setEditingCourseId(null);
      loadCourses();
    } catch (err) {
      addToast(err.response?.data?.error || (isEditing ? 'Failed to update course' : 'Failed to create course'), { type: 'error' });
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      loadCourses();
      addToast('Course deleted successfully!', { type: 'success' });
    } catch (err) {
      addToast('Failed to delete course', { type: 'error' });
    }
  };

  const handleEditCourseClick = (course) => {
    setIsEditing(true);
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      price: course.price || '',
      thumbnailUrl: course.thumbnailUrl || '',
      status: course.status || 'PUBLISHED',
      enrollmentType: course.enrollmentType || 'OPEN',
      capacityLimit: course.capacityLimit || '',
      certificateTemplate: course.certificateTemplate || '',
      categoryIds: [],
      tagIds: [],
      prerequisiteCourseIds: []
    });
    setShowCourseForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', lessonForm.title);
    formData.append('lessonOrder', lessonForm.lessonOrder);
    if (lessonForm.durationSeconds) formData.append('durationSeconds', lessonForm.durationSeconds);
    if (lessonForm.moduleId) formData.append('moduleId', lessonForm.moduleId);
    if (lessonForm.releaseAfterDays) formData.append('releaseAfterDays', lessonForm.releaseAfterDays);
    if (lessonForm.availableFrom) formData.append('availableFrom', lessonForm.availableFrom);
    if (lessonForm.file) formData.append('file', lessonForm.file);

    try {
      if (isEditingLesson && editingLessonId) {
        await api.put(`/admin/lessons/${editingLessonId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('Lesson updated successfully!', { type: 'success' });
      } else {
        await api.post(`/admin/courses/${selectedCourse}/lessons`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('Lesson created successfully!', { type: 'success' });
      }

      setLessonForm({ title: '', lessonOrder: 1, durationSeconds: '', file: null, moduleId: '', releaseAfterDays: '', availableFrom: '' });
      setShowLessonForm(false);
      setSelectedCourse(null);
      setIsEditingLesson(false);
      setEditingLessonId(null);
      loadCourses();
      if (courseDetail) {
        const res = await api.get(`/courses/${courseDetail.id}`);
        setCourseDetail(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.error || (isEditingLesson ? 'Failed to update lesson' : 'Failed to create lesson'), { type: 'error' });
    }
  };

  const handleEditLessonClick = (lesson) => {
    setIsEditingLesson(true);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || '',
      lessonOrder: lesson.lessonOrder || 1,
      durationSeconds: lesson.durationSeconds || '',
      file: null,
      moduleId: lesson.moduleId || '',
      releaseAfterDays: lesson.releaseAfterDays || '',
      availableFrom: lesson.availableFrom ? lesson.availableFrom.substring(0, 16) : ''
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      const res = await api.get(`/courses/${courseDetail.id}`);
      setCourseDetail(res.data);
      addToast('Lesson deleted successfully!', { type: 'success' });
    } catch (err) {
      addToast('Failed to delete lesson', { type: 'error' });
    }
  };

  const handleArchiveCourse = async (id) => {
    try {
      await api.put(`/admin/courses/${id}/status`, { status: 'ARCHIVED' });
      loadCourses();
      addToast('Curso archivado', { type: 'success' });
    } catch (err) {
      addToast('Error al archivar curso', { type: 'error' });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'deleteCourse') {
      await handleDeleteCourse(confirmAction.id);
    } else if (confirmAction.type === 'deleteLesson') {
      await handleDeleteLesson(confirmAction.id);
    } else if (confirmAction.type === 'archiveCourse') {
      await handleArchiveCourse(confirmAction.id);
    }
    setConfirmAction(null);
  };

  const openCourseDetail = async (id) => {
    setShowCourseDetail(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourseDetail(res.data);
    } catch (err) {
      console.error('Failed to load course detail', err);
      addToast('No se pudo cargar el detalle del curso', { type: 'error' });
      setShowCourseDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeCourseDetail = () => {
    setShowCourseDetail(false);
    setCourseDetail(null);
    setDetailLoading(false);
    setPrereqNewCourseId('');
  };

  const handleAddPrerequisite = async () => {
    if (!prereqNewCourseId || !courseDetail) return;
    try {
      await api.post(`/admin/courses/${courseDetail.id}/prerequisites`, { prerequisiteCourseId: Number(prereqNewCourseId) });
      setPrereqNewCourseId('');
      const res = await api.get(`/courses/${courseDetail.id}`);
      setCourseDetail(res.data);
    } catch (err) {
      addToast('Error al agregar prerrequisito: ' + (err.response?.data?.message || err.message), { type: 'error' });
    }
  };

  const handleRemovePrerequisite = async (prereqCourseId) => {
    if (!courseDetail) return;
    try {
      await api.delete(`/admin/courses/${courseDetail.id}/prerequisites/${prereqCourseId}`);
      const res = await api.get(`/courses/${courseDetail.id}`);
      setCourseDetail(res.data);
    } catch (err) {
      addToast('Error al eliminar prerrequisito: ' + (err.response?.data?.message || err.message), { type: 'error' });
    }
  };

  const openCourseStudents = async (course) => {
    setCourseStudentsCourse(course);
    setShowCourseStudents(true);
    setLoadingCourseStudents(true);
    try {
      const res = await api.get(`/admin/courses/${course.id}/students`);
      setCourseStudentsList(res.data);
    } catch (err) {
      addToast('Error cargando estudiantes del curso', { type: 'error' });
      setShowCourseStudents(false);
    } finally {
      setLoadingCourseStudents(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Cursos</h2>
        <button onClick={() => { setIsEditing(false); setEditingCourseId(null); resetCourseForm(); setShowCourseForm(!showCourseForm); }} className="btn-create">
          {showCourseForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showCourseForm && (
        <form onSubmit={handleSaveCourse} className="admin-form">
          <input
            type="text"
            placeholder="Course Title"
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Course Description"
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            rows="3"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price (USD)"
            value={courseForm.price}
            onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Cover image URL (e.g. https://picsum.photos/seed/abc/640/360)"
            value={courseForm.thumbnailUrl}
            onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
          />
          {courseForm.thumbnailUrl && (
            <img
              src={courseForm.thumbnailUrl}
              alt="Cover preview"
              style={{ width: 240, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border, #ddd)' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Estado</label>
              <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })} className="role-select" style={{ width: '100%' }}>
                <option value="DRAFT">Borrador (DRAFT)</option>
                <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                <option value="ARCHIVED">Archivado (ARCHIVED)</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Tipo de matricula</label>
              <select value={courseForm.enrollmentType} onChange={(e) => setCourseForm({ ...courseForm, enrollmentType: e.target.value })} className="role-select" style={{ width: '100%' }}>
                <option value="OPEN">Abierto (OPEN)</option>
                <option value="INVITE_ONLY">Solo invitados (INVITE_ONLY)</option>
                <option value="PAID">De pago (PAID)</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Capacidad (plazas)</label>
              <input
                type="number"
                placeholder="Sin limite"
                value={courseForm.capacityLimit}
                onChange={(e) => setCourseForm({ ...courseForm, capacityLimit: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Plantilla de certificado (URL o texto) — opcional"
            value={courseForm.certificateTemplate}
            onChange={(e) => setCourseForm({ ...courseForm, certificateTemplate: e.target.value })}
          />
          {allCategories.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Categorias</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allCategories.map(cat => (
                  <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={courseForm.categoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) setCourseForm({ ...courseForm, categoryIds: [...courseForm.categoryIds, cat.id] });
                        else setCourseForm({ ...courseForm, categoryIds: courseForm.categoryIds.filter(x => x !== cat.id) });
                      }}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Etiquetas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allTags.map(tag => (
                  <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={courseForm.tagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) setCourseForm({ ...courseForm, tagIds: [...courseForm.tagIds, tag.id] });
                        else setCourseForm({ ...courseForm, tagIds: courseForm.tagIds.filter(x => x !== tag.id) });
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-submit">{isEditing ? 'Update Course' : 'Create Course'}</button>
            <button type="button" className="btn-cancel" onClick={() => { setShowCourseForm(false); setIsEditing(false); setEditingCourseId(null); resetCourseForm(); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="courses-list">
        {courses.map((course) => (
          <div key={course.id} className="admin-course-card">
            <div className="course-info">
              <div className="course-title-row">
                <h3>{course.title}</h3>
                {(course.price === 0 || course.price === '0') && <span className="badge-free">Free</span>}
                {course.status && <span className={`badge-status badge-${(course.status || '').toLowerCase()}`}>{course.status}</span>}
              </div>
              <p>{course.description}</p>
              <span className="meta">
                {(course.price === 0 || course.price === '0') ? 'Free' : `$${course.price}`} • {course.lessonCount} lessons
                {course.enrollmentType && course.enrollmentType !== 'OPEN' && <span style={{ marginLeft: 6 }}>• {course.enrollmentType}</span>}
              </span>
            </div>
            <div className="course-actions">
              {/* Quick status buttons */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {course.status !== 'PUBLISHED' && (
                  <button className="btn-submit" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={async () => { await api.put(`/admin/courses/${course.id}/status`, { status: 'PUBLISHED' }); loadCourses(); }}>
                    Publicar
                  </button>
                )}
                {course.status !== 'DRAFT' && (
                  <button className="btn-cancel" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={async () => { await api.put(`/admin/courses/${course.id}/status`, { status: 'DRAFT' }); loadCourses(); }}>
                    Borrador
                  </button>
                )}
                {course.status !== 'ARCHIVED' && (
                  <button className="btn-delete" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setConfirmAction({ type: 'archiveCourse', id: course.id })}>
                    Archivar
                  </button>
                )}
              </div>
              <button onClick={() => openCourseDetail(course.id)} className="btn-detail">Ver detalle</button>
              <button onClick={() => openCourseStudents(course)} className="btn-create" style={{ fontSize: 12 }}>Estudiantes</button>
              <button onClick={() => { setSelectedCourse(course.id); setShowLessonForm(true); }} className="btn-add-lesson">+ Add Lesson</button>
              <button onClick={() => handleEditCourseClick(course)} className="btn-edit">Edit</button>
              <button onClick={() => setConfirmAction({ type: 'deleteCourse', id: course.id })} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {showCourseDetail && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content course-detail-modal">
            {detailLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>
            ) : courseDetail ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>{courseDetail.title}</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-create"
                      style={{ fontSize: 13 }}
                      onClick={() => { closeCourseDetail(); openCourseStudents(courseDetail); }}
                    >
                      Ver Estudiantes
                    </button>
                    <button className="btn-cancel" onClick={closeCourseDetail}>Cerrar</button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {(courseDetail.price === 0 || courseDetail.price === '0') && <span className="badge-free">Free</span>}
                  <p style={{ marginTop: 10 }}>{courseDetail.description}</p>
                  <div className="meta" style={{ marginTop: 8 }}>
                    {(courseDetail.price === 0 || courseDetail.price === '0') ? 'Free' : `$${courseDetail.price}`} • {courseDetail.lessons?.length || 0} lessons
                  </div>
                </div>

                <div className="lessons-section" style={{ marginTop: 18 }}>
                  <h3>Contenido</h3>
                  {courseDetail.lessons && courseDetail.lessons.length > 0 ? (
                    <div className="lessons-list">
                      {courseDetail.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`lesson-item ${lesson.completed ? 'completed' : ''}`}
                          onClick={() => {
                            const isFree = courseDetail.price === 0 || courseDetail.price === '0' || (typeof courseDetail.price === 'object' && courseDetail.price?.value === 0);
                            if (courseDetail.purchased || isFree) {
                              closeCourseDetail();
                              navigate(`/lesson/${lesson.id}`);
                            } else {
                              addToast('Este curso no ha sido comprado.', { type: 'error' });
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="lesson-info">
                            <span className="lesson-icon">{lesson.completed ? '\u2713' : lesson.lessonType === 'VIDEO' ? '\u25B6' : '\uD83D\uDCC4'}</span>
                            <div>
                              <h4 style={{ margin: 0 }}>{lesson.title}</h4>
                              <span className="lesson-meta">{lesson.lessonType}{lesson.durationSeconds ? ` • ${Math.floor(lesson.durationSeconds / 60)} min` : ''}</span>
                            </div>
                          </div>
                          <div className="lesson-actions">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditLessonClick(lesson); }}
                              className="btn-edit-lesson"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'deleteLesson', id: lesson.id }); }}
                              className="btn-delete-lesson"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay lecciones todavia.</p>
                  )}
                </div>

                {/* Prerequisites */}
                <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
                  <h3 style={{ marginBottom: 12 }}>Prerrequisitos</h3>
                  {courseDetail.prerequisites && courseDetail.prerequisites.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {courseDetail.prerequisites.map((p) => (
                        <div key={p.courseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f9fa', borderRadius: 6 }}>
                          <span style={{ fontSize: 14 }}>{p.courseTitle || `Curso #${p.courseId}`}</span>
                          <button className="btn-delete" style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleRemovePrerequisite(p.courseId)}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>Sin prerrequisitos.</p>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      className="role-select"
                      style={{ flex: 1, minWidth: 180 }}
                      value={prereqNewCourseId}
                      onChange={(e) => setPrereqNewCourseId(e.target.value)}
                    >
                      <option value="">— Seleccionar curso prerrequisito —</option>
                      {courses.filter(c => c.id !== courseDetail.id).map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button className="btn-submit" style={{ padding: '8px 14px' }}
                      onClick={handleAddPrerequisite} disabled={!prereqNewCourseId}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>No se encontro el curso.</div>
            )}
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (selectedCourse || isEditingLesson) && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditingLesson ? 'Edit Lesson' : 'Add Lesson to Course'}</h2>
            <form onSubmit={handleSaveLesson} className="admin-form">
              <input
                type="text"
                placeholder="Lesson Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Lesson Order"
                value={lessonForm.lessonOrder}
                onChange={(e) => setLessonForm({ ...lessonForm, lessonOrder: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Duration (seconds) - optional"
                value={lessonForm.durationSeconds}
                onChange={(e) => setLessonForm({ ...lessonForm, durationSeconds: e.target.value })}
              />
              <input
                type="number"
                placeholder="Module ID (optional)"
                value={lessonForm.moduleId}
                onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}
              />
              <input
                type="number"
                placeholder="Dias hasta disponible (drip) - opcional"
                value={lessonForm.releaseAfterDays}
                onChange={(e) => setLessonForm({ ...lessonForm, releaseAfterDays: e.target.value })}
              />
              <div className="file-input">
                <label>Disponible desde (fecha/hora) - opcional</label>
                <input
                  type="datetime-local"
                  value={lessonForm.availableFrom}
                  onChange={(e) => setLessonForm({ ...lessonForm, availableFrom: e.target.value })}
                />
              </div>
              <div className="file-input">
                <label>Upload Video, PDF or Audio {isEditingLesson ? '(optional, leave empty to keep current file)' : ''}</label>
                <input
                  type="file"
                  accept="video/*,application/pdf,audio/*"
                  onChange={(e) => setLessonForm({ ...lessonForm, file: e.target.files[0] })}
                  required={!isEditingLesson}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">{isEditingLesson ? 'Update Lesson' : 'Create Lesson'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false);
                    setSelectedCourse(null);
                    setIsEditingLesson(false);
                    setEditingLessonId(null);
                    setLessonForm({ title: '', lessonOrder: 1, durationSeconds: '', file: null, moduleId: '', releaseAfterDays: '', availableFrom: '' });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Students Modal */}
      <Modal
        isOpen={showCourseStudents}
        onClose={() => { setShowCourseStudents(false); setCourseStudentsList([]); setCourseStudentsCourse(null); }}
        title="Estudiantes del Curso"
        size="lg"
      >
        {courseStudentsCourse && (
          <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>{courseStudentsCourse.title}</p>
        )}
        {loadingCourseStudents ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Cargando estudiantes...</div>
        ) : courseStudentsList.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
            <p style={{ marginTop: 12 }}>No hay estudiantes inscritos en este curso todavia.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, padding: '10px 16px', background: '#f0f4ff', borderRadius: 8, fontSize: 14, color: '#555' }}>
              <strong>{courseStudentsList.length}</strong> estudiante{courseStudentsList.length !== 1 ? 's' : ''} inscritos
              {' • '}
              <strong>{courseStudentsList.filter(s => s.status === 'COMPLETED').length}</strong> completados
              {' • '}
              <strong>{courseStudentsList.filter(s => s.status === 'ACTIVE').length}</strong> en progreso
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
              {courseStudentsList.map((student) => (
                <div key={student.userId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                  {/* Avatar */}
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                    {student.avatarUrl
                      ? <img src={student.avatarUrl} alt={student.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : (student.fullName || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 15 }}>{student.fullName}</strong>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                        background: student.status === 'COMPLETED' ? '#d1fae5' : student.status === 'ACTIVE' ? '#dbeafe' : '#f3f4f6',
                        color: student.status === 'COMPLETED' ? '#065f46' : student.status === 'ACTIVE' ? '#1e40af' : '#6b7280'
                      }}>
                        {student.status === 'COMPLETED' ? 'Completado' : student.status === 'ACTIVE' ? 'En progreso' : 'No iniciado'}
                      </span>
                      {!student.isActive && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>Inactivo</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{student.email}</div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
                        <span>{student.completedLessons}/{student.totalLessons} lecciones completadas</span>
                        <span style={{ fontWeight: 700, color: '#667eea' }}>{student.completionPercentage || 0}%</span>
                      </div>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${student.completionPercentage || 0}%`, height: '100%', background: student.status === 'COMPLETED' ? '#10b981' : '#667eea', transition: 'width .3s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#999' }}>
                      {student.enrolledAt && <span>Inscrito: {new Date(student.enrolledAt).toLocaleDateString()}</span>}
                      {student.lastActivity && <span>Ultima actividad: {new Date(student.lastActivity).toLocaleDateString()}</span>}
                      {student.lastLogin && <span>Ultimo acceso: {new Date(student.lastLogin).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'deleteCourse' ? 'Delete Course' :
          confirmAction?.type === 'deleteLesson' ? 'Delete Lesson' :
          'Archivar Curso'
        }
      >
        <p>
          {confirmAction?.type === 'deleteCourse' && 'Are you sure you want to delete this course?'}
          {confirmAction?.type === 'deleteLesson' && 'Are you sure you want to delete this lesson?'}
          {confirmAction?.type === 'archiveCourse' && 'Archivar este curso?'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
          <button className="btn-delete" onClick={handleConfirmAction}>
            {confirmAction?.type === 'archiveCourse' ? 'Archivar' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCourses;
