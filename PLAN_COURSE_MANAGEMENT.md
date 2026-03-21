# Plan: Course Management Feature

**Fecha:** 2026-03-21 | **Status:** Planning (no ejecutar)

## Resumen ejecutivo

Implementar gestión avanzada de cursos: estados (DRAFT/PUBLISHED/ARCHIVED), categorías/etiquetas, módulos, 
tipo AUDIO, prerrequisitos, tipos de matrícula (OPEN/INVITE_ONLY/PAID), límite de capacidad, plantilla de 
certificado y drip content.

**Componentes:** 4 migraciones SQL + 5 entidades nuevas + 3 entidades modificadas + 7 servicios + 3 controladores 
+ 8 componentes React.

---

## Fase 1: SQL Migrations (V18-V21)

**V18__course_catalog.sql:**
- ALTER courses: ADD status (DRAFT/PUBLISHED/ARCHIVED), enrollment_type (OPEN/INVITE_ONLY/PAID), capacity_limit, certificate_template
- CREATE categories table (id, name, slug unique, description)
- CREATE course_categories join table
- CREATE tags table (id, name, slug unique)
- CREATE course_tags join table
- Índices: idx_courses_status, idx_courses_enrollment, idx_course_categories_cat, idx_course_tags_tag

**V19__modules.sql:**
- CREATE modules table (id, course_id FK, title, description, module_order, timestamps)
- ALTER lessons: ADD module_id FK (nullable) REFERENCES modules
- Índices: idx_modules_course_id, idx_lessons_module_id

**V20__prerequisites.sql:**
- CREATE course_prerequisites table (id, course_id FK, prerequisite_course_id FK, UNIQUE constraint)
- Índices: idx_prereq_course_id, idx_prereq_prereq_id

**V21__drip_content.sql:**
- ALTER lessons: ADD release_after_days (INT nullable), available_from (TIMESTAMP nullable)
- ALTER assessments: ADD assessment_type (QUIZ/ASSIGNMENT), lesson_id FK (nullable)
- Índice: idx_assessments_lesson_id

---

## Fase 2: Entidades Java

**Nuevas:**
- Module (id, courseId, title, description, moduleOrder, createdAt, updatedAt)
- Category (id, name, slug unique, description)
- Tag (id, name, slug unique)
- CoursePrerequisite (id, courseId, prerequisiteCourseId)

**Modificar Course.java:**
```
+ @Enumerated CourseStatus status = DRAFT (DRAFT, PUBLISHED, ARCHIVED)
+ @Enumerated EnrollmentType enrollmentType = OPEN (OPEN, INVITE_ONLY, PAID)
+ Integer capacityLimit
+ String certificateTemplate (length=500)
+ @ManyToMany Set<Category> categories
+ @ManyToMany Set<Tag> tags
```

**Modificar Lesson.java:**
```
+ LessonType enum: VIDEO, PDF, AUDIO
+ Long moduleId (nullable)
+ Integer releaseAfterDays (nullable)
+ LocalDateTime availableFrom (nullable)
+ transient boolean available (calculado)
```

**Modificar Assessment.java:**
```
+ @Enumerated AssessmentType assessmentType = QUIZ (QUIZ, ASSIGNMENT)
+ Long lessonId (nullable)
```

---

## Fase 3: Repositorios (19 totales)

**CourseRepository (agregar):**
- findByStatus(CourseStatus)
- findByStatusOrderByCreatedAtDesc(CourseStatus)
- findByCategoriesSlug(String)
- findByTagsSlug(String)
- @Query countEnrolled(courseId)

**ModuleRepository (nuevo):**
- findByCourseIdOrderByModuleOrderAsc(Long)
- deleteByCourseId(Long)

**CategoryRepository (nuevo):**
- findBySlug(String)
- findAllByOrderByNameAsc()

**TagRepository (nuevo):**
- findBySlug(String)
- findAllByOrderByNameAsc()

**CoursePrerequisiteRepository (nuevo):**
- findByCourseId(Long)
- deleteByCourseIdAndPrerequisiteCourseId(Long, Long)
- existsByCourseIdAndPrerequisiteCourseId(Long, Long)

**LessonRepository (agregar):**
- findByModuleIdOrderByLessonOrderAsc(Long)
- findByCourseIdAndModuleIdOrderByLessonOrderAsc(Long, Long)

