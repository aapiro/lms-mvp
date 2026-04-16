# Plan de Acción — Mejoras LMS MVP

**Versión:** 1.0  
**Fecha:** 2026-04-15  

---

## Resumen

El plan está organizado en **5 fases** con dependencias claras. Las fases 1-2 son de infraestructura y refactorización (no cambian funcionalidad visible). Las fases 3-5 agregan valor visible al usuario.

**Estimación total:** ~45-55 tareas individuales  
**Riesgo principal:** La Fase 1 (refactorización Admin.js) toca el archivo más grande y puede introducir regresiones. Se recomienda E2E tests antes y después.

---

## Fase 1: Fundamentos — Sistema de Diseño y Refactorización Crítica

**Objetivo:** Eliminar deuda técnica crítica y establecer la base para todo lo demás.  
**Prerrequisito para:** Fases 2-5  

### 1.1 Sistema de diseño CSS
- [ ] Crear `styles/variables.css` con design tokens (colores, spacing, shadows, radii, typography)
- [ ] Importar variables.css en `index.css` como primera importación
- [ ] Migrar colores hardcodeados en todos los CSS a variables (reemplazar ~80 valores hex)
- [ ] Unificar border-radius inconsistentes (6px/8px/10px → `var(--radius-md)`)
- [ ] Eliminar estilos de botón duplicados entre Admin.css, Home.css, Profile.css

### 1.2 Componentes common reutilizables
- [ ] Crear `Button` component (reemplaza 6+ clases CSS de botón)
- [ ] Crear `Modal` component (reemplaza ConfirmModal + modals inline en Admin y Assessments)
- [ ] Crear `FormField` component (reemplaza ~40 patrones div>label>input repetidos)
- [ ] Crear `Badge` component (reemplaza badges de estado inline)
- [ ] Crear `Card` component (reemplaza patrones de card duplicados)
- [ ] Crear `Pagination` component (reemplaza 4 implementaciones duplicadas en Admin)
- [ ] Crear `EmptyState` component
- [ ] Crear `LoadingSkeleton` component

### 1.3 Descomposición de Admin.js (CRÍTICO — 2235 líneas)
- [ ] Crear `AdminLayout.js` — extraer sidebar + routing por sección
- [ ] Extraer `AdminCourses.js` — formulario + lista + cambios de estado
- [ ] Extraer `AdminCourseDetail.js` — modal de detalle con lecciones
- [ ] Extraer `AdminLessons.js` — CRUD de lecciones (formulario + upload)
- [ ] Extraer `AdminUsers.js` — CRUD de usuarios
- [ ] Extraer `AdminStudents.js` — lista, búsqueda, detalle, progreso
- [ ] Extraer `AdminInstructors.js` — lista, búsqueda, detalle
- [ ] Extraer `AdminPurchases.js` — lista paginada + detalle
- [ ] Extraer `AdminAuditLogs.js` — lista paginada
- [ ] Extraer `AdminModules.js` — CRUD módulos por curso
- [ ] Extraer `AdminCategories.js` — CRUD categorías + tags
- [ ] Extraer `AdminRoles.js` — gestión de roles + certificados manuales
- [ ] Extraer `AdminDevConfig.js` — toggles de configuración
- [ ] Verificar que TODOS los E2E tests siguen pasando tras la descomposición

### 1.4 Custom hooks
- [ ] Crear `useApi` hook (loading/error/data pattern)
- [ ] Crear `usePagination` hook
- [ ] Crear `useForm` hook (valores, validación, submit)
- [ ] Crear `useCourseProgress` context (reemplaza `window.dispatchEvent`)

### 1.5 Descomposición secundaria
- [ ] Extraer `CreateAssessment.js` y `TakeAssessment.js` desde `Assessments.js`
- [ ] Extraer `ProfileInfo.js`, `ProfileCourses.js`, `ProfileCertificates.js`, `ProfilePassword.js` desde `Profile.js`
- [ ] Extraer `CourseCard` y `LessonRow` como componentes domain independientes
- [ ] Extraer lógica de VideoPlayer desde `Lesson.js`

