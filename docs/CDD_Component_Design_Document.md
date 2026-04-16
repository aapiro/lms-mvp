# CDD — Component Design Document
## LMS MVP Platform — Frontend Components

**Versión:** 1.0  
**Fecha:** 2026-04-15  

---

## 1. Inventario de Componentes Actual

### 1.1 Componentes Existentes

| Componente | Ubicación | Líneas | Responsabilidad | Estado |
|-----------|-----------|--------|-----------------|--------|
| Header | `components/Header.js` | 33 | Navegación principal | Funcional, necesita mejoras |
| ConfirmModal | `components/ConfirmModal.js` | 19 | Diálogo de confirmación | Funcional |
| ToastProvider | `components/ToastProvider.js` | 43 | Notificaciones toast | Funcional |

### 1.2 Páginas como Componentes (Monolitos)

| Página | Ubicación | Líneas | Sub-componentes internos | Complejidad |
|--------|-----------|--------|--------------------------|-------------|
| Admin | `pages/Admin.js` | 2235 | ~15 secciones inline | **Extrema** |
| Assessments | `pages/Assessments.js` | 454 | 3 (List, CreateForm, TakeModal) | Alta |
| Profile | `pages/Profile.js` | 401 | 4 tabs inline | Alta |
| AdminDashboard | `pages/AdminDashboard.js` | 326 | ActivityHeatmap inline | Media |
| Lesson | `pages/Lesson.js` | 293 | VideoPlayer inline | Media |
| CourseDetail | `pages/CourseDetail.js` | 238 | LessonRow inline | Media |
| Home | `pages/Home.js` | 158 | CourseCard inline | Baja |
| Register | `pages/Register.js` | 83 | — | Baja |
| Login | `pages/Login.js` | 73 | — | Baja |

---

## 2. Arquitectura de Componentes Propuesta

### 2.1 Jerarquía de Componentes

```
App
├── ThemeProvider
│   └── AuthProvider
│       └── NotificationProvider
│           └── ToastProvider
│               └── Router
│                   ├── PageLayout
│                   │   ├── Header
│                   │   │   ├── Logo
│                   │   │   ├── SearchBar
│                   │   │   ├── NotificationBell
│                   │   │   └── UserMenu
│                   │   ├── <Page Content>
│                   │   └── Footer (futuro)
│                   │
│                   ├── AuthLayout (login/register)
│                   │   └── <Auth Forms>
│                   │
│                   └── AdminLayout
│                       ├── AdminSidebar
│                       └── <Admin Page Content>
```

### 2.2 Catálogo de Componentes — Common (Reutilizables)

---

#### `Button`
**Propósito:** Botón consistente para toda la app.  
**Ubicación propuesta:** `components/common/Button/Button.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'link'` | `'primary'` | Estilo visual |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| loading | `boolean` | `false` | Muestra spinner y deshabilita |
| disabled | `boolean` | `false` | Deshabilitado |
| icon | `ReactNode` | — | Icono a la izquierda |
| fullWidth | `boolean` | `false` | Ocupa ancho completo |
| onClick | `function` | — | Handler |
| children | `ReactNode` | — | Contenido del botón |

**Reemplaza:** Todas las clases CSS `.btn-create`, `.btn-submit`, `.btn-delete`, `.btn-edit`, `.btn-cancel`, `.btn-detail` y sus estilos duplicados en Admin.css, Home.css, Profile.css, etc.

**Variantes visuales:**
```
[Primary]  → fondo #667eea, texto blanco (acciones principales)
[Secondary] → fondo blanco, borde gris (acciones secundarias)
[Danger]   → fondo #e74c3c, texto blanco (eliminar, desactivar)
[Ghost]    → sin fondo, texto color primary (acciones terciarias)
[Link]     → parece enlace, sin padding (navegación inline)
```

---

