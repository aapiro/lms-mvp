// javascript
             import React, { useState, useEffect } from 'react';
             import { useNavigate } from 'react-router-dom';
             import api from '../api/api';
             import { useAuth } from '../context/AuthContext';
             import { useToast } from '../components/ToastProvider';
             import './Admin.css';
             import AdminDashboard from './AdminDashboard';

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
                 price: '',
                 status: 'PUBLISHED',
                 enrollmentType: 'OPEN',
                 capacityLimit: '',
                 certificateTemplate: '',
                 categoryIds: [],
                 tagIds: [],
                 prerequisiteCourseIds: []
               });

               const [lessonForm, setLessonForm] = useState({
                 title: '',
                 lessonOrder: 1,
                 durationSeconds: '',
                 file: null
               });

               // NEW: state for submenu selection (default to Cursos)
               const [selectedMenu, setSelectedMenu] = useState('dashboard');
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

               // ── Students ──────────────────────────────────────
               const [students, setStudents] = useState([]);
               const [studentPage, setStudentPage] = useState(0);
               const [studentSearch, setStudentSearch] = useState('');
               const [loadingStudents, setLoadingStudents] = useState(false);
               const [showStudentDetail, setShowStudentDetail] = useState(false);
               const [studentDetail, setStudentDetail] = useState(null);
               const [showStudentProgress, setShowStudentProgress] = useState(false);
               const [studentProgress, setStudentProgress] = useState([]);

               // ── Instructors ───────────────────────────────────
               const [instructors, setInstructors] = useState([]);
               const [instructorPage, setInstructorPage] = useState(0);
               const [instructorSearch, setInstructorSearch] = useState('');
               const [loadingInstructors, setLoadingInstructors] = useState(false);
               const [showInstructorDetail, setShowInstructorDetail] = useState(false);
               const [instructorDetail, setInstructorDetail] = useState(null);

               // ── Profile Edit ──────────────────────────────────
               const [showProfileEdit, setShowProfileEdit] = useState(false);
               const [profileEditUserId, setProfileEditUserId] = useState(null);
               const [profileEditType, setProfileEditType] = useState('students');
               const [profileForm, setProfileForm] = useState({ fullName: '', bio: '', avatarUrl: '' });

               // ── Admin Management ──────────────────────────────
               const [mgmtUserId, setMgmtUserId] = useState('');
               const [mgmtNewRole, setMgmtNewRole] = useState('STUDENT');
               const [certUserId, setCertUserId] = useState('');
               const [certCourseId, setCertCourseId] = useState('');

               // ── Modules state ─────────────────────────────────
               const [allCategories, setAllCategories] = useState([]);
               const [allTags, setAllTags] = useState([]);
               const [modulesCourseId, setModulesCourseId] = useState('');
               const [modules, setModules] = useState([]);
               const [showModuleForm, setShowModuleForm] = useState(false);
               const [isEditingModule, setIsEditingModule] = useState(false);
               const [editingModuleId, setEditingModuleId] = useState(null);
               const [moduleForm, setModuleForm] = useState({ title: '', description: '', moduleOrder: 1 });

               // ── Categories/Tags state ─────────────────────────
               const [showCategoryForm, setShowCategoryForm] = useState(false);
               const [isEditingCategory, setIsEditingCategory] = useState(false);
               const [editingCategoryId, setEditingCategoryId] = useState(null);
               const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
               const [showTagForm, setShowTagForm] = useState(false);
               const [isEditingTag, setIsEditingTag] = useState(false);
               const [editingTagId, setEditingTagId] = useState(null);
               const [tagForm, setTagForm] = useState({ name: '', slug: '' });

               const { addToast } = useToast();

               const [hasAdminAccess, setHasAdminAccess] = useState(null);

               useEffect(() => {
                 const check = async () => {
                   // check auth locally
                   if (!isAdmin()) {
                     setHasAdminAccess(false);
                   } else {
                     setHasAdminAccess(true);
                     loadCourses();
                     // load categories and tags for course form dropdowns
                     api.get('/admin/categories').then(r => setAllCategories(r.data)).catch(() => {});
                     api.get('/admin/tags').then(r => setAllTags(r.data)).catch(() => {});
                   }
                 };
                 check();
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
                 if (selectedMenu === 'students') loadStudents(0);
                 if (selectedMenu === 'instructors') loadInstructors(0);
                 if (selectedMenu === 'categorias') {
                   loadCategoriesAdmin();
                   loadTagsAdmin();
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

               // ── Modules CRUD ──────────────────────────────────
               const loadModules = async (courseId) => {
                 if (!courseId) return;
                 try {
                   const res = await api.get(`/admin/courses/${courseId}/modules`);
                   setModules(res.data);
                 } catch (err) {
                   addToast('Error cargando módulos', { type: 'error' });
                 }
               };

               const handleSaveModule = async (e) => {
                 e.preventDefault();
                 try {
                   if (isEditingModule && editingModuleId) {
                     await api.put(`/admin/modules/${editingModuleId}`, moduleForm);
                     addToast('Módulo actualizado', { type: 'success' });
                   } else {
                     await api.post(`/admin/courses/${modulesCourseId}/modules`, moduleForm);
                     addToast('Módulo creado', { type: 'success' });
                   }
                   setModuleForm({ title: '', description: '', moduleOrder: 1 });
                   setShowModuleForm(false);
                   setIsEditingModule(false);
                   setEditingModuleId(null);
                   loadModules(modulesCourseId);
                 } catch (err) {
                   addToast(err.response?.data?.error || 'Error guardando módulo', { type: 'error' });
                 }
               };

               const handleDeleteModule = async (moduleId) => {
                 if (!window.confirm('¿Eliminar este módulo? Las lecciones asignadas quedarán sin módulo.')) return;
                 try {
                   await api.delete(`/admin/modules/${moduleId}`);
                   addToast('Módulo eliminado', { type: 'success' });
                   loadModules(modulesCourseId);
                 } catch (err) {
                   addToast('Error eliminando módulo', { type: 'error' });
                 }
               };

               // ── Categories CRUD ───────────────────────────────
               const loadCategoriesAdmin = async () => {
                 try {
                   const res = await api.get('/admin/categories');
                   setAllCategories(res.data);
                 } catch (err) {
                   addToast('Error cargando categorías', { type: 'error' });
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
                     addToast('Categoría actualizada', { type: 'success' });
                   } else {
                     await api.post('/admin/categories', categoryForm);
                     addToast('Categoría creada', { type: 'success' });
                   }
                   setCategoryForm({ name: '', slug: '', description: '' });
                   setShowCategoryForm(false);
                   setIsEditingCategory(false);
                   setEditingCategoryId(null);
                   loadCategoriesAdmin();
                 } catch (err) {
                   addToast(err.response?.data?.error || 'Error guardando categoría', { type: 'error' });
                 }
               };

               const handleDeleteCategory = async (id) => {
                 if (!window.confirm('¿Eliminar esta categoría?')) return;
                 try {
                   await api.delete(`/admin/categories/${id}`);
                   addToast('Categoría eliminada', { type: 'success' });
                   loadCategoriesAdmin();
                 } catch (err) {
                   addToast('Error eliminando categoría', { type: 'error' });
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
                 if (!window.confirm('¿Eliminar esta etiqueta?')) return;
                 try {
                   await api.delete(`/admin/tags/${id}`);
                   addToast('Etiqueta eliminada', { type: 'success' });
                   loadTagsAdmin();
                 } catch (err) {
                   addToast('Error eliminando etiqueta', { type: 'error' });
                 }
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

                   // reset form
                   setCourseForm({ title: '', description: '', price: '', status: 'PUBLISHED', enrollmentType: 'OPEN', capacityLimit: '', certificateTemplate: '', categoryIds: [], tagIds: [], prerequisiteCourseIds: [] });
                   setShowCourseForm(false);
                   setIsEditing(false);
                   setEditingCourseId(null);
                   loadCourses();
                 } catch (err) {
                   addToast(err.response?.data?.error || (isEditing ? 'Failed to update course' : 'Failed to create course'), { type: 'error' });
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
                 setCourseForm({
                   title: course.title || '',
                   description: course.description || '',
                   price: course.price || '',
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

               // ── Students ──────────────────────────────────────
               const loadStudents = async (page = 0) => {
                 setLoadingStudents(true);
                 try {
                   const q = studentSearch ? `&search=${encodeURIComponent(studentSearch)}` : '';
                   const res = await api.get(`/admin/students?page=${page}&size=20${q}`);
                   setStudents(res.data.content || res.data);
                   setStudentPage(page);
                 } catch (err) {
                   addToast('Error cargando estudiantes', { type: 'error' });
                 } finally {
                   setLoadingStudents(false);
                 }
               };

               const openStudentDetail = async (id) => {
                 try {
                   const res = await api.get(`/admin/students/${id}`);
                   setStudentDetail(res.data);
                   setShowStudentDetail(true);
                 } catch (err) {
                   addToast('Error cargando detalle del estudiante', { type: 'error' });
                 }
               };

               const openStudentProgress = async (id) => {
                 try {
                   const res = await api.get(`/admin/students/${id}/progress`);
                   setStudentProgress(res.data);
                   setShowStudentProgress(true);
                 } catch (err) {
                   addToast('Error cargando progreso', { type: 'error' });
                 }
               };

               // ── Instructors ───────────────────────────────────
               const loadInstructors = async (page = 0) => {
                 setLoadingInstructors(true);
                 try {
                   const q = instructorSearch ? `&search=${encodeURIComponent(instructorSearch)}` : '';
                   const res = await api.get(`/admin/instructors?page=${page}&size=20${q}`);
                   setInstructors(res.data.content || res.data);
                   setInstructorPage(page);
                 } catch (err) {
                   addToast('Error cargando instructores', { type: 'error' });
                 } finally {
                   setLoadingInstructors(false);
                 }
               };

               const openInstructorDetail = async (id) => {
                 try {
                   const res = await api.get(`/admin/instructors/${id}`);
                   setInstructorDetail(res.data);
                   setShowInstructorDetail(true);
                 } catch (err) {
                   addToast('Error cargando detalle del instructor', { type: 'error' });
                 }
               };

               // ── Profile Edit ──────────────────────────────────
               const openProfileEdit = (user, type) => {
                 setProfileEditUserId(user.id);
                 setProfileEditType(type);
                 setProfileForm({ fullName: user.fullName || '', bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
                 setShowProfileEdit(true);
               };

               const saveProfile = async () => {
                 try {
                   await api.put(`/admin/${profileEditType}/${profileEditUserId}/profile`, profileForm);
                   addToast('Perfil actualizado', { type: 'success' });
                   setShowProfileEdit(false);
                   if (profileEditType === 'students') loadStudents(studentPage);
                   else loadInstructors(instructorPage);
                 } catch (err) {
                   addToast('Error guardando perfil', { type: 'error' });
                 }
               };

               // ── Admin Management ──────────────────────────────
               const handleChangeRole = async () => {
                 if (!mgmtUserId) { addToast('Ingresa el ID del usuario', { type: 'error' }); return; }
                 if (!window.confirm(`¿Cambiar rol del usuario ${mgmtUserId} a ${mgmtNewRole}?`)) return;
                 try {
                   await api.put(`/admin/management/users/${mgmtUserId}/role`, { role: mgmtNewRole });
                   addToast('Rol actualizado correctamente', { type: 'success' });
                   setMgmtUserId('');
                   if (selectedMenu === 'students') loadStudents(studentPage);
                   if (selectedMenu === 'instructors') loadInstructors(instructorPage);
                 } catch (err) {
                   addToast(err.response?.data?.message || 'Error actualizando rol', { type: 'error' });
                 }
               };

               const handleToggleActive = async (userId, currentActive) => {
                 try {
                   await api.put(`/admin/management/users/${userId}/active`, { active: !currentActive });
                   addToast(`Usuario ${!currentActive ? 'activado' : 'desactivado'}`, { type: 'success' });
                   loadStudents(studentPage);
                 } catch (err) {
                   addToast('Error cambiando estado del usuario', { type: 'error' });
                 }
               };

               const handleIssueCertificate = async () => {
                 if (!certUserId || !certCourseId) {
                   addToast('Ingresa ID de usuario y curso', { type: 'error' });
                   return;
                 }
                 try {
                   await api.post(`/admin/management/certificates/${certUserId}/${certCourseId}`);
                   addToast('Certificado emitido correctamente', { type: 'success' });
                   setCertUserId('');
                   setCertCourseId('');
                 } catch (err) {
                   addToast(err.response?.data?.message || 'Error emitiendo certificado', { type: 'error' });
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
                           className={`admin-menu-item ${selectedMenu === 'dashboard' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('dashboard')}
                         >
                           Dashboard
                         </button>

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
                           className={`admin-menu-item ${selectedMenu === 'evaluaciones' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('evaluaciones')}
                         >
                           Evaluaciones
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

                         <button
                           className={`admin-menu-item ${selectedMenu === 'students' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('students')}
                         >
                           Estudiantes
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'instructors' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('instructors')}
                         >
                           Instructores
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'admin-mgmt' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('admin-mgmt')}
                         >
                           Gestión Roles
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'modulos' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('modulos')}
                         >
                           Módulos
                         </button>

                         <button
                           className={`admin-menu-item ${selectedMenu === 'categorias' ? 'active' : ''}`}
                           onClick={() => setSelectedMenu('categorias')}
                         >
                           Categorías/Tags
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
                                   <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Tipo de matrícula</label>
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
                                     placeholder="Sin límite"
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
                                   <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Categorías</label>
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
                                 <button type="button" className="btn-cancel" onClick={() => { setShowCourseForm(false); setIsEditing(false); setEditingCourseId(null); setCourseForm({ title: '', description: '', price: '', status: 'PUBLISHED', enrollmentType: 'OPEN', capacityLimit: '', certificateTemplate: '', categoryIds: [], tagIds: [], prerequisiteCourseIds: [] }); }}>Cancel</button>
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
                                     { course.status && <span className={`badge-status badge-${(course.status||'').toLowerCase()}`}>{course.status}</span> }
                                   </div>
                                   <p>{course.description}</p>
                                   <span className="meta">
                                     { (course.price === 0 || course.price === '0') ? 'Free' : `$${course.price}`} • {course.lessonCount} lessons
                                     { course.enrollmentType && course.enrollmentType !== 'OPEN' && <span style={{ marginLeft: 6 }}>• {course.enrollmentType}</span> }
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
                                         onClick={async () => { if(window.confirm('¿Archivar este curso?')) { await api.put(`/admin/courses/${course.id}/status`, { status: 'ARCHIVED' }); loadCourses(); } }}>
                                         Archivar
                                       </button>
                                     )}
                                   </div>
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

                       {/* Dashboard: renderiza el componente de métricas */}
                       {selectedMenu === 'dashboard' && (
                         <div className="admin-section">
                           <AdminDashboard />
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

                       {selectedMenu === 'evaluaciones' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Evaluaciones</h2>
                           </div>
                           <p>Gestión de evaluaciones (próximamente).</p>
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
                       {/* ── Estudiantes ─────────────────────────────── */}
                       {selectedMenu === 'students' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Estudiantes</h2>
                           </div>
                           <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                             <input
                               type="text"
                               placeholder="Buscar por nombre o email..."
                               value={studentSearch}
                               onChange={(e) => setStudentSearch(e.target.value)}
                               style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                             />
                             <button className="btn-create" onClick={() => loadStudents(0)}>Buscar</button>
                           </div>
                           {loadingStudents ? (
                             <div style={{ padding: 20, textAlign: 'center' }}>Cargando estudiantes...</div>
                           ) : (
                             <div className="users-list">
                               {students.length === 0 ? (
                                 <div style={{ padding: 20 }}>No se encontraron estudiantes.</div>
                               ) : (
                                 students.map((s) => (
                                   <div key={s.id} className="admin-user-card">
                                     <div className="user-info">
                                       <h3>{s.fullName}</h3>
                                       <p>{s.email}</p>
                                       <span className="meta">{s.role} • {s.isActive ? 'Activo' : 'Inactivo'}</span>
                                     </div>
                                     <div className="user-actions">
                                       <button className="btn-detail" onClick={() => openStudentDetail(s.id)}>Ver detalle</button>
                                       <button className="btn-create" onClick={() => openStudentProgress(s.id)}>Progreso</button>
                                       <button className="btn-edit" onClick={() => openProfileEdit(s, 'students')}>Editar perfil</button>
                                       <button
                                         className={s.isActive ? 'btn-delete' : 'btn-submit'}
                                         onClick={() => handleToggleActive(s.id, s.isActive)}
                                       >
                                         {s.isActive ? 'Desactivar' : 'Activar'}
                                       </button>
                                     </div>
                                   </div>
                                 ))
                               )}
                               <div style={{ marginTop: 12 }}>
                                 <button onClick={() => loadStudents(Math.max(0, studentPage - 1))} disabled={studentPage === 0}>Anterior</button>
                                 <button onClick={() => loadStudents(studentPage + 1)} style={{ marginLeft: 8 }}>Siguiente</button>
                               </div>
                             </div>
                           )}
                         </div>
                       )}

                       {/* ── Instructores ─────────────────────────────── */}
                       {selectedMenu === 'instructors' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Instructores</h2>
                           </div>
                           <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                             <input
                               type="text"
                               placeholder="Buscar por nombre o email..."
                               value={instructorSearch}
                               onChange={(e) => setInstructorSearch(e.target.value)}
                               style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                             />
                             <button className="btn-create" onClick={() => loadInstructors(0)}>Buscar</button>
                           </div>
                           {loadingInstructors ? (
                             <div style={{ padding: 20, textAlign: 'center' }}>Cargando instructores...</div>
                           ) : (
                             <div className="users-list">
                               {instructors.length === 0 ? (
                                 <div style={{ padding: 20 }}>No se encontraron instructores.</div>
                               ) : (
                                 instructors.map((ins) => (
                                   <div key={ins.id} className="admin-user-card">
                                     <div className="user-info">
                                       <h3>{ins.fullName}</h3>
                                       <p>{ins.email}</p>
                                       <span className="meta">{ins.role} • {ins.courseCount || 0} cursos</span>
                                     </div>
                                     <div className="user-actions">
                                       <button className="btn-detail" onClick={() => openInstructorDetail(ins.id)}>Ver detalle</button>
                                       <button className="btn-edit" onClick={() => openProfileEdit(ins, 'instructors')}>Editar perfil</button>
                                     </div>
                                   </div>
                                 ))
                               )}
                               <div style={{ marginTop: 12 }}>
                                 <button onClick={() => loadInstructors(Math.max(0, instructorPage - 1))} disabled={instructorPage === 0}>Anterior</button>
                                 <button onClick={() => loadInstructors(instructorPage + 1)} style={{ marginLeft: 8 }}>Siguiente</button>
                               </div>
                             </div>
                           )}
                         </div>
                       )}

                       {/* ── Gestión Roles ─────────────────────────────── */}
                       {selectedMenu === 'admin-mgmt' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Gestión de Roles y Permisos</h2>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                             <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                               <h3>Cambiar Rol de Usuario</h3>
                               <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                 <input
                                   type="number"
                                   placeholder="ID de Usuario"
                                   value={mgmtUserId}
                                   onChange={(e) => setMgmtUserId(e.target.value)}
                                   style={{ width: 140, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                                 />
                                 <select value={mgmtNewRole} onChange={(e) => setMgmtNewRole(e.target.value)} className="role-select">
                                   <option value="STUDENT">STUDENT</option>
                                   <option value="INSTRUCTOR">INSTRUCTOR</option>
                                   <option value="ADMIN">ADMIN</option>
                                 </select>
                                 <button className="btn-submit" onClick={handleChangeRole}>Cambiar Rol</button>
                               </div>
                             </div>
                             <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                               <h3>Emitir Certificado</h3>
                               <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                 <input
                                   type="number"
                                   placeholder="ID de Usuario"
                                   value={certUserId}
                                   onChange={(e) => setCertUserId(e.target.value)}
                                   style={{ width: 140, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                                 />
                                 <input
                                   type="number"
                                   placeholder="ID de Curso"
                                   value={certCourseId}
                                   onChange={(e) => setCertCourseId(e.target.value)}
                                   style={{ width: 140, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                                 />
                                 <button className="btn-submit" onClick={handleIssueCertificate}>Emitir Certificado</button>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* ── Módulos ─────────────────────────────── */}
                       {selectedMenu === 'modulos' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Módulos</h2>
                           </div>

                           {/* Course selector */}
                           <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                             <div style={{ flex: 1, minWidth: 200 }}>
                               <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Seleccionar curso</label>
                               <select
                                 className="role-select"
                                 style={{ width: '100%' }}
                                 value={modulesCourseId}
                                 onChange={(e) => {
                                   setModulesCourseId(e.target.value);
                                   if (e.target.value) loadModules(e.target.value);
                                   else setModules([]);
                                 }}
                               >
                                 <option value="">— Elige un curso —</option>
                                 {courses.map(c => (
                                   <option key={c.id} value={c.id}>{c.title}</option>
                                 ))}
                               </select>
                             </div>
                             {modulesCourseId && (
                               <button
                                 className="btn-create"
                                 onClick={() => {
                                   setIsEditingModule(false);
                                   setEditingModuleId(null);
                                   setModuleForm({ title: '', description: '', moduleOrder: modules.length + 1 });
                                   setShowModuleForm(true);
                                 }}
                               >
                                 + Nuevo Módulo
                               </button>
                             )}
                           </div>

                           {/* Module form */}
                           {showModuleForm && modulesCourseId && (
                             <form onSubmit={handleSaveModule} className="admin-form" style={{ marginBottom: 20 }}>
                               <h3 style={{ margin: '0 0 12px 0' }}>{isEditingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</h3>
                               <input
                                 type="text"
                                 placeholder="Título del módulo"
                                 value={moduleForm.title}
                                 onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                 required
                               />
                               <textarea
                                 placeholder="Descripción (opcional)"
                                 value={moduleForm.description}
                                 onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                 rows={2}
                               />
                               <input
                                 type="number"
                                 placeholder="Orden"
                                 value={moduleForm.moduleOrder}
                                 onChange={(e) => setModuleForm({ ...moduleForm, moduleOrder: e.target.value })}
                                 required
                                 min={1}
                               />
                               <div style={{ display: 'flex', gap: 10 }}>
                                 <button type="submit" className="btn-submit">{isEditingModule ? 'Actualizar' : 'Crear Módulo'}</button>
                                 <button type="button" className="btn-cancel" onClick={() => { setShowModuleForm(false); setIsEditingModule(false); setEditingModuleId(null); setModuleForm({ title: '', description: '', moduleOrder: 1 }); }}>Cancelar</button>
                               </div>
                             </form>
                           )}

                           {/* Modules list */}
                           {modulesCourseId ? (
                             modules.length === 0 ? (
                               <div style={{ padding: 20, color: '#666' }}>No hay módulos en este curso. Crea uno para organizar las lecciones.</div>
                             ) : (
                               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                 {modules.map((mod) => (
                                   <div key={mod.id} className="admin-course-card">
                                     <div className="course-info">
                                       <div className="course-title-row">
                                         <h3>#{mod.moduleOrder} {mod.title}</h3>
                                       </div>
                                       {mod.description && <p>{mod.description}</p>}
                                       <span className="meta">{mod.lessons ? mod.lessons.length : 0} lecciones</span>
                                     </div>
                                     <div className="course-actions">
                                       <button
                                         className="btn-edit"
                                         onClick={() => {
                                           setIsEditingModule(true);
                                           setEditingModuleId(mod.id);
                                           setModuleForm({ title: mod.title || '', description: mod.description || '', moduleOrder: mod.moduleOrder || 1 });
                                           setShowModuleForm(true);
                                           window.scrollTo({ top: 0, behavior: 'smooth' });
                                         }}
                                       >
                                         Editar
                                       </button>
                                       <button className="btn-delete" onClick={() => handleDeleteModule(mod.id)}>
                                         Eliminar
                                       </button>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )
                           ) : (
                             <div style={{ padding: 20, color: '#aaa' }}>Selecciona un curso para ver sus módulos.</div>
                           )}
                         </div>
                       )}

                       {/* ── Categorías/Tags ─────────────────────────────── */}
                       {selectedMenu === 'categorias' && (
                         <div className="admin-section">
                           <div className="section-header">
                             <h2>Categorías y Etiquetas</h2>
                           </div>

                           {/* ─ Categories ─ */}
                           <div style={{ marginBottom: 36 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                               <h3 style={{ margin: 0 }}>Categorías</h3>
                               <button
                                 className="btn-create"
                                 onClick={() => {
                                   setIsEditingCategory(false);
                                   setEditingCategoryId(null);
                                   setCategoryForm({ name: '', slug: '', description: '' });
                                   setShowCategoryForm(!showCategoryForm);
                                 }}
                               >
                                 {showCategoryForm ? 'Cancelar' : '+ Nueva Categoría'}
                               </button>
                             </div>

                             {showCategoryForm && (
                               <form onSubmit={handleSaveCategory} className="admin-form" style={{ marginBottom: 16 }}>
                                 <input
                                   type="text"
                                   placeholder="Nombre de la categoría"
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
                                   placeholder="Descripción (opcional)"
                                   value={categoryForm.description}
                                   onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                 />
                                 <div style={{ display: 'flex', gap: 10 }}>
                                   <button type="submit" className="btn-submit">{isEditingCategory ? 'Actualizar' : 'Crear Categoría'}</button>
                                   <button type="button" className="btn-cancel" onClick={() => { setShowCategoryForm(false); setIsEditingCategory(false); setEditingCategoryId(null); setCategoryForm({ name: '', slug: '', description: '' }); }}>Cancelar</button>
                                 </div>
                               </form>
                             )}

                             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                               {allCategories.length === 0 ? (
                                 <div style={{ padding: '12px 0', color: '#999' }}>No hay categorías creadas todavía.</div>
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
                                       <button className="btn-delete" onClick={() => handleDeleteCategory(cat.id)}>
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
                                 <div style={{ padding: '12px 0', color: '#999' }}>No hay etiquetas creadas todavía.</div>
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
                                       <button className="btn-delete" onClick={() => handleDeleteTag(tag.id)}>
                                         Eliminar
                                       </button>
                                     </div>
                                   </div>
                                 ))
                               )}
                             </div>
                           </div>
                         </div>
                       )}
                     </main>
                   </div>

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

                   {/* ── Student Detail Modal ── */}
                   {showStudentDetail && studentDetail && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content user-detail-modal">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>{studentDetail.fullName}</h2>
                           <button className="btn-cancel" onClick={() => { setShowStudentDetail(false); setStudentDetail(null); }}>Cerrar</button>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           <p><strong>Email:</strong> {studentDetail.email}</p>
                           <p><strong>Rol:</strong> {studentDetail.role}</p>
                           <p><strong>Estado:</strong> {studentDetail.isActive ? 'Activo' : 'Inactivo'}</p>
                           {studentDetail.bio && <p><strong>Bio:</strong> {studentDetail.bio}</p>}
                           {studentDetail.lastLogin && <p><strong>Último acceso:</strong> {new Date(studentDetail.lastLogin).toLocaleString()}</p>}
                           <p><strong>Inscripciones:</strong> {studentDetail.enrollmentCount || 0}</p>
                           <p><strong>Certificados:</strong> {studentDetail.certificateCount || 0}</p>
                           {studentDetail.enrollments && studentDetail.enrollments.length > 0 && (
                             <div style={{ marginTop: 12 }}>
                               <h4>Inscripciones</h4>
                               {studentDetail.enrollments.map((enr, i) => (
                                 <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                   <strong>{enr.courseTitle}</strong>
                                   {' — '}{enr.progressPercent != null ? enr.progressPercent.toFixed(0) : 0}% completado
                                   {enr.completedAt && <span className="meta"> • Completado {new Date(enr.completedAt).toLocaleDateString()}</span>}
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* ── Student Progress Modal ── */}
                   {showStudentProgress && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>Progreso del Estudiante</h2>
                           <button className="btn-cancel" onClick={() => { setShowStudentProgress(false); setStudentProgress([]); }}>Cerrar</button>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           {studentProgress.length === 0 ? (
                             <p>No hay progreso registrado.</p>
                           ) : (
                             studentProgress.map((prog, i) => (
                               <div key={i} style={{ marginBottom: 16 }}>
                                 <h4 style={{ marginBottom: 4 }}>{prog.courseTitle}</h4>
                                 <div style={{ background: '#eee', borderRadius: 4, height: 12, overflow: 'hidden' }}>
                                   <div style={{ width: `${prog.progressPercent || 0}%`, height: '100%', background: '#667eea' }} />
                                 </div>
                                 <span className="meta">{prog.completedLessons}/{prog.totalLessons} lecciones • {prog.progressPercent != null ? prog.progressPercent.toFixed(0) : 0}%</span>
                               </div>
                             ))
                           )}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* ── Instructor Detail Modal ── */}
                   {showInstructorDetail && instructorDetail && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content user-detail-modal">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>{instructorDetail.fullName}</h2>
                           <button className="btn-cancel" onClick={() => { setShowInstructorDetail(false); setInstructorDetail(null); }}>Cerrar</button>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           <p><strong>Email:</strong> {instructorDetail.email}</p>
                           <p><strong>Rol:</strong> {instructorDetail.role}</p>
                           {instructorDetail.bio && <p><strong>Bio:</strong> {instructorDetail.bio}</p>}
                           {instructorDetail.lastLogin && <p><strong>Último acceso:</strong> {new Date(instructorDetail.lastLogin).toLocaleString()}</p>}
                           <p><strong>Cursos asignados:</strong> {instructorDetail.courseCount || 0}</p>
                           {instructorDetail.courses && instructorDetail.courses.length > 0 && (
                             <div style={{ marginTop: 12 }}>
                               <h4>Cursos</h4>
                               {instructorDetail.courses.map((c, i) => (
                                 <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                   <strong>{c.title}</strong>
                                   <span className="meta"> • {c.enrollmentCount || 0} estudiantes</span>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* ── Profile Edit Modal ── */}
                   {showProfileEdit && (
                     <div className="modal" role="dialog" aria-modal="true">
                       <div className="modal-content">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2>Editar Perfil</h2>
                           <button className="btn-cancel" onClick={() => setShowProfileEdit(false)}>Cerrar</button>
                         </div>
                         <div style={{ marginTop: 12 }}>
                           <div style={{ marginBottom: 10 }}>
                             <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre completo</label>
                             <input
                               type="text"
                               value={profileForm.fullName}
                               onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                               style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                             />
                           </div>
                           <div style={{ marginBottom: 10 }}>
                             <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Bio</label>
                             <textarea
                               value={profileForm.bio}
                               onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                               rows={3}
                               style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                             />
                           </div>
                           <div style={{ marginBottom: 10 }}>
                             <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>URL de Avatar</label>
                             <input
                               type="text"
                               value={profileForm.avatarUrl}
                               onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                               style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                             />
                           </div>
                           <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                             <button className="btn-submit" onClick={saveProfile}>Guardar</button>
                             <button className="btn-cancel" onClick={() => setShowProfileEdit(false)}>Cancelar</button>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               );
             }

             export default Admin;
