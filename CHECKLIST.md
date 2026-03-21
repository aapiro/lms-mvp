# Checklist de Implementación - Course Management Feature

## Base de Datos

### Migraciones SQL
- [x] V13__course_catalog.sql - Categorías, Tags, Status, EnrollmentType, Capacity
- [x] V14__modules.sql - Módulos y campos drip en lecciones
- [x] V15__prerequisites.sql - Tabla de prerrequisitos
- [x] V16__drip_content.sql - AssessmentType y Lesson Association

## Backend - Entidades

### Nuevas Entidades
- [x] Module.java - id, courseId, title, description, moduleOrder, timestamps
- [x] Category.java - id, name (unique), slug (unique), description
- [x] Tag.java - id, name (unique), slug (unique)
- [x] CoursePrerequisite.java - id, courseId, prerequisiteCourseId

### Entidades Modificadas
- [x] Course.java
  - [x] CourseStatus enum (DRAFT, PUBLISHED, ARCHIVED)
  - [x] EnrollmentType enum (OPEN, INVITE_ONLY, PAID)
  - [x] capacityLimit
  - [x] certificateTemplate
  - [x] @ManyToMany categories
  - [x] @ManyToMany tags

- [x] Lesson.java
  - [x] LessonType enum (VIDEO, PDF, AUDIO)
  - [x] moduleId FK
  - [x] releaseAfterDays
  - [x] availableFrom
  - [x] @Transient available

- [x] Assessment.java
  - [x] AssessmentType enum (QUIZ, ASSIGNMENT)
  - [x] lessonId FK

## Backend - Repositorios

### Nuevos Repositorios
- [x] ModuleRepository
  - [x] findByCourseIdOrderByModuleOrderAsc(Long)
  - [x] deleteByCourseId(Long)

- [x] CategoryRepository
  - [x] findBySlug(String)
  - [x] findAllByOrderByNameAsc()

- [x] TagRepository
  - [x] findBySlug(String)
  - [x] findAllByOrderByNameAsc()

- [x] CoursePrerequisiteRepository
  - [x] findByCourseId(Long)
  - [x] deleteByCourseIdAndPrerequisiteCourseId(Long, Long)
  - [x] existsByCourseIdAndPrerequisiteCourseId(Long, Long)

### Repositorios Modificados
- [x] CourseRepository
  - [x] findByStatus(CourseStatus)
  - [x] findByStatusOrderByCreatedAtDesc(CourseStatus)
  - [x] @Query findByCategorySlug(String)
  - [x] @Query findByTagSlug(String)
  - [x] @Query countEnrolled(Long courseId)

- [x] LessonRepository
  - [x] findByModuleIdOrderByLessonOrderAsc(Long)
  - [x] findByCourseIdAndModuleIdOrderByLessonOrderAsc(Long, Long)
  - [x] findByCourseIdAndModuleIdIsNullOrderByLessonOrderAsc(Long)

- [x] AssessmentRepository
  - [x] findByLessonId(Long)

## Backend - DTOs

- [x] CourseDto.CreateCourseRequest
  - [x] status
  - [x] enrollmentType
  - [x] capacityLimit
  - [x] certificateTemplate
  - [x] categoryIds[]
  - [x] tagIds[]
  - [x] prerequisiteCourseIds[]

- [x] CourseDto.UpdateCourseRequest (todos opcionales)

- [x] CourseDto.CourseResponse
  - [x] status
  - [x] enrollmentType
  - [x] capacityLimit
  - [x] enrolledCount
  - [x] categories[]
  - [x] tags[]

- [x] CourseDto.CourseDetailResponse
  - [x] certificateTemplate
  - [x] prerequisitesMet
  - [x] modules[] (ModuleInfo[])
  - [x] prerequisites[] (PrerequisiteInfo[])

- [x] CourseDto.LessonInfo
  - [x] moduleId
  - [x] releaseAfterDays
  - [x] availableFrom
  - [x] available

- [x] CourseDto.ModuleInfo
  - [x] id, title, description, moduleOrder
  - [x] lessons[] (nested LessonInfo[])

- [x] CourseDto.PrerequisiteInfo
  - [x] courseId, courseTitle, completed

- [x] ModuleDto
  - [x] CreateModuleRequest: title, description, moduleOrder
  - [x] UpdateModuleRequest: id, title, description, moduleOrder
  - [x] ModuleResponse: full DTO con lessons[]
  - [x] AssignLessonRequest: moduleId