#### `Modal`
**Propósito:** Modal reutilizable que reemplaza ConfirmModal y los modals inline.  
**Ubicación propuesta:** `components/common/Modal/Modal.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controla visibilidad |
| onClose | `function` | — | Handler de cierre |
| title | `string` | — | Título del modal |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Ancho del modal |
| footer | `ReactNode` | — | Contenido del footer (botones) |
| closeOnOverlay | `boolean` | `true` | Cerrar al clickear overlay |
| children | `ReactNode` | — | Contenido |

**Mejoras sobre ConfirmModal actual:**
- Cierre con tecla Escape
- Trap de foco (accesibilidad)
- Animación de entrada/salida
- Tamaños configurables
- Scroll interno para contenido largo
- `aria-modal`, `role="dialog"`

---

#### `FormField`
**Propósito:** Campo de formulario con label, input, validación y mensaje de error.  
**Ubicación propuesta:** `components/common/FormField/FormField.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| label | `string` | — | Etiqueta del campo |
| name | `string` | — | Name del input |
| type | `string` | `'text'` | Tipo de input |
| value | `any` | — | Valor controlado |
| onChange | `function` | — | Handler de cambio |
| error | `string` | — | Mensaje de error |
| required | `boolean` | `false` | Campo requerido |
| placeholder | `string` | — | Placeholder |
| helpText | `string` | — | Texto de ayuda debajo |
| as | `'input' \| 'textarea' \| 'select'` | `'input'` | Tipo de elemento |
| options | `Array<{value, label}>` | — | Opciones para select |

**Reemplaza:** Los patrones repetidos en Admin.js, Login.js, Register.js, Profile.js:
```jsx
// ACTUAL (repetido ~40 veces en el código)
<div className="form-group">
  <label>Email</label>
  <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
</div>

// PROPUESTO
<FormField label="Email" type="email" name="email" 
  value={email} onChange={handleChange} error={errors.email} />
```

---

#### `Pagination`
**Propósito:** Paginación consistente para listas.  
**Ubicación propuesta:** `components/common/Pagination/Pagination.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| currentPage | `number` | — | Página actual (0-based) |
| totalPages | `number` | — | Total de páginas |
| onPageChange | `function` | — | Handler (recibe número) |
| showInfo | `boolean` | `true` | Muestra "Página X de Y" |

**Reemplaza:** Los botones prev/next duplicados en Admin.js (compras, audit, estudiantes, instructores) que actualmente no muestran el total de páginas.

---

#### `Badge`
**Propósito:** Etiqueta visual para estados, roles, categorías.  
**Ubicación propuesta:** `components/common/Badge/Badge.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| variant | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'neutral'` | Color |
| size | `'sm' \| 'md'` | `'sm'` | Tamaño |
| children | `ReactNode` | — | Texto |

**Mapeo de estados:**
- PUBLISHED / COMPLETED / ACTIVE → `success` (verde)
- DRAFT / IN_PROGRESS / PENDING → `warning` (amarillo)
- ARCHIVED / FAILED / INACTIVE → `danger` (rojo)
- ADMIN / INSTRUCTOR → `info` (azul)
- USER / STUDENT → `neutral` (gris)

---

#### `Card`
**Propósito:** Contenedor con sombra y padding consistente.  
**Ubicación propuesta:** `components/common/Card/Card.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| hoverable | `boolean` | `false` | Efecto hover (elevación) |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interno |
| onClick | `function` | — | Hace clickeable toda la card |
| header | `ReactNode` | — | Sección header |
| footer | `ReactNode` | — | Sección footer |
| children | `ReactNode` | — | Contenido |

---

#### `EmptyState`
**Propósito:** Estado vacío consistente para listas sin resultados.  
**Ubicación propuesta:** `components/common/EmptyState/EmptyState.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| icon | `string` | `'📭'` | Emoji o icono |
| title | `string` | — | Título |
| description | `string` | — | Descripción |
| action | `ReactNode` | — | Botón o link de acción |

---

#### `LoadingSkeleton`
**Propósito:** Placeholder animado durante carga.  
**Ubicación propuesta:** `components/common/LoadingSkeleton/LoadingSkeleton.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| variant | `'text' \| 'card' \| 'avatar' \| 'table-row'` | `'text'` | Forma |
| count | `number` | `1` | Repeticiones |
| width | `string` | `'100%'` | Ancho |

---

