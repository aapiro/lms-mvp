# SDD — Software Design Document
## LMS MVP Platform

**Versión:** 1.0  
**Fecha:** 2026-04-15  
**Autor:** Análisis automatizado  

---

## 1. Resumen Ejecutivo

Este documento analiza el estado actual de la plataforma LMS MVP y propone mejoras en funcionalidad, organización, estructura frontend y UX. El sistema actual es funcional pero presenta deuda técnica significativa, especialmente en el frontend (componente Admin.js de 2235 líneas) y funcionalidades backend incompletas (waitlist, grupos, grading AI).

---

## 2. Estado Actual — Diagnóstico

### 2.1 Arquitectura General

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | React 18 (CRA) | Funcional, necesita refactorización |
| Backend | Spring Boot 3.2.1 / Java 17 | Sólido, algunas features stub |
| Base de datos | PostgreSQL 15 + Flyway | Bien estructurada |
| Storage | MinIO (S3-compatible) | Funcional |
| Pagos | Stripe Checkout + Webhooks | Funcional |
| Auth | JWT (HS256) + Spring Security | Funcional |
| CI/CD | GitHub Actions + Playwright | Básico pero funcional |

### 2.2 Problemas Críticos Identificados

#### Frontend

| ID | Problema | Severidad | Impacto |
|----|----------|-----------|---------|
| F-01 | `Admin.js` — 2235 líneas, 30+ estados, 50+ handlers | **Crítica** | Mantenibilidad, testing, rendimiento |
| F-02 | Sin sistema de diseño (colores hardcodeados, estilos duplicados) | **Alta** | Inconsistencia visual, velocidad de desarrollo |
| F-03 | Sin responsive design (1 media query en todo el proyecto) | **Alta** | Inutilizable en móvil/tablet |
| F-04 | Manejo de errores inconsistente (alert vs toast vs silencio) | **Alta** | UX confusa |
| F-05 | Sin i18n (mezcla español/inglés) | **Media** | Escalabilidad internacional |
| F-06 | Sin accesibilidad (ARIA, keyboard nav, contraste) | **Media** | Cumplimiento WCAG, usabilidad |
| F-07 | Comunicación entre componentes via `window.dispatchEvent` | **Media** | Fragilidad, debugging difícil |
| F-08 | Sin validación en tiempo real en formularios | **Media** | UX pobre |
| F-09 | `Assessments.js` — 454 líneas con 3 sub-componentes inline | **Media** | Mantenibilidad |
| F-10 | Sin loading skeletons ni estados vacíos consistentes | **Baja** | UX incompleta |

#### Backend

| ID | Problema | Severidad | Impacto |
|----|----------|-----------|---------|
| B-01 | Módulo Enrollments vacío (controller + service stub) | **Alta** | Feature waitlist/grupos no disponible |
| B-02 | AI Grading es un placeholder (score=0, "Pending AI...") | **Alta** | Evaluaciones open-ended no funcionales |
| B-03 | Sin servicio de email/notificaciones | **Media** | Sin comunicación con usuarios |
| B-04 | Certificados solo almacenan URL, no generan PDF | **Media** | Feature incompleta |
| B-05 | Sin endpoint de refunds (modelo soporta status REFUNDED) | **Media** | Operaciones post-venta incompletas |
| B-06 | Sin rate limiting en endpoints públicos | **Media** | Seguridad |
| B-07 | CORS hardcodeado a localhost:3000 | **Baja** | Requiere config por entorno |

---

## 3. Mejoras Propuestas — Nuevas Funcionalidades

### 3.1 Funcionalidades de Alto Valor

#### 3.1.1 Sistema de Notificaciones
- **Qué:** Notificaciones in-app + email para eventos clave
- **Eventos:** inscripción confirmada, lección nueva disponible (drip), evaluación calificada, certificado emitido, curso completado
- **Backend:** Nuevo módulo `notifications/` con NotificationService, templates de email (Spring Mail + Thymeleaf)
- **Frontend:** Campana de notificaciones en Header con badge de conteo, dropdown con lista de notificaciones