- [x] CategoryDto
  - [x] CategoryRequest: name, slug, description
  - [x] CategoryResponse: id, name, slug, description
  - [x] TagRequest: name, slug
  - [x] TagResponse: id, name, slug

## Backend - Servicios

### CourseService - Métodos Nuevos/Modificados
- [x] createCourse() - soporta nuevos campos
- [x] updateCourse() - soporta nuevos campos
- [x] changeStatus() - cambiar estado
- [x] getAllCourses() - filtros by category/tag/enrollmentType
- [x] getCourseById() - agrupa por módulo, calcula drip
- [x] addPrerequisite(Long courseId, Long prereqId)
- [x] removePrerequisite(Long courseId, Long prereqId)
- [x] getPrerequisites(Long courseId)
- [x] checkPrerequisitesMet(Long courseId, Long userId)
- [x] checkAndEnforceCapacity(Long courseId)
- [x] addCategoryToCourse(Long courseId, Long categoryId)
- [x] removeCategoryFromCourse(Long courseId, Long categoryId)
- [x] addTagToCourse(Long courseId, Long tagId)
- [x] removeTagFromCourse(Long courseId, Long tagId)
- [x] isLessonAvailable(Lesson, LocalDateTime purchaseDate)
- [x] Helper: applyCategories(), applyTags(), applyPrerequisites()

### ModuleService (Nuevo)
- [x] createModule(Long courseId, CreateModuleRequest req)
- [x] updateModule(Long moduleId, UpdateModuleRequest req)
- [x] deleteModule(Long moduleId)
- [x] getModulesByCourse(Long courseId)
- [x] assignLessonToModule(Long lessonId, Long moduleId)

### CategoryService (Nuevo)
- [x] getAllCategories()
- [x] getCategoryById(Long id)
- [x] createCategory(CategoryRequest req)
- [x] updateCategory(Long id, CategoryRequest req)
- [x] deleteCategory(Long id)
- [x] getAllTags()
- [x] getTagById(Long id)
- [x] createTag(TagRequest req)
- [x] updateTag(Long id, TagRequest req)
- [x] deleteTag(Long id)

### LessonService - Modificaciones
- [x] createLesson() - detecta tipo AUDIO
- [x] updateLesson() - soporta cambio de archivo
- [x] getLessonWithUrl() - calcula available
- [x] isLessonAvailable() - lógica drip

### StorageService - Modificaciones
- [x] uploadFile() - soporta carpeta "audios/"
- [x] Detecta AUDIO por extensión y MIME type

## Backend - Controladores

### AdminController - Nuevos Endpoints
- [x] PUT /api/admin/courses/{id}/status
- [x] GET /api/admin/courses/{courseId}/modules
- [x] POST /api/admin/courses/{courseId}/modules
- [x] PUT /api/admin/modules/{moduleId}
- [x] DELETE /api/admin/modules/{moduleId}
- [x] PUT /api/admin/lessons/{lessonId}/module
- [x] GET /api/admin/courses/{id}/prerequisites
- [x] POST /api/admin/courses/{id}/prerequisites
- [x] DELETE /api/admin/courses/{id}/prerequisites/{prereqId}
- [x] GET /api/admin/categories
- [x] POST /api/admin/categories
- [x] PUT /api/admin/categories/{id}
- [x] DELETE /api/admin/categories/{id}
- [x] POST /api/admin/courses/{id}/categories
- [x] DELETE /api/admin/courses/{id}/categories/{categoryId}
- [x] GET /api/admin/tags
- [x] POST /api/admin/tags
- [x] PUT /api/admin/tags/{id}
- [x] DELETE /api/admin/tags/{id}
- [x] POST /api/admin/courses/{id}/tags
- [x] DELETE /api/admin/courses/{id}/tags/{tagId}
- [x] POST /api/admin/courses/{courseId}/enroll
- [x] DELETE /api/admin/courses/{courseId}/enroll/{userId}

### CourseController - Modificaciones
- [x] GET /api/courses - parámetros: category, tag, enrollmentType
- [x] GET /api/categories - público
- [x] GET /api/tags - público