#### `SearchBar`
**Propósito:** Barra de búsqueda con debounce.  
**Ubicación propuesta:** `components/common/SearchBar/SearchBar.js`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| value | `string` | — | Valor controlado |
| onChange | `function` | — | Handler (con debounce 300ms interno) |
| placeholder | `string` | `'Buscar...'` | Placeholder |
| loading | `boolean` | `false` | Spinner de búsqueda |

---

### 2.3 Catálogo de Componentes — Domain (Específicos del LMS)

---

#### `CourseCard`
**Propósito:** Card de curso para Home y listados.  
**Ubicación propuesta:** `components/domain/CourseCard/CourseCard.js`

**Extraído de:** `Home.js` (inline en el map de cursos)

| Prop | Tipo | Descripción |
|------|------|-------------|
| course | `Course` | Objeto del curso |
| userProgress | `number \| null` | Porcentaje de progreso (null si no inscrito) |
| onClick | `function` | Navegación al detalle |

**Renderiza:**
- Thumbnail con badge de precio
- Título + estado
- Instructor
- Categorías + tags como `<Badge>`
- Barra de progreso (si inscrito)
- Botón contextual (Ver / Continuar / Completado)

---

#### `LessonRow`
**Propósito:** Fila de lección en listado de curso.  
**Ubicación propuesta:** `components/domain/LessonRow/LessonRow.js`

**Extraído de:** `CourseDetail.js` (componente inline `LessonRow`)

| Prop | Tipo | Descripción |
|------|------|-------------|
| lesson | `Lesson` | Objeto de lección |
| isLocked | `boolean` | Si está bloqueada |
| isCompleted | `boolean` | Si está completada |
| onClick | `function` | Navegación |

---

#### `ProgressBar`
**Propósito:** Barra de progreso reutilizable.  
**Ubicación propuesta:** `components/domain/ProgressBar/ProgressBar.js`

**Extraído de:** Duplicado en Home.js, CourseDetail.js, Profile.js, Admin.js

| Prop | Tipo | Descripción |
|------|------|-------------|
| percentage | `number` | 0-100 |
| showLabel | `boolean` | Mostrar "X%" |
| size | `'sm' \| 'md'` | Tamaño |
| color | `string` | Color (default: success) |

---

#### `VideoPlayer`
**Propósito:** Reproductor de video encapsulado.  
**Ubicación propuesta:** `components/domain/VideoPlayer/VideoPlayer.js`

**Extraído de:** `Lesson.js` (lógica de Plyr, MIME detection, fallbacks)

| Prop | Tipo | Descripción |
|------|------|-------------|
| src | `string` | URL del video (presigned) |
| lessonType | `'VIDEO' \| 'AUDIO' \| 'PDF'` | Tipo de contenido |
| onEnded | `function` | Callback al terminar |

**Encapsula:**
- Inicialización de Plyr
- Detección de MIME type
- Fallback para codecs no soportados
- Overlay de play para autoplay
- Cleanup del player en unmount

---

#### `AssessmentCard`
**Propósito:** Card de evaluación disponible.  
**Ubicación propuesta:** `components/domain/AssessmentCard/AssessmentCard.js`

**Extraído de:** `Assessments.js` (inline en el map)

| Prop | Tipo | Descripción |
|------|------|-------------|
| assessment | `Assessment` | Objeto |
| onStart | `function` | Iniciar evaluación |

---

#### `NotificationBell`
**Propósito:** Icono de campana con dropdown de notificaciones.  
**Ubicación propuesta:** `components/domain/NotificationBell/NotificationBell.js`

**Nuevo componente** para el sistema de notificaciones propuesto.

| Prop | Tipo | Descripción |
|------|------|-------------|
| count | `number` | Notificaciones no leídas |
| notifications | `Array` | Lista de notificaciones |
| onMarkRead | `function` | Marcar como leída |
| onClickNotification | `function` | Navegar al recurso |

---

### 2.4 Catálogo de Componentes — Layout

---

#### `PageLayout`
**Propósito:** Layout base para páginas públicas (Header + content).  
**Ubicación propuesta:** `components/layout/PageLayout/PageLayout.js`

```jsx
<PageLayout>
  <Header />
  <main className="page-content">
    {children}
  </main>
</PageLayout>
```