#### 3.1.2 Waitlist Funcional
- **Qué:** Cola de espera cuando un curso alcanza su `capacityLimit`
- **Tablas:** Ya existe `waitlist` (V25)
- **Flujo:** Usuario solicita unirse → entra en waitlist → cuando se libera capacidad → notificación automática → ventana de 48h para inscribirse
- **Backend:** Implementar `WaitlistService` con lógica de promoción y `WaitlistController`
- **Frontend:** Botón "Unirse a lista de espera" en CourseDetail cuando curso está lleno

#### 3.1.3 Grupos de Usuarios
- **Qué:** Agrupación de usuarios para inscripciones corporativas/institucionales
- **Tablas:** Ya existen `user_groups` y `user_group_members` (V26)
- **Flujo:** Admin crea grupo → asigna usuarios → inscribe grupo completo en curso
- **Backend:** Implementar `GroupService`, `GroupController`
- **Frontend:** Sección "Grupos" en Admin con CRUD y asignación masiva

#### 3.1.4 Integración AI para Grading
- **Qué:** Calificación automática de preguntas abiertas usando Claude API
- **Estado actual:** Stub en `AssessmentService.gradeOpenEndedWithAI()`
- **Implementación:** Integrar Anthropic SDK, enviar pregunta + respuesta + rúbrica → recibir score + feedback
- **Frontend:** Mostrar feedback de AI en resultados de evaluación

#### 3.1.5 Generación de Certificados PDF
- **Qué:** Generar certificados descargables al completar un curso
- **Implementación:** Librería iText o Apache PDFBox, template configurable por curso (`certificateTemplate`)
- **Almacenamiento:** Generar PDF → subir a MinIO → guardar URL en Certificate entity

#### 3.1.6 Búsqueda Global
- **Qué:** Barra de búsqueda en Header para cursos, lecciones, evaluaciones
- **Backend:** Endpoint `GET /api/search?q=term` con búsqueda full-text en PostgreSQL (tsvector)
- **Frontend:** SearchBar component con autocompletado y resultados agrupados por tipo

### 3.2 Funcionalidades de Valor Medio

#### 3.2.1 Sistema de Reseñas y Ratings
- Usuarios pueden calificar cursos (1-5 estrellas) + comentario
- Promedio visible en cards de curso y detalle
- Admin puede moderar reseñas

#### 3.2.2 Foro de Discusión por Lección
- Comentarios/preguntas por lección
- Hilos de respuesta
- Instructor puede marcar respuesta como "mejor respuesta"

#### 3.2.3 Refunds
- Admin puede procesar reembolsos desde panel
- Integración con Stripe Refund API
- Revoca acceso al curso tras refund

#### 3.2.4 Dashboard del Estudiante
- Vista dedicada (no solo el Profile) con:
  - Cursos en progreso con acceso rápido a última lección
  - Próximas evaluaciones (calendario)
  - Logros/badges
  - Tiempo invertido (analytics personales)

#### 3.2.5 Modo Oscuro
- Toggle en Header
- CSS variables para theming
- Persistencia en localStorage

---

## 4. Mejoras de Organización y Estructura Frontend

### 4.1 Restructuración de Directorios (Propuesta)