**Criterio de completitud:** Admin.js eliminado, reemplazado por AdminLayout.js + 14 sub-páginas. Todos los E2E tests pasan. Ningún `alert()` ni `window.dispatchEvent` en el código.

---

## Fase 2: UX y Responsive

**Objetivo:** Hacer la app usable en móvil/tablet y mejorar la experiencia general.  
**Prerrequisito:** Fase 1 completada (componentes reutilizables disponibles)  

### 2.1 Responsive design
- [ ] Definir breakpoints en variables.css (576/768/1024/1280)
- [ ] Home: grid 1col (móvil) → 2col (tablet) → 3col (desktop)
- [ ] Admin sidebar: colapsable en < 768px (drawer overlay)
- [ ] Profile: tabs horizontales en < 768px (eliminar sidebar)
- [ ] CourseDetail: stack vertical en móvil
- [ ] Header: menú hamburguesa en < 768px
- [ ] Formularios: campos full-width en móvil
- [ ] Tablas/listas: scroll horizontal o layout card en móvil

### 2.2 Mejoras de Header
- [ ] Reemplazar botones sueltos (Profile/Admin/Logout) por UserMenu dropdown
- [ ] Agregar SearchBar global en el centro del header
- [ ] Preparar espacio para NotificationBell (se implementa en Fase 4)

### 2.3 Mejoras de navegación
- [ ] CourseDetail: agrupar lecciones por módulo (colapsables)
- [ ] Lesson page: agregar navegación anterior/siguiente entre lecciones
- [ ] Lesson page: mostrar "Lección X de Y" y nombre del curso
- [ ] Admin: agrupar sidebar por categorías con separadores
- [ ] Admin: agregar breadcrumbs (`Admin > Cursos > Curso X`)

### 2.4 Mejoras de formularios y feedback
- [ ] Unificar manejo de errores: todo via toast (eliminar alert() restantes)
- [ ] Agregar validación en tiempo real en formularios (FormField + useForm)
- [ ] Register: agregar campo de confirmación de contraseña
- [ ] Mejorar estados vacíos con EmptyState component
- [ ] Agregar LoadingSkeleton en todas las listas

### 2.5 Mejoras de CourseCard y CourseDetail
- [ ] CourseCard: precio como badge en thumbnail, botón contextual según estado
- [ ] CourseDetail: bloque CTA de compra destacado (no inline con título)
- [ ] CourseDetail: mostrar información de drip content ("Disponible en X días")
- [ ] Profile cursos: agrupar por estado (en progreso / completados)

**Criterio de completitud:** App usable en móvil (iPhone SE hasta iPad). Lighthouse mobile score > 70. Sin `alert()` en el código. Todas las listas con skeleton loading.

---

## Fase 3: Backend — Features Incompletas

**Objetivo:** Completar funcionalidades backend que tienen tablas/stubs pero no implementación.  
**Prerrequisito:** Ninguno (puede ejecutarse en paralelo con Fases 1-2)  

### 3.1 Waitlist
- [ ] Implementar `WaitlistService` — lógica de cola, posición, promoción
- [ ] Implementar `WaitlistController` — endpoints: join, leave, position, admin list
- [ ] Agregar lógica de promoción automática cuando se libera capacidad
- [ ] Migración: agregar columnas de timestamp y status a tabla waitlist si faltan
- [ ] Frontend: botón "Unirse a lista de espera" en CourseDetail (cuando curso lleno)
- [ ] Frontend: sección Waitlist en Admin

### 3.2 Grupos de usuarios
- [ ] Implementar `GroupService` — CRUD de grupos, asignación de miembros
- [ ] Implementar `GroupController` — endpoints REST
- [ ] Agregar inscripción masiva por grupo a un curso
- [ ] Frontend: sección Grupos en Admin con CRUD
- [ ] Frontend: selector de grupo en inscripción manual

### 3.3 Refunds
- [ ] Agregar endpoint `POST /api/admin/purchases/{id}/refund`
- [ ] Integrar Stripe Refund API
- [ ] Revocar acceso al curso tras refund (cambiar status Purchase a REFUNDED)
- [ ] Frontend: botón "Reembolsar" en detalle de compra (Admin)