---

#### `AdminLayout`
**Propósito:** Layout para admin con sidebar colapsable.  
**Ubicación propuesta:** `components/layout/AdminLayout/AdminLayout.js`

```jsx
<AdminLayout>
  <AdminSidebar 
    activeItem={activeSection}
    onNavigate={setActiveSection}
    collapsed={sidebarCollapsed}
  />
  <main className="admin-content">
    <Breadcrumbs items={breadcrumbs} />
    {children}
  </main>
</AdminLayout>
```

---

#### `AdminSidebar`
**Propósito:** Sidebar del panel admin con navegación agrupada.  
**Ubicación propuesta:** `components/layout/AdminSidebar/AdminSidebar.js`

| Prop | Tipo | Descripción |
|------|------|-------------|
| activeItem | `string` | Sección activa |
| onNavigate | `function` | Cambiar sección |
| collapsed | `boolean` | Solo iconos |

**Grupos de navegación:**
1. Dashboard
2. Contenido (Cursos, Lecciones, Módulos, Categorías/Tags)
3. Evaluaciones
4. Usuarios (Estudiantes, Instructores, Roles, Grupos)
5. Operaciones (Compras, Waitlist, Notificaciones)
6. Sistema (Audit Logs, Configuración)

---

## 3. Descomposición del Admin.js (2235 → ~14 archivos)

### 3.1 Plan de Extracción

| Componente Nuevo | Líneas Estimadas | Estado Extraído del Admin.js |
|-----------------|------------------|-------------------------------|
| `AdminLayout.js` | ~60 | Sidebar + routing |
| `AdminCourses.js` | ~300 | Formulario + lista + status buttons |
| `AdminCourseDetail.js` | ~200 | Modal detalle + lecciones del curso |
| `AdminCourseStudents.js` | ~100 | Lista de estudiantes del curso |
| `AdminLessons.js` | ~150 | Formulario + CRUD lecciones |
| `AdminUsers.js` | ~200 | Formulario + lista + detalle usuarios |
| `AdminStudents.js` | ~200 | Lista + búsqueda + detalle + progreso |
| `AdminInstructors.js` | ~150 | Lista + búsqueda + detalle |
| `AdminPurchases.js` | ~120 | Lista paginada + detalle |
| `AdminAuditLogs.js` | ~80 | Lista paginada |
| `AdminModules.js` | ~150 | CRUD módulos por curso |
| `AdminCategories.js` | ~150 | CRUD categorías + tags |
| `AdminRoles.js` | ~100 | Cambio de roles + certificados |
| `AdminDevConfig.js` | ~60 | Toggles de configuración |
| `AdminProfileEdit.js` | ~100 | Edición perfil de usuario (compartido) |

**Total estimado:** ~2,120 líneas distribuidas en 15 archivos (promedio 140 líneas/archivo)

### 3.2 Estado Compartido del Admin

Con la descomposición, el estado actualmente en Admin.js se distribuye así:

```
AdminLayout (routing)
├── selectedMenu (string)           → AdminLayout local state
│
AdminCourses
├── courses[]                       → fetch on mount
├── showCourseForm, isEditing       → local state
├── courseForm                      → local state
│
AdminCourseDetail
├── courseDetail, detailLoading     → fetch on open
├── showCourseDetail               → parent passes via prop/route
│
AdminUsers
├── users[]                        → fetch on mount
├── userForm, userErrors           → local state
│
AdminStudents
├── students[], studentPage        → fetch with pagination
├── studentSearch                  → local state
├── studentDetail, studentProgress → fetch on demand
│
... (cada componente maneja su propio estado)
```

**Patrón:** Cada sub-página del admin maneja su propio estado. No necesitan estado compartido complejo — cada sección es independiente. Esto elimina la necesidad de Redux/Zustand para el admin.

---

## 4. Custom Hooks Propuestos

### 4.1 `useApi`
```jsx
// Reemplaza el patrón repetido de loading/error/data
const { data, loading, error, refetch } = useApi('/courses');
const { execute, loading } = useApi('/admin/courses', { manual: true });
```