**AssessmentRepository (agregar):**
- findByCourseIdAndAssessmentType(Long, AssessmentType)
- findByLessonId(Long)

---

## Fase 4: DTOs

**CourseDto (expandir):**
- CreateCourseRequest: add status, enrollmentType, capacityLimit, certificateTemplate, categoryIds, tagIds, prerequisiteCourseIds
- UpdateCourseRequest: ídem campos opcionales
- CourseResponse: add status, enrollmentType, capacityLimit, enrolledCount, categories, tags
- CourseDetailResponse: add certificateTemplate, prerequisitesMet, modules (ModuleInfo[]), prerequisites (PrerequisiteInfo[])
- ModuleInfo class: id, title, description, moduleOrder, lessons
- PrerequisiteInfo class: courseId, courseTitle, completed

**ModuleDto (nuevo):**
- CreateModuleRequest: title, description, moduleOrder
- UpdateModuleRequest: ídem opcionales
- ModuleResponse: id, courseId, title, description, moduleOrder, lessons

**CategoryDto y TagDto (nuevos):**
- CategoryRequest/CategoryResponse: id, name, slug, description
- TagRequest/TagResponse: id, name, slug

---

## Fase 5: Servicios (7 totales)

**CourseService (modificar):**
- createCourse(): poblar status, enrollmentType, capacityLimit, certificateTemplate, resolver categoryIds/tagIds/prerequisiteIds
- updateCourse(): ídem
- getAllCourses(user, categorySlug, tagSlug, enrollmentType): filtrar PUBLISHED si no admin, soportar filtros, agregar enrolledCount
- getCourseById(id, user): agrupar lecciones por módulo, calcular prerequisitesMet, calcular lesson.available
- changeStatus(courseId, newStatus): validaciones de transición
- checkPrerequisitesMet(courseId, userId): verificar 100% progreso en cada prereq
- isLessonAvailable(lesson, purchaseDate): lógica drip (availableFrom OR releaseAfterDays)
- checkAndEnforceCapacity(courseId): lanzar 400 si enrolledCount >= capacityLimit

**ModuleService (nuevo):**
- createModule(courseId, request)
- updateModule(moduleId, request)
- deleteModule(moduleId): desasignar lecciones
- getModulesByCourse(courseId): con lecciones anidadas
- assignLessonToModule(lessonId, moduleId)

**CategoryService (nuevo):** CRUD + findBySlug()

**TagService (nuevo):** CRUD + findBySlug()