### 3.4 Rate limiting
- [ ] Agregar Bucket4j o Spring Boot rate limiter
- [ ] Rate limit en `/api/auth/login` (5 intentos/minuto)
- [ ] Rate limit en `/api/auth/register` (3/minuto)
- [ ] Rate limit en `/api/payments/checkout` (10/minuto)

### 3.5 CORS configurable
- [ ] Mover allowed origins a variable de entorno `CORS_ALLOWED_ORIGINS`
- [ ] Soportar múltiples origins separados por coma

**Criterio de completitud:** Waitlist funcional con E2E test. Grupos funcional con E2E test. Refund procesa correctamente en Stripe test mode.

---

## Fase 4: Nuevas Funcionalidades de Alto Valor

**Objetivo:** Agregar features que diferencien la plataforma.  
**Prerrequisito:** Fase 1 y 2 (frontend estable y componentizado), Fase 3 (backend base)  

### 4.1 Sistema de notificaciones
- [ ] Backend: crear módulo `notifications/` (Notification entity, service, controller)
- [ ] Backend: integrar Spring Mail + templates Thymeleaf para email
- [ ] Backend: eventos que disparan notificaciones (inscripción, lección disponible, evaluación calificada, certificado)
- [ ] Frontend: NotificationBell component en Header
- [ ] Frontend: dropdown con lista de notificaciones
- [ ] Frontend: NotificationContext para estado global
- [ ] Migración: tabla `notifications` (userId, type, title, message, read, resourceUrl, createdAt)

### 4.2 Integración AI para grading
- [ ] Backend: agregar dependencia Anthropic Java SDK
- [ ] Backend: implementar `AiGradingService` que reemplace el stub en AssessmentService
- [ ] Backend: prompt engineering para evaluación con rúbrica
- [ ] Backend: configuración de API key via env var
- [ ] Frontend: mostrar feedback de AI en resultados de evaluación
- [ ] Frontend: indicador "Calificado por AI" vs "Calificado por sistema"

### 4.3 Generación de certificados PDF
- [ ] Backend: agregar dependencia iText o Apache PDFBox
- [ ] Backend: implementar `CertificateGeneratorService`
- [ ] Backend: template de certificado con datos dinámicos (nombre, curso, fecha, ID)
- [ ] Backend: subir PDF generado a MinIO y guardar URL
- [ ] Frontend: botón "Descargar Certificado" en Profile
- [ ] Trigger automático al completar 100% de un curso

### 4.4 Búsqueda global
- [ ] Backend: endpoint `GET /api/search?q=` con PostgreSQL full-text search
- [ ] Backend: índices tsvector en cursos (title, description) y lecciones (title)
- [ ] Frontend: SearchBar en Header con autocompletado
- [ ] Frontend: página de resultados agrupados por tipo (cursos, lecciones)

### 4.5 Sistema de reseñas
- [ ] Backend: crear entidades Review (userId, courseId, rating 1-5, comment, createdAt)
- [ ] Backend: endpoints CRUD + cálculo de promedio
- [ ] Migración: tabla `reviews` con índice unique (userId, courseId)
- [ ] Frontend: estrellas + formulario de reseña en CourseDetail
- [ ] Frontend: promedio de rating en CourseCard
- [ ] Frontend: sección de moderación en Admin

**Criterio de completitud:** Notificaciones llegan por email y se muestran in-app. AI califica preguntas abiertas con feedback coherente. Certificados PDF descargables. Búsqueda devuelve resultados relevantes.

---

## Fase 5: Mejoras Avanzadas

**Objetivo:** Pulir la plataforma con features de calidad de vida.  
**Prerrequisito:** Fases 1-4  

### 5.1 Dashboard del estudiante
- [ ] Nueva página dedicada (no es el Profile actual)
- [ ] Cursos en progreso con acceso rápido a última lección
- [ ] Próximas evaluaciones (calendario)
- [ ] Tiempo invertido (analytics personales)
- [ ] Logros/badges (cursos completados, racha de días, etc.)

