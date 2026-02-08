// javascript
             import React, { useState, useEffect } from 'react';
             import { useNavigate } from 'react-router-dom';
             import api from '../api/api';
             import { useAuth } from '../context/AuthContext';
             import { useToast } from '../components/ToastProvider';
             import './Admin.css';

             function Admin() {
               const { isAdmin } = useAuth();
               const navigate = useNavigate();

               const [courses, setCourses] = useState([]);
               const [showCourseForm, setShowCourseForm] = useState(false);
               const [isEditing, setIsEditing] = useState(false);
               const [editingCourseId, setEditingCourseId] = useState(null);
               const [selectedCourse, setSelectedCourse] = useState(null);
               const [showLessonForm, setShowLessonForm] = useState(false);
               const [isEditingLesson, setIsEditingLesson] = useState(false);
               const [editingLessonId, setEditingLessonId] = useState(null);

               const [courseForm, setCourseForm] = useState({
                 title: '',
                 description: '',
                 price: ''
               });

               const [lessonForm, setLessonForm] = useState({
                 title: '',
                 lessonOrder: 1,
                 durationSeconds: '',
                 file: null
               });

               // NEW: state for submenu selection (default to Cursos)
               const [selectedMenu, setSelectedMenu] = useState('cursos');
               // NEW: state for course detail modal
               const [showCourseDetail, setShowCourseDetail] = useState(false);
               const [courseDetail, setCourseDetail] = useState(null);
               const [detailLoading, setDetailLoading] = useState(false);

               // NEW: users management state
               const [users, setUsers] = useState([]);
               // NEW: purchases state
               const [purchases, setPurchases] = useState([]);
               const [purchasePage, setPurchasePage] = useState(0);
               const [purchaseSize] = useState(20);
               const [loadingPurchases, setLoadingPurchases] = useState(false);
               const [showPurchaseDetail, setShowPurchaseDetail] = useState(false);
               const [purchaseDetail, setPurchaseDetail] = useState(null);
               const [showUserForm, setShowUserForm] = useState(false);
               const [isEditingUser, setIsEditingUser] = useState(false);
               const [editingUserId, setEditingUserId] = useState(null);
               const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'USER' });
               // NEW: user detail modal state
               const [showUserDetail, setShowUserDetail] = useState(false);
               const [userDetail, setUserDetail] = useState(null);
               // validation errors for user form
               const [userErrors, setUserErrors] = useState({ fullName: '', email: '', password: '' });

               // NEW: state for config/dev options
               const [devConfig, setDevConfig] = useState({ maintenance: false, devPayments: false });
               const [loadingDevConfig, setLoadingDevConfig] = useState(false);

               // Insert audit logs state and loader near devConfig declarations
               const [auditLogs, setAuditLogs] = useState([]);
               const [auditPage, setAuditPage] = useState(0);
               const [auditSize] = useState(20);
               const [loadingAudit, setLoadingAudit] = useState(false);

               const { addToast } = useToast();

               useEffect(() => {
                 if (!isAdmin()) {
                   navigate('/');
                   return;
                 }
                 loadCourses();
               }, []);

               // Load users when the Usuarios tab is selected
               useEffect(() => {
                 if (selectedMenu === 'usuarios') {
                   loadUsers();
                 }
               }, [selectedMenu]);

               // load dev config when admin opens the panel (or when selectedMenu === 'desarrollo')
               useEffect(() => {
                 if (selectedMenu === 'desarrollo') {
                   loadDevConfig();
                 }
                 if (selectedMenu === 'audit') {
                   loadAuditLogs();
                 }
                 // NEW: load purchases when compras tab selected
                 if (selectedMenu === 'compras') {
                   loadPurchases();
                 }
               }, [selectedMenu]);

               const loadUsers = async () => {
                 try {
                   const res = await api.get('/admin/users');
                   setUsers(res.data);
                 } catch (err) {
                   console.error('Error loading users:', err);
                 }
               };

               const loadDevConfig = async () => {
                 setLoadingDevConfig(true);
                 try {
                   const res = await api.get('/admin/dev');
                   setDevConfig(res.data);
                 } catch (err) {
                   console.error('Error loading dev config', err);
                 } finally {
                   setLoadingDevConfig(false);
                 }
               };

               // NEW: load initial audit logs
               const loadAuditLogs = async (page = 0) => {
                 setLoadingAudit(true);
                 try {
                   const res = await api.get(`/admin/audit?page=${page}&size=${auditSize}`);
                   // res.data is a page object
                   const items = res.data.content || res.data;
                   setAuditLogs(items);
                   setAuditPage(page);
                 } catch (err) {
                   console.error('Error loading audit logs', err);
                   addToast('No se pudieron cargar los audit logs', { type: 'error' });
                 } finally {
                   setLoadingAudit(false);
                 }
               };

               const loadPurchases = async (page = 0) => {
                 setLoadingPurchases(true);
                 try {
                   const res = await api.get(`/admin/purchases?page=${page}&size=${purchaseSize}`);
                   const items = res.data.content || res.data;
                   setPurchases(items);
                   setPurchasePage(page);
                 } catch (err) {
                   console.error('Error loading purchases', err);
                 } finally {
                   setLoadingPurchases(false);
                 }
               };

               // Open purchase detail modal
               const openPurchaseDetail = async (id) => {
                 setShowPurchaseDetail(true);
                 setPurchaseDetail(null);
                 try {
                   const res = await api.get(`/admin/purchases/${id}`);
                   setPurchaseDetail(res.data);
                 } catch (err) {
                   console.error('Failed to load purchase detail', err);
                   addToast('No se pudo cargar el detalle de la compra', { type: 'error' });
                   setShowPurchaseDetail(false);
                 }
               };

               const handleSaveUser = async (e) => {
                 e.preventDefault();
                 // client-side validations
                 const errors = { fullName: '', email: '', password: '' };
                 if (!userForm.fullName || userForm.fullName.trim().length < 2) {
                   errors.fullName = 'Nombre requerido (min 2 caracteres)';
                 }
                 // simple email regex
                 const emailRe = /^\S+@\S+\.\S+$/;
                 if (!userForm.email || !emailRe.test(userForm.email)) {
                   errors.email = 'Email inválido';
                 }
                 // password rules: on create required min 8, on edit optional but if provided min 8
                 if (!isEditingUser) {
                   if (!userForm.password || userForm.password.length < 8) {
                     errors.password = 'Contraseña requerida (mínimo 8 caracteres)';
                   }
                 } else {
                   if (userForm.password && userForm.password.length > 0 && userForm.password.length < 8) {
                     errors.password = 'Si cambia la contraseña, debe tener al menos 8 caracteres';
                   }
                 }

                 setUserErrors(errors);
                 if (errors.fullName || errors.email || errors.password) {
                   addToast('Por favor corrige los campos del formulario', { type: 'error' });
                   return;
                 }

                 try {
                   if (isEditingUser && editingUserId) {
                     // For update, don't require password unless provided
                     const payload = { fullName: userForm.fullName, email: userForm.email, role: userForm.role };
                     if (userForm.password) payload.password = userForm.password;
                     await api.put(`/admin/users/${editingUserId}`, payload);
                     addToast('Usuario actualizado correctamente', { type: 'success' });
                   } else {
                     await api.post('/admin/users', userForm);
                     addToast('Usuario creado correctamente', { type: 'success' });
                   }

                   setUserForm({ fullName: '', email: '', password: '', role: 'USER' });
                   setShowUserForm(false);
                   setIsEditingUser(false);
                   setEditingUserId(null);
                   loadUsers();
                 } catch (err) {
                   const msg = err.response?.data?.error || (isEditingUser ? 'Error actualizando usuario' : 'Error creando usuario');
                   addToast(msg, { type: 'error' });
                 }
               };

               const handleEditUserClick = (user) => {
                 setIsEditingUser(true);
                 setEditingUserId(user.id);
                 setUserForm({ fullName: user.fullName || '', email: user.email || '', password: '', role: user.role || 'USER' });
                 setShowUserForm(true);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               };

               const handleDeleteUser = async (id) => {
                 if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
                 try {
                   await api.delete(`/admin/users/${id}`);
                   alert('Usuario eliminado');
                   loadUsers();
                 } catch (err) {
                   alert('No se pudo eliminar el usuario');
                 }
               };

               const openCourseDetail = async (id) => {
                 // abrir modal inmediatamente y luego cargar el detalle
                 setShowCourseDetail(true);
                 setDetailLoading(true);
                 try {
                   const res = await api.get(`/courses/${id}`);
                   setCourseDetail(res.data);
                 } catch (err) {
                   console.error('Failed to load course detail', err);
                   alert('No se pudo cargar el detalle del curso');
                   // cerrar modal en caso de fallo
                   setShowCourseDetail(false);
                 } finally {
                   setDetailLoading(false);
                 }
               };

               const closeCourseDetail = () => {
                 setShowCourseDetail(false);
                 setCourseDetail(null);
                 setDetailLoading(false);
               };

               const loadCourses = async () => {
                 try {
                   const response = await api.get('/courses');
                   setCourses(response.data);
                 } catch (err) {
                   console.error('Error loading courses:', err);
                 }
               };

               const handleSaveCourse = async (e) => {
                 e.preventDefault();
                 try {
                   if (isEditing && editingCourseId) {
                     await api.put(`/admin/courses/${editingCourseId}`, courseForm);
                     alert('Course updated successfully!');
                   } else {
                     await api.post('/admin/courses', courseForm);
                     alert('Course created successfully!');
                   }

                   // reset form
                   setCourseForm({ title: '', description: '', price: '' });
                   setShowCourseForm(false);
                   setIsEditing(false);
                   setEditingCourseId(null);
                   loadCourses();
                 } catch (err) {
                   alert(err.response?.data?.error || (isEditing ? 'Failed to update course' : 'Failed to create course'));
                 }
               };

               const handleDeleteCourse = async (id) => {
                 if (!window.confirm('Are you sure you want to delete this course?')) return;

                 try {
                   await api.delete(`/admin/courses/${id}`);
                   loadCourses();
                   alert('Course deleted successfully!');
                 } catch (err) {
                   alert('Failed to delete course');
                 }
               };

               const handleEditCourseClick = (course) => {
                 setIsEditing(true);
                 setEditingCourseId(course.id);
                 setCourseForm({ title: course.title || '', description: course.description || '', price: course.price || '' });
                 setShowCourseForm(true);
                 // scroll to form or focus if needed
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               };

               const handleSaveLesson = async (e) => {
                 e.preventDefault();

                 const formData = new FormData();
                 formData.append('title', lessonForm.title);
                 formData.append('lessonOrder', lessonForm.lessonOrder);
                 if (lessonForm.durationSeconds) {
                   formData.append('durationSeconds', lessonForm.durationSeconds);
                 }
                 if (lessonForm.file) {
                   formData.append('file', lessonForm.file);
                 }

                 try {
                   if (isEditingLesson && editingLessonId) {
                     await api.put(`/admin/lessons/${editingLessonId}`, formData, {
                       headers: { 'Content-Type': 'multipart/form-data' }
                     });
                     alert('Lesson updated successfully!');
                   } else {
                     await api.post(`/admin/courses/${selectedCourse}/lessons`, formData, {
                       headers: { 'Content-Type': 'multipart/form-data' }
                     });
                     alert('Lesson created successfully!');
                   }

                   setLessonForm({ title: '', lessonOrder: 1, durationSeconds: '', file: null });
                   setShowLessonForm(false);
                   setSelectedCourse(null);
                   setIsEditingLesson(false);
                   setEditingLessonId(null);
                   loadCourses();
                   // Reload course detail if editing
                   if (courseDetail) {
                     const res = await api.get(`/courses/${courseDetail.id}`);
                     setCourseDetail(res.data);
                   }
                 } catch (err) {
                   alert(err.response?.data?.error || (isEditingLesson ? 'Failed to update lesson' : 'Failed to create lesson'));
                 }
               };

               const handleEditLessonClick = (lesson) => {
                 setIsEditingLesson(true);
                 setEditingLessonId(lesson.id);
                 setLessonForm({
                   title: lesson.title || '',
                   lessonOrder: lesson.lessonOrder || 1,
                   durationSeconds: lesson.durationSeconds || '',
                   file: null
                 });
                 setShowLessonForm(true);
                 // No need to set selectedCourse since it's already in courseDetail
               };

               const handleDeleteLesson = async (lessonId) => {
                 if (!window.confirm('Are you sure you want to delete this lesson?')) return;
                 try {
                   await api.delete(`/admin/lessons/${lessonId}`);
                   // Reload course detail to reflect changes
                   const res = await api.get(`/courses/${courseDetail.id}`);
                   setCourseDetail(res.data);
                   alert('Lesson deleted successfully!');
                 } catch (err) {
                   alert('Failed to delete lesson');
                 }
               };

               const openUserDetail = (id) => {
                 const u = users.find((x) => Number(x.id) === Number(id));
                 if (u) {
                   setUserDetail(u);
                   setShowUserDetail(true);
                 } else {
                   // fallback: reload users and open
                   loadUsers().then(() => {
                     const uu = users.find((x) => Number(x.id) === Number(id));
                     if (uu) {
                       setUserDetail(uu);
                       setShowUserDetail(true);
                     } else {
                       alert('Usuario no encontrado');
                     }
                   });
                 }
               };

               const closeUserDetail = () => {
                 setShowUserDetail(false);
                 setUserDetail(null);
               };

               const saveDevConfig = async (newConfig) => {
                 try {
                   const res = await api.post('/admin/dev', newConfig);
                   setDevConfig(res.data);
                   addToast('Configuración de desarrollo actualizada', { type: 'success' });
                 } catch (err) {
                   addToast('No se pudo actualizar la configuración', { type: 'error' });
                 }
               };

               return (
                 <div className="admin-container">
                   <div className="admin-header">
                     <h1>Admin Panel</h1>
                     <button onClick={() => navigate('/')} className="btn-back">← Back to Home</button>
                   </div>

                   {/* NEW layout: sidebar submenu + main area */}
                   <div className="admin-layout">
                     <aside className="admin-sidebar">
                       <h3>Administración</h3>
                       <nav className="admin-nav">
                         <button
                           className={`admin-menu-item ${selectedMenu === 'cursos' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('cursos')}
                         >
                           Cursos
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'lecciones' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('lecciones')}
                         >
                           Lecciones
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'compras' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('compras')}
                         >
                           Compras
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'usuarios' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('usuarios')}
                         >
                           Usuarios
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'desarrollo' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('desarrollo')}
                         >
                           Desarrollo
                         </button>

                         {/* Nuevo: Audit Logs como sección separada debajo de Desarrollo */}
                         <button
                           className={`admin-menu-item ${selectedMenu === 'audit' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('audit')}
                         >
                           Audit Logs
                         </button>
                       </nav>
                     </aside>

                     <main className="admin-main">
                       {/* Cursos: reutiliza la sección existente tal cual */}
                       {selectedMenu === 'cursos' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Cursos</h2>
                             <button onClick={() => { setIsEditing(false); setEditingCourseId(null); setCourseForm({ title: '', description: '', price: '' }); setShowCourseForm(!showCourseForm); }} className="btn-create">
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
                               <div style={{ display: 'flex', gap: 10 }}>
                                 <button type="submit" className="btn-submit">{isEditing ? 'Update Course' : 'Create Course'}</button>
                                 <button type="button" className="btn-cancel" onClick={() => { setShowCourseForm(false); setIsEditing(false); setEditingCourseId(null); setCourseForm({ title: '', description: '', price: '' }); }}>Cancel</button>
                               </div>
                             </form>
                           )}

                           <div className="courses-list">
                             {courses.map((course) => (
                               <div key={course.id} className="admin-course-card">
                                 <div className="course-info">
                                   <div className="course-title-row">
                                     <h3>{course.title}</h3>
                                     { (course.price === 0 || course.price === '0') && <span className="badge-free">Free</span> }
                                   </div>
                                   <p>{course.description}</p>
                                   <span className="meta">
                                     { (course.price === 0 || course.price === '0') ? 'Free' : `$${course.price}`} • {course.lessonCount} lessons
                                   </span>
                                 </div>
                                 <div className="course-actions">
                                   {/* Nuevo: botón para ver detalle del curso directamente */}
                                   <button
                                     onClick={() => openCourseDetail(course.id)}
                                     className="btn-detail"
                                   >
                                     Ver detalle
                                   </button>
                                   <button
                                     onClick={() => {
                                       setSelectedCourse(course.id);
                                       setShowLessonForm(true);
                                     }}
                                     className="btn-add-lesson"
                                   >+ Add Lesson </button>
                                   <button
                                     onClick={() => handleEditCourseClick(course)}
                                     className="btn-edit"
                                   >
                                     Edit
                                   </button>
                                   <button
                                     onClick={() => handleDeleteCourse(course.id)}
                                     className="btn-delete"
                                   >
                                     Delete
                                   </button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Sección de usuarios: nueva implementación */}
                       {selectedMenu === 'usuarios' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Usuarios</h2>
                             <button onClick={() => { setIsEditingUser(false); setEditingUserId(null); setUserForm({ fullName: '', email: '', password: '', role: 'USER' }); setShowUserForm(!showUserForm); }} className="btn-create">
                               {showUserForm ? 'Cancel' : '+ New User'}
                             </button>
                           </div>

                           {showUserForm && (
                             <form onSubmit={handleSaveUser} className="admin-form">
                               <input
                                 type="text"
                                 placeholder="Full Name"
                                 value={userForm.fullName}
                                 onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                                 required
                               />
                               {userErrors.fullName && <div className="field-error">{userErrors.fullName}</div>}
                               <input
                                 type="email"
                                 placeholder="Email"
                                 value={userForm.email}
                                 onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                 required
                               />
                               {userErrors.email && <div className="field-error">{userErrors.email}</div>}
                               <input
                                 type="password"
                                 placeholder="Password"
                                 value={userForm.password}
                                 onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                 autoComplete="new-password"
                                 // password field should not be autofilled
                               />
                               {userErrors.password && <div className="field-error">{userErrors.password}</div>}
                               <select
                                 value={userForm.role}
                                 onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                 className="role-select"
                               >
                                 <option value="USER">User</option>
                                 <option value="ADMIN">Admin</option>
                               </select>
                               <div style={{ display: 'flex', gap: 10 }}>
                                 <button type="submit" className="btn-submit">{isEditingUser ? 'Update User' : 'Create User'}</button>
                                 <button type="button" className="btn-cancel" onClick={() => { setShowUserForm(false); setIsEditingUser(false); setEditingUserId(null); setUserForm({ fullName: '', email: '', password: '', role: 'USER' }); }}>Cancel</button>
                               </div>
                             </form>
                           )}

                           <div className="users-list">
                             {users.map((user) => (
                               <div key={user.id} className="admin-user-card">
                                 <div className="user-info">
                                   <h3>{user.fullName}</h3>
                                   <p>{user.email}</p>
                                   <span className="meta">{user.role}</span>
                                 </div>
                                 <div className="user-actions">
                                   <button
                                     onClick={() => openUserDetail(user.id)}
                                     className="btn-detail"
                                   >
                                     Ver detalle
                                   </button>
                                   <button
                                     onClick={() => handleEditUserClick(user)}
                                     className="btn-edit"
                                   >
                                     Edit
                                   </button>
                                   <button
                                     onClick={() => handleDeleteUser(user.id)}
                                     className="btn-delete"
                                   >
                                     Delete
                                   </button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Placeholders for other admin sections */}
                       {selectedMenu === 'lecciones' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Lecciones</h2>
                           </div>
                           <p>Gestión de lecciones (próximamente).</p>
                         </div>
                       )}

                       {selectedMenu === 'compras' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Compras</h2>
                           </div>
                           {loadingPurchases ? (
                             <div style={{ padding: 20 }}>Cargando compras...</div>
                           ) : (
                             <div className="purchases-list">
                               {purchases.length === 0 ? (
                                 <div style={{ padding: 20 }}>No hay compras registradas.</div>
                               ) : (
                                 purchases.map((p) => (
                                   <div key={p.id} className="purchase-item">
                                     <div style={{ flex: 1 }}>
                                       <strong>{p.courseTitle || 'Curso #' + p.courseId}</strong>
                                       <div className="meta">{p.userEmail} • ${p.amount} • {p.status}</div>
                                     </div>
                                     <div style={{ display: 'flex', gap: 8 }}>
                                       <button className="btn-detail" onClick={() => openPurchaseDetail(p.id)}>Ver detalle</button>
                                     </div>
                                   </div>
                                 ))
                               )}
                               <div style={{ marginTop: 12 }}>
                                 <button onClick={() => loadPurchases(Math.max(0, purchasePage - 1))} disabled={purchasePage === 0}>Anterior</button>
                                 <button onClick={() => loadPurchases(purchasePage + 1)} style={{ marginLeft: 8 }}>Siguiente</button>
                               </div>
                             </div>
                           )}
                         </div>
                       )}

                       {selectedMenu === 'progreso' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Progreso</h2>
                           </div>
                           <p>Ver y ajustar el progreso de los usuarios (próximamente).</p>
                         </div>
                       )}

                       {selectedMenu === 'desarrollo' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Desarrollo</h2>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <label style={{ fontWeight: 700 }}>Modo mantenimiento</label>
                               <input type="checkbox" checked={devConfig.maintenance} onChange={(e) => saveDevConfig({ ...devConfig, maintenance: e.target.checked })} />
                               <span className="meta">({devConfig.maintenance ? 'Activado' : 'Desactivado'})</span>
                             </div>

                             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <label style={{ fontWeight: 700 }}>Modo desarrollo de compras (passthrough)</label>
                               <input type="checkbox" checked={devConfig.devPayments} onChange={(e) => saveDevConfig({ ...devConfig, devPayments: e.target.checked })} />
                               <span className="meta">({devConfig.devPayments ? 'Activado' : 'Desactivado'})</span>
                             </div>

                             <div>
                               <p className="meta">Modo desarrollo de compras: si está activado, las compras se simulan localmente sin llamar a Stripe.</p>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Nueva sección independiente para Audit Logs */}
                       {selectedMenu === 'audit' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Audit Logs</h2>
                             <div style={{ display: 'flex', gap: 8 }}>
                               <button className="btn-create" onClick={() => loadAuditLogs(0)}>Recargar</button>
                             </div>
                           </div>

                           {loadingAudit ? (
                             <div style={{ padding: 20, textAlign: 'center' }}>Cargando audit logs...</div>
                           ) : (
                             <>
                               {auditLogs.length === 0 ? (
                                 <div style={{ padding: 20, textAlign: 'center' }}>No hay audit logs disponibles.</div>
                               ) : (
                                 <div className="audit-logs-list">
                                   {auditLogs.map((log) => (
                                     <div key={log.id} className="audit-log-item">
                                       <div className="log-info">
                                         <span className="log-date">{new Date(log.createdAt).toLocaleString()}</span>
                                         <span className="log-action">{log.action}</span>
                                         <span className="log-actor">{log.actorId ? ` by ${log.actorId}` : ''}</span>
                                       </div>
                                       <div className="log-details">
                                         <pre style={{ whiteSpace: 'pre-wrap' }}>{log.payload}</pre>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               )}

                               <div className="audit-logs-pagination" style={{ marginTop: 12 }}>
                                 <button
                                   onClick={() => loadAuditLogs(Math.max(0, auditPage - 1))}
                                   disabled={auditPage === 0 || loadingAudit}
                                   className="btn-paginate"
                                 >
                                   Anterior
                                 </button>
                                 <button
                                   onClick={() => loadAuditLogs(auditPage + 1)}
                                   disabled={loadingAudit}
                                   className="btn-paginate"
                                 >
                                   Siguiente
                                 </button>
                               </div>
                             </>
                           )}
                         </div>
                       )}
                     </main>
                   </div>

                   {/* Course detail modal */}
                   {showCourseDetail && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content course-detail-modal">
                         {detailLoading ? (
                           <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>
                         ) : courseDetail ? (
                           <>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <h2>{courseDetail.title}</h2>
                               <button className="btn-cancel" onClick={closeCourseDetail}>Cerrar</button>
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
                                           alert('Este curso no ha sido comprado.');
                                         }
                                       }}
                                       style={{ cursor: 'pointer' }}
                                     >
                                       <div className="lesson-info">
                                         <span className="lesson-icon">{lesson.completed ? '✓' : lesson.lessonType === 'VIDEO' ? '▶' : '📄'}</span>
                                         <div>
                                           <h4 style={{ margin: 0 }}>{lesson.title}</h4>
                                           <span className="lesson-meta">{lesson.lessonType}{lesson.durationSeconds ? ` • ${Math.floor(lesson.durationSeconds/60)} min` : ''}</span>
                                         </div>
                                       </div>
                                       <div className="lesson-actions">
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleEditLessonClick(lesson);
                                           }}
                                           className="btn-edit-lesson"
                                         >
                                           Edit
                                         </button>
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleDeleteLesson(lesson.id);
                                           }}
                                           className="btn-delete-lesson"
                                         >
                                           Delete
                                         </button>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               ) : (
                                 <p>No hay lecciones todavía.</p>
                               )}
                             </div>
                           </>
                         ) : (
                           <div style={{ padding: 40, textAlign: 'center' }}>No se encontró el curso.</div>
                         )}
                       </div>
                     </div>
                   )}

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
                           <div className="file-input">
                             <label>Upload Video or PDF {isEditingLesson ? '(optional, leave empty to keep current file)' : ''}</label>
                             <input
                               type="file"
                               accept="video/*,application/pdf"
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
                                 setLessonForm({ title: '', lessonOrder: 1, durationSeconds: '', file: null });
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

                   {/* User detail modal */}
                   {showUserDetail && userDetail && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content user-detail-modal">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>{userDetail.fullName}</h2>
                           <div style={{ display: 'flex', gap: 8 }}>
                             <button className="btn-edit" onClick={() => { closeUserDetail(); handleEditUserClick(userDetail); }}>Editar</button>
                             <button className="btn-cancel" onClick={closeUserDetail}>Cerrar</button>
                           </div>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           <p><strong>Email:</strong> {userDetail.email}</p>
                           <p><strong>Rol:</strong> {userDetail.role}</p>
                           {/* If backend adds dates, can show them here */}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Purchase detail modal */}
                   {showPurchaseDetail && purchaseDetail && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>Compra #{purchaseDetail.id}</h2>
                           <button className="btn-cancel" onClick={() => { setShowPurchaseDetail(false); setPurchaseDetail(null); }}>Cerrar</button>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           <p><strong>Usuario:</strong> {purchaseDetail.userEmail} (id: {purchaseDetail.userId})</p>
                           <p><strong>Curso:</strong> {purchaseDetail.courseTitle} (id: {purchaseDetail.courseId})</p>
                           <p><strong>Monto:</strong> ${purchaseDetail.amount}</p>
                           <p><strong>Estado:</strong> {purchaseDetail.status}</p>
                           <p><strong>Stripe Payment ID:</strong> {purchaseDetail.stripePaymentId}</p>
                           <p><strong>Fecha:</strong> {new Date(purchaseDetail.purchasedAt).toLocaleString()}</p>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               );
             }

             export default Admin;
