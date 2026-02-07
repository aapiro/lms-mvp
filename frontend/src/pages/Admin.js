import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadCourses();
  }, []);

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

   const handleCreateLesson = async (e) => {
     e.preventDefault();

     const formData = new FormData();
     formData.append('title', lessonForm.title);
     formData.append('lessonOrder', lessonForm.lessonOrder);
     if (lessonForm.durationSeconds) {
       formData.append('durationSeconds', lessonForm.durationSeconds);
     }
     formData.append('file', lessonForm.file);

     try {
       await api.post(`/admin/courses/${selectedCourse}/lessons`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });

       setLessonForm({ title: '', lessonOrder: 1, durationSeconds: '', file: null });
       setShowLessonForm(false);
       setSelectedCourse(null);
       loadCourses();
       alert('Lesson created successfully!');
     } catch (err) {
       alert(err.response?.data?.error || 'Failed to create lesson');
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
               className={`admin-menu-item ${selectedMenu === 'progreso' ? 'active' : ''}`}
               onClick={() => setSelectedMenu('progreso')}
             >
               Progreso
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
                       <button
                         onClick={() => {
                           setSelectedCourse(course.id);
                           setShowLessonForm(true);
                         }}
                         className="btn-add-lesson"
                       >
                         + Add Lesson
                       </button>
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
               <p>Listado de compras y gestión (próximamente).</p>
             </div>
           )}

           {selectedMenu === 'usuarios' && (
             <div className="admin-section">
               <div className="section-header">
                 <h2>Usuarios</h2>
               </div>
               <p>Gestión de usuarios (próximamente).</p>
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

         </main>
       </div>

       {/* Lesson modal stays at root so it overlays correctly */}
       {showLessonForm && selectedCourse && (
         <div className="modal">
           <div className="modal-content">
             <h2>Add Lesson to Course</h2>
             <form onSubmit={handleCreateLesson} className="admin-form">
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
                 <label>Upload Video or PDF</label>
                 <input
                   type="file"
                   accept="video/*,application/pdf"
                   onChange={(e) => setLessonForm({ ...lessonForm, file: e.target.files[0] })}
                   required
                 />
               </div>
               <div className="modal-actions">
                 <button type="submit" className="btn-submit">Create Lesson</button>
                 <button
                   type="button"
                   onClick={() => {
                     setShowLessonForm(false);
                     setSelectedCourse(null);
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
     </div>
   );
 }

 export default Admin;