### SecurityConfig - Modificaciones
- [x] Permitir GET /api/courses, /api/courses/* sin auth
- [x] Permitir GET /api/categories, /api/tags sin auth

## Frontend - React

### Home.js
- [x] Carga categorías y tags en useEffect
- [x] Estado: filterCategory, filterTag, filterEnrollment
- [x] Selectores de filtro en UI
- [x] Parámetros en GET /api/courses
- [x] Botón "Limpiar filtros"
- [x] Badges para status, categorías, tags
- [x] Muestra capacidad si existe

### CourseDetail.js
- [x] Agrupa lecciones por módulo si existen
- [x] Renderiza ModuleSection con título
- [x] Icono 🔒 si lección no disponible
- [x] Banner de prerrequisitos pendientes
- [x] Badges INVITE_ONLY y PAID
- [x] Muestra "X/limit plazas"

### Lesson.js
- [x] Soporte `<audio controls>` para AUDIO
- [x] Redirección si lección no disponible
- [x] Muestra mensaje de drip

### Admin.js
- [x] Formulario de curso con status
- [x] Input enrollmentType
- [x] Input capacityLimit
- [x] Input certificateTemplate
- [x] Multi-select categorías
- [x] Multi-select tags
- [x] Gestión de categorías/tags
- [x] Sección prerrequisitos

### CSS Estilos
- [x] .badge-status, .badge-draft, .badge-published, .badge-archived
- [x] .badge-cat, .badge-tag, .badge-invite, .badge-capacity
- [x] .module-section, .module-title
- [x] .prereq-warning, .drip-lock
- [x] .course-filters (flex layout)

## Seguridad y Validaciones

- [x] No mostrar cursos no publicados a usuarios (404, no 403)
- [x] Validar capacidad en matrícula
- [x] Validar prerrequisitos cumplidos
- [x] Verificar drip content antes de acceso a lección
- [x] JWT tokens en endpoints admin
- [x] Roles ADMIN para endpoints /api/admin/**

## Compatibilidad

- [x] Backward compatibility: moduleId = null → lista plana
- [x] CourseDetailResponse siempre incluye lessons[] + modules[]
- [x] Archivos AUDIO soportados (mp3, m4a, wav, aac, ogg)

## Pruebas Manuales Recomendadas

- [x] Crear curso con estado DRAFT
- [x] Publicar curso (cambiar a PUBLISHED)
- [x] Crear módulos y asignar lecciones
- [x] Crear categorías y tags
- [x] Asignar categorías/tags a curso
- [x] Establecer prerrequisito entre dos cursos
- [x] Completar prerequisito y verificar acceso
- [x] Cargar archivo AUDIO
- [x] Reproducir audio en lección
- [x] Establecer drip content (release_after_days o available_from)
- [x] Verificar que lección está bloqueada
- [x] Esperar periodo o cambiar fecha
- [x] Verificar que lección se desbloquea
- [x] Establecer capacityLimit
- [x] Verificar limitación en matrícula
- [x] Filtrar cursos por categoría
- [x] Filtrar cursos por tag
- [x] Filtrar cursos por enrollmentType

## Correcciones y Mejoras Post-Implementación

### ✅ Modales Superpuestos en Admin (21 de Marzo de 2026)
- [x] Identificado problema de z-index en Admin.js
- [x] Reordenado renderizado de modales
- [x] Corregida jerarquía de z-index para modales (Course Students: 1000, Details/Progress: 1100)
- [x] Validado que modales de estudiante se abren correctamente desde lista del curso

### ✅ Cursos Gratis Incorrectamente "Owned" para Todos (21 de Marzo de 2026)
- [x] Identificado problema: cursos gratis se marcaban automáticamente como purchased para todos
- [x] Corregida lógica en CourseService.buildCourseResponse()
- [x] Corregida lógica en CourseService.getCourseById()
- [x] Creada migración V17 para generar registros de compra con monto 0
- [x] Verificado que frontend ya manejaba correctamente cursos gratis
- [x] Documentado en CHANGELOG_FIXES.md

## Notas

- Todos los DTOs incluyen validaciones @NotBlank/@NotNull apropiadas
- Los servicios manejan excepciones con mensajes descriptivos
- Las migraciones usan "IF NOT EXISTS" para idempotencia
- Índices de BD optimizados para queries frecuentes
- Frontend soporta mode reactivo con hooks y eventos custom

---

**Completado:** 21 de marzo de 2026