```
frontend/src/
├── api/
│   ├── client.js                  # Axios instance (actual api.js)
│   ├── auth.api.js                # Auth endpoints
│   ├── courses.api.js             # Course endpoints
│   ├── admin.api.js               # Admin endpoints
│   ├── assessments.api.js         # Assessment endpoints
│   └── users.api.js               # User/profile endpoints
├── components/
│   ├── common/                    # Componentes reutilizables
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── FormField/
│   │   ├── Pagination/
│   │   ├── Badge/
│   │   ├── Card/
│   │   ├── EmptyState/
│   │   ├── LoadingSkeleton/
│   │   └── SearchBar/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── PageLayout/
│   │   └── Footer/
│   └── domain/                    # Componentes de dominio
│       ├── CourseCard/
│       ├── LessonRow/
│       ├── ProgressBar/
│       ├── AssessmentCard/
│       ├── NotificationBell/
│       └── VideoPlayer/
├── context/
│   ├── AuthContext.js
│   ├── ThemeContext.js
│   └── NotificationContext.js
├── hooks/
│   ├── useApi.js                  # Hook genérico para llamadas API
│   ├── usePagination.js
│   ├── useForm.js
│   └── useCourseProgress.js       # Reemplaza window.dispatchEvent
├── pages/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── home/
│   │   └── Home.js
│   ├── course/
│   │   ├── CourseDetail.js
│   │   └── Lesson.js
│   ├── profile/
│   │   ├── Profile.js
│   │   ├── ProfileInfo.js
│   │   ├── ProfileCourses.js
│   │   ├── ProfileCertificates.js
│   │   └── ProfilePassword.js
│   ├── assessments/
│   │   ├── AssessmentList.js
│   │   ├── CreateAssessment.js
│   │   └── TakeAssessment.js
│   └── admin/                     # DESCOMPOSICIÓN CRÍTICA de Admin.js
│       ├── AdminLayout.js         # Sidebar + routing interno
│       ├── AdminDashboard.js      # Métricas (ya existe)
│       ├── AdminCourses.js        # CRUD cursos
│       ├── AdminCourseDetail.js   # Detalle + lecciones + estudiantes
│       ├── AdminLessons.js        # Gestión lecciones
│       ├── AdminUsers.js          # CRUD usuarios
│       ├── AdminStudents.js       # Lista + detalle estudiantes
│       ├── AdminInstructors.js    # Lista + detalle instructores
│       ├── AdminPurchases.js      # Lista compras
│       ├── AdminAuditLogs.js      # Logs de auditoría
│       ├── AdminModules.js        # Gestión módulos
│       ├── AdminCategories.js     # Categorías y tags
│       ├── AdminRoles.js          # Gestión de roles
│       └── AdminDevConfig.js      # Configuración desarrollo
├── styles/
│   ├── variables.css              # CSS custom properties (colores, spacing, etc.)
│   ├── global.css                 # Reset + typography
│   └── components/                # Estilos por componente
└── utils/
    ├── formatters.js              # Formato de fechas, precios, etc.
    ├── validators.js              # Validaciones de formularios
    └── constants.js               # Constantes de la app
```

### 4.2 Sistema de Diseño (Design Tokens)

```css
/* styles/variables.css — propuesta */
:root {
  /* Colores primarios */
  --color-primary: #667eea;
  --color-primary-hover: #5a6fd6;
  --color-primary-light: #e8ecfd;

  /* Semánticos */
  --color-success: #27ae60;
  --color-danger: #e74c3c;
  --color-warning: #f39c12;
  --color-info: #3498db;

  /* Neutros */
  --color-bg: #f5f6fa;
  --color-surface: #ffffff;
  --color-text: #2c3e50;
  --color-text-secondary: #7f8c8d;
  --color-border: #e1e4e8;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Fira Code', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
}
```

---

## 5. Mejoras de UX — Posición de Botones y Navegación

### 5.1 Header (Actual vs Propuesto)

**Actual:**
```
[Logo/Home]                    [Profile] [Admin] [Logout]
```

**Propuesto:**
```
[Logo/Home]  [SearchBar...🔍]      [🔔 3] [👤 Nombre ▼]
                                           ├── Mi Perfil
                                           ├── Admin Panel (si admin)
                                           └── Cerrar Sesión
```

**Cambios:**
- Barra de búsqueda global centrada
- Campana de notificaciones con badge
- Menú dropdown del usuario (ahorra espacio, agrupa acciones de cuenta)
- Eliminar botones individuales de Profile/Admin/Logout

### 5.2 Home — Cards de Cursos