### 5.2 Foro de discusión por lección
- [ ] Backend: entidades Comment, Reply con threading
- [ ] Backend: endpoints CRUD para comentarios por lección
- [ ] Frontend: sección de discusión debajo del player de video
- [ ] Frontend: respuestas anidadas (1 nivel)
- [ ] Instructor puede marcar "mejor respuesta"

### 5.3 Modo oscuro
- [ ] Crear `ThemeContext` con toggle light/dark
- [ ] Definir dark theme en CSS variables (`:root[data-theme="dark"]`)
- [ ] Toggle en Header / UserMenu
- [ ] Persistir preferencia en localStorage
- [ ] Respetar `prefers-color-scheme` del sistema

### 5.4 Internacionalización (i18n)
- [ ] Integrar react-i18next
- [ ] Extraer todos los strings a archivos de traducción (es.json, en.json)
- [ ] Selector de idioma en Header/UserMenu
- [ ] Backend: mensajes de error localizados

### 5.5 Accesibilidad (WCAG 2.1 AA)
- [ ] Agregar ARIA labels a todos los elementos interactivos
- [ ] Implementar keyboard navigation en modals y dropdowns
- [ ] Verificar contraste de colores (ratio 4.5:1 mínimo)
- [ ] Agregar skip links
- [ ] Screen reader testing con VoiceOver

### 5.6 Performance
- [ ] Implementar React.lazy + Suspense para code splitting por ruta
- [ ] Lazy loading de imágenes (thumbnails)
- [ ] Evaluar react-query o SWR para cache de datos del servidor
- [ ] Virtualización de listas largas (react-window) en Admin

**Criterio de completitud:** Lighthouse score > 90 (desktop), > 80 (mobile). WCAG 2.1 AA compliance en flujos principales. App funcional en español e inglés.

---

## Resumen de Fases

| Fase | Nombre | Tareas | Dependencias | Impacto |
|------|--------|--------|--------------|---------|
| 1 | Fundamentos | ~25 | Ninguna | Elimina deuda técnica, base para todo |
| 2 | UX y Responsive | ~18 | Fase 1 | App usable en móvil, UX mejorada |
| 3 | Backend Features | ~15 | Ninguna (paralelo con 1-2) | Waitlist, grupos, refunds |
| 4 | Nuevas Features | ~20 | Fases 1-3 | Notificaciones, AI, certificados, búsqueda |
| 5 | Mejoras Avanzadas | ~15 | Fases 1-4 | Dashboard, foro, dark mode, i18n, a11y |

### Diagrama de Dependencias

```
Fase 1 (Fundamentos) ──────┐
                            ├──→ Fase 2 (UX) ──┐
Fase 3 (Backend) ──────────┤                    ├──→ Fase 4 (Features) ──→ Fase 5 (Avanzadas)
  (paralelo con 1-2)  ─────┘                    │
                                                 │
                            ┌────────────────────┘
                            │
                     Fases 1+2+3 completas
```

### Prioridad por Impacto/Esfuerzo

| Prioridad | Tarea | Impacto | Esfuerzo |
|-----------|-------|---------|----------|
| P0 | Descomponer Admin.js | Muy Alto (mantenibilidad) | Alto |
| P0 | CSS Variables (design tokens) | Alto (consistencia) | Bajo |
| P0 | Componentes Button/Modal/FormField | Alto (productividad) | Medio |
| P1 | Responsive design | Alto (alcance de usuarios) | Medio |
| P1 | Waitlist funcional | Alto (feature gap) | Medio |
| P1 | Mejoras de Header (UserMenu, Search) | Medio (UX) | Bajo |
| P2 | Notificaciones | Alto (engagement) | Alto |
| P2 | AI Grading | Alto (diferenciación) | Medio |
| P2 | Certificados PDF | Medio (completitud) | Medio |
| P3 | Reseñas/Ratings | Medio (social proof) | Medio |
| P3 | Foro de discusión | Medio (engagement) | Alto |
| P3 | Modo oscuro | Bajo (nice to have) | Bajo |
| P3 | i18n | Medio (escalabilidad) | Alto |

---