### 4.2 `usePagination`
```jsx
// Reemplaza la lógica duplicada de paginación en Admin
const { page, setPage, nextPage, prevPage, totalPages } = usePagination({
  fetchFn: (page, size) => api.get(`/admin/students?page=${page}&size=${size}`),
  pageSize: 20
});
```

### 4.3 `useForm`
```jsx
// Reemplaza los múltiples useState para formularios
const { values, errors, handleChange, handleSubmit, reset } = useForm({
  initialValues: { title: '', description: '', price: 0 },
  validate: (values) => { /* ... */ },
  onSubmit: async (values) => { /* ... */ }
});
```

### 4.4 `useCourseProgress`
```jsx
// Reemplaza window.dispatchEvent('courseProgressUpdated')
const { progress, updateProgress } = useCourseProgress(courseId);
// Internamente usa Context para comunicar entre Lesson y Home/CourseDetail
```

---

## 5. Patrones CSS Propuestos

### 5.1 Migración a CSS Variables

**Antes (estado actual):**
```css
/* Home.css */
.course-card { border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
/* Admin.css */
.admin-card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
/* Profile.css */
.profile-card { border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
```

**Después:**
```css
/* Todos usan variables */
.card { border-radius: var(--radius-md); box-shadow: var(--shadow-md); }
```

### 5.2 Responsive Breakpoints

```css
/* styles/variables.css */
/* Mobile first */
--bp-sm: 576px;   /* Teléfono grande */
--bp-md: 768px;   /* Tablet */
--bp-lg: 1024px;  /* Desktop */
--bp-xl: 1280px;  /* Desktop grande */
```

**Media queries necesarias (actualmente ausentes):**
- Home grid: 1 columna en móvil, 2 en tablet, 3 en desktop
- Admin sidebar: colapsada en < 768px, drawer/overlay
- Profile: tabs horizontales en móvil en vez de sidebar
- CourseDetail: layout stack vertical en móvil
- Header: hamburger menu en móvil

---

## 6. Mapa de Dependencias entre Componentes

```
                    ┌───────────┐
                    │    App    │
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────┴─────┐  ┌──────┴──────┐  ┌────┴────┐
    │ PageLayout│  │ AdminLayout │  │AuthLayout│
    └─────┬─────┘  └──────┬──────┘  └────┬────┘
          │               │              │
    ┌─────┴─────┐   ┌─────┴──────┐  ┌───┴───┐
    │  Header   │   │AdminSidebar│  │ Login  │
    │  ├Search  │   └─────┬──────┘  │Register│
    │  ├Notif.  │         │         └────────┘
    │  └UserMenu│   ┌─────┴──────────────────┐
    └───────────┘   │ Admin sub-pages (14)   │
          │         │  Cada una usa:         │
    ┌─────┴───┐     │  Button, Modal,        │
    │  Pages  │     │  FormField, Pagination,│
    │  Home   │     │  Badge, Card,          │
    │  Course │     │  EmptyState, SearchBar │
    │  Lesson │     └────────────────────────┘
    │ Profile │
    │ Assess. │
    └─────────┘
```

---

## 7. Resumen de Componentes

| Categoría | Cantidad | Nombres |
|-----------|----------|---------|
| Common | 8 | Button, Modal, FormField, Pagination, Badge, Card, EmptyState, LoadingSkeleton, SearchBar |
| Domain | 6 | CourseCard, LessonRow, ProgressBar, VideoPlayer, AssessmentCard, NotificationBell |
| Layout | 3 | PageLayout, AdminLayout, AdminSidebar |
| Admin Pages | 14 | AdminDashboard, AdminCourses, AdminCourseDetail, AdminCourseStudents, AdminLessons, AdminUsers, AdminStudents, AdminInstructors, AdminPurchases, AdminAuditLogs, AdminModules, AdminCategories, AdminRoles, AdminDevConfig |
| Pages | 9 | Login, Register, Home, CourseDetail, Lesson, Profile (5 sub), Assessments (3 sub) |
| Hooks | 4 | useApi, usePagination, useForm, useCourseProgress |
| Context | 3 | AuthContext, ThemeContext, NotificationContext |
| **Total** | **~47** | — |

---