**Actual:**
```
┌─────────────────────────┐
│ [Thumbnail]             │
│ Title [PUBLISHED]       │
│ Description...          │
│ [Cat] [Tag]             │
│ $99 | 5 lessons | OPEN  │
│ ████████░░ 80%          │
│ [Ver Detalles]          │
└─────────────────────────┘
```

**Propuesto:**
```
┌─────────────────────────┐
│ [Thumbnail]        [$99]│
│                  [★ 4.5]│
│ Title                   │
│ Instructor name         │
│ 5 lecciones · 2h 30m    │
│ [Cat] [Tag]             │
│ ████████░░ 80%          │
│                         │
│ [Continuar Curso →]     │  ← Acción contextual:
│                         │     "Ver Detalles" si no inscrito
└─────────────────────────┘     "Continuar" si en progreso
                                "Completado ✓" si terminado
```

**Cambios:**
- Precio como badge en esquina superior derecha del thumbnail
- Rating visible
- Nombre del instructor/creador
- Duración total estimada
- Botón contextual según estado del usuario con el curso

### 5.3 CourseDetail — Reorganización de Acciones

**Actual:** Botón de compra a la derecha del título, tabs Lessons/Assessments debajo

**Propuesto:**
```
┌────────────────────────────────────────────┐
│ ← Volver                                   │
│                                             │
│ [Thumbnail/Preview grande]                  │
│                                             │
│ Título del Curso                            │
│ Por: Instructor Name · ★ 4.5 (23 reseñas) │
│ 12 lecciones · 3 módulos · 5h total        │
│ [Categoría] [Tag1] [Tag2]                  │
│                                             │
│ ┌──────────────────────┐                   │
│ │ $99.00               │                   │
│ │ [🛒 Comprar Curso]   │ ← CTA prominente │
│ │ o                    │                   │
│ │ [Unirse a Waitlist]  │ ← si está lleno  │
│ │ Garantía 30 días     │                   │
│ └──────────────────────┘                   │
│                                             │
│ [Contenido] [Evaluaciones] [Reseñas] [FAQ] │
│ ─────────────────────────────────────────── │
│ Módulo 1: Introducción                      │
│   ▶ Lección 1 — Bienvenida (3:20)    [✓]  │
│   📄 Lección 2 — Recursos (PDF)       [✓]  │
│ Módulo 2: Fundamentos                       │
│   🔒 Lección 3 — Disponible en 2 días      │
└────────────────────────────────────────────┘
```

**Cambios:**
- CTA de compra en bloque destacado (no inline con título)
- Información del instructor visible
- Tabs ampliados (Reseñas, FAQ)
- Lecciones agrupadas por módulo con iconos de estado claros
- Información de drip content visible ("Disponible en X días")

### 5.4 Admin Panel — Navegación

**Actual:** Sidebar plano con 13 items sin agrupación

**Propuesto:**
```
ADMIN PANEL
─────────────
📊 Dashboard

CONTENIDO
  📚 Cursos
  📝 Lecciones
  📦 Módulos
  🏷️ Categorías/Tags

EVALUACIONES
  📋 Evaluaciones
  📊 Calificaciones

USUARIOS
  👥 Estudiantes
  👨‍🏫 Instructores
  🔐 Roles y Permisos
  👥 Grupos

OPERACIONES
  💳 Compras/Pagos
  📋 Lista de Espera
  🔔 Notificaciones

SISTEMA
  📜 Audit Logs
  ⚙️ Configuración
```

**Cambios:**
- Items agrupados por categoría con separadores
- Iconos consistentes
- Secciones colapsables
- Breadcrumbs en el contenido principal: `Admin > Cursos > Curso X > Editar`

### 5.5 Lesson Page — Controles del Player

**Actual:** Botón "Mark as Completed" centrado debajo del player