**LessonService (modificar):**
- createLesson(): soporte AUDIO (carpeta "audios/", content-type audio/*)
- updateLesson(): guardar moduleId, releaseAfterDays, availableFrom
- getLessonWithUrl(): calcular available; lanzar 403 si drip bloqueado

**StorageService (modificar):**
- Detectar AUDIO: mp3, m4a, wav, aac, ogg → carpeta "audios/", content-type audio/mpeg, etc.

---

## Fase 6: Controladores (~20 endpoints nuevos)

**AdminController (nuevos):**
- PUT /api/admin/courses/{id}/status { status }
- POST /api/admin/courses/{courseId}/modules
- GET /api/admin/courses/{courseId}/modules
- PUT /api/admin/modules/{moduleId}
- DELETE /api/admin/modules/{moduleId}
- PUT /api/admin/lessons/{lessonId}/module { moduleId }
- GET /api/admin/courses/{id}/prerequisites
- POST /api/admin/courses/{id}/prerequisites { prerequisiteCourseId }
- DELETE /api/admin/courses/{id}/prerequisites/{prereqId}
- GET /api/admin/categories
- POST /api/admin/categories
- PUT /api/admin/categories/{id}
- DELETE /api/admin/categories/{id}
- POST /api/admin/courses/{id}/categories { categoryId }
- DELETE /api/admin/courses/{id}/categories/{categoryId}
- GET /api/admin/tags
- POST /api/admin/tags
- PUT /api/admin/tags/{id}
- DELETE /api/admin/tags/{id}
- POST /api/admin/courses/{id}/tags { tagId }
- DELETE /api/admin/courses/{id}/tags/{tagId}
- POST /api/admin/courses/{courseId}/enroll { userId }
- DELETE /api/admin/courses/{courseId}/enroll/{userId}

**CourseController (modificar):**
- GET /api/courses: agregar params category (slug), tag (slug), enrollmentType
- GET /api/categories (público, sin auth)
- GET /api/tags (público, sin auth)

**SecurityConfig (modificar):**
- Permitir GET /api/categories, /api/tags sin autenticación

---

## Fase 7: Frontend React

**Admin.js (expandir formulario de curso):**
- courseForm state: add status, enrollmentType, capacityLimit, certificateTemplate, categoryIds, tagIds
- Form fields: select status (DRAFT/PUBLISHED/ARCHIVED), select enrollmentType, input capacityLimit, input certificateTemplate
- Multi-select: categories (cargado de GET /admin/categories), tags (cargado de GET /admin/tags)
- Botones de estado rápido: "Publicar", "Archivar", "Borrador"
- Badge de estado en cada tarjeta de curso (coloreado por estado)
- Nuevo submenú selectedMenu='modulos': selector de curso + lista de módulos + CRUD + asignación de lecciones
- Nuevo submenú selectedMenu='categorias': tablas CRUD para categorías y tags
- Pestaña "Prerrequisitos" en modal de detalle de curso: lista + selector para agregar + botón eliminar

**CourseDetail.js (expandir):**
- Si course.modules existe y tiene elementos: agrupar lecciones por módulo (crear sección por módulo con su title)
- Si !lesson.available: mostrar 🔒 con fecha (availableFrom) o días (releaseAfterDays)
- Si !course.prerequisitesMet: mostrar banner azul "Prerrequisitos pendientes: [links a cursos]"
- Badge si enrollmentType === 'INVITE_ONLY' o 'PAID'
- Mostrar capacidad: si capacityLimit, mostrar "X/{capacityLimit} plazas"

**Home.js (agregar filtros):**
- Cargar de GET /api/categories, GET /api/tags al montar
- Tres selects: filter por category (slug), filter por tag (slug), filter por enrollmentType
- Pasar parámetros en GET /api/courses

**Lesson.js (agregar):**
- Soporte para `<audio controls src={streamUrl} />` si lesson.lessonType === 'AUDIO'
- Si lesson.available === false: redirigir a course con mensaje "Esta lección aún no está disponible"

**Admin.css, CourseDetail.css, Home.css, Lesson.css (agregar estilos):**
- .badge-status, .badge-draft (gris), .badge-published (verde), .badge-archived (naranja)
- .module-section, .module-title (padding, border-left colored)
- .prereq-warning (background azul claro, padding, border)
- .drip-lock (texto gris, tamaño pequeño)
- .course-filters (flex, gap, margin-bottom)

---

## Consideraciones transversales

1. **Seguridad de visibilidad:** Si user.role != ADMIN y course.status != PUBLISHED → retornar 404 (no 403)
2. **Validación de capacidad:** En PaymentService.completePurchase() y enroll manual → verif enrolledCount < capacityLimit
3. **Validación de prerrequisitos:** En PaymentService para PAID/INVITE_ONLY → checkPrerequisitesMet() → 400 si falla
4. **Backward compatibility:** moduleId = null → lista plana (sin módulos); CourseDetailResponse siempre incluye lessons + modules
5. **Tipo AUDIO:** Extensiones mp3, m4a, wav, aac, ogg; content-type audio/mpeg, audio/aac, audio/wav, audio/ogg
6. **Orden ejecución:** SQL → Entidades → Repos → DTOs → Services → Controllers → Frontend

---

## Archivos: Resumen de cambios

### Backend — Crear (19 archivos)
- Migraciones: V18__course_catalog.sql, V19__modules.sql, V20__prerequisites.sql, V21__drip_content.sql
- Entidades: Module.java, Category.java, Tag.java, CoursePrerequisite.java
- Repos: ModuleRepository.java, CategoryRepository.java, TagRepository.java, CoursePrerequisiteRepository.java
- DTOs: ModuleDto.java, CategoryDto.java, TagDto.java
- Services: ModuleService.java, CategoryService.java, TagService.java

### Backend — Modificar (13 archivos)
Course.java, CourseRepository.java, CourseDto.java, CourseService.java, Lesson.java, LessonRepository.java, 
LessonService.java, Assessment.java, AssessmentRepository.java, StorageService.java, SecurityConfig.java, 
AdminController.java, CourseController.java

### Frontend — Modificar (8 archivos)
Admin.js, Admin.css, CourseDetail.js, CourseDetail.css, Home.js, Home.css, Lesson.js, Lesson.css

---

*Este plan NO debe ser ejecutado. Es solo un blueprint para implementación futura.*