**Propuesto:**
```
┌────────────────────────────────────────┐
│ ← Curso: Nombre        Lección 3 de 8 │
│ ──────────────────────────────────────│
│                                        │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │         [VIDEO PLAYER]             │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Título de la Lección                   │
│ Descripción breve...                   │
│                                        │
│ [← Anterior]  [✓ Completar]  [Sig →] │
│                                        │
│ ──────────────────────────────────────│
│ 📝 Notas de la lección (futuro)       │
│ 💬 Discusión (3 comentarios)          │
└────────────────────────────────────────┘
```

**Cambios:**
- Navegación entre lecciones (anterior/siguiente) — actualmente no existe
- Indicador de posición "Lección X de Y"
- Referencia al curso en el header
- Sección de notas y discusión (preparación futura)

### 5.6 Profile — Mejora de Tabs

**Actual:** Sidebar fijo con 4 tabs (Info, Cursos, Certificados, Password)

**Propuesto:**
```
┌──────────────────────────────────────────┐
│ ┌──────┐                                 │
│ │Avatar│ Juan Pérez                      │
│ └──────┘ juan@email.com · Estudiante     │
│          Miembro desde Mar 2026          │
│ ─────────────────────────────────────── │
│ [Mis Cursos] [Certificados] [Logros]     │
│ [Configuración ⚙️]                       │
│ ─────────────────────────────────────── │
│                                          │
│  Cursos en Progreso (3)                  │
│  ┌────────────────────────────────────┐  │
│  │ 📚 Curso A    ████████░░ 80%      │  │
│  │ Última lección: Tema 5            │  │
│  │              [Continuar →]        │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 📚 Curso B    ██░░░░░░░░ 20%      │  │
│  │ Última lección: Intro             │  │
│  │              [Continuar →]        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Cursos Completados (1)                  │
│  ┌────────────────────────────────────┐  │
│  │ ✅ Curso C    Completado           │  │
│  │ 🏆 Certificado disponible         │  │
│  │      [Ver Certificado] [Reseñar]  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Cambios:**
- Header de perfil más compacto (horizontal en lugar de sidebar vertical)
- Tabs horizontales en vez de sidebar
- Cursos agrupados por estado (en progreso / completados)
- Acceso directo a última lección
- CTA para descargar certificado y escribir reseña
- Tab "Configuración" agrupa: editar info + cambiar contraseña + preferencias

---

## 6. Mejoras de Rendimiento

| Mejora | Descripción | Impacto |
|--------|-------------|---------|
| React.lazy + Suspense | Code splitting por ruta (especialmente Admin) | -40% bundle inicial |
| React Query / SWR | Cache de datos del servidor, deduplicación de requests | Menos re-fetches |
| useMemo/useCallback | En listas grandes (cursos, estudiantes, audit logs) | Menos re-renders |
| Image lazy loading | Thumbnails de cursos con `loading="lazy"` | Faster LCP |
| Virtualización | Listas largas en Admin (react-window) | Rendimiento en listas >100 items |

---

## 7. Mejoras de Seguridad

| Mejora | Descripción | Prioridad |
|--------|-------------|-----------|
| Rate limiting | Spring Boot Bucket4j en login/register | Alta |
| CORS configurable | Mover origins a env vars | Media |
| Token refresh | Implementar refresh tokens (actual: 24h hard expiry) | Media |
| Input sanitization | XSS protection en campos de texto libre | Media |
| CSP headers | Content Security Policy en Nginx | Baja |

---

## 8. Apéndice — Métricas del Código Actual

### Frontend
- **Total líneas JS/JSX:** ~4,300
- **Total líneas CSS:** ~2,580
- **Archivo más grande:** Admin.js (2,235 líneas)
- **Componentes reutilizables:** 3 (Header, ConfirmModal, ToastProvider)
- **Páginas:** 9
- **Tests frontend:** 0 encontrados

### Backend
- **Endpoints totales:** ~70
- **Entidades JPA:** ~15
- **Migraciones Flyway:** 27
- **Features stub/vacías:** 3 (Waitlist, Groups, AI Grading)

---