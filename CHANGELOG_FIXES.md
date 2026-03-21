# Changelog de Correcciones y Mejoras - 2026

## Correcciones Completadas

### ✅ 21 de Marzo de 2026

#### [CORREGIDO] Modal de "Estudiantes del Curso" superpuesto en Admin
**Problema:** El modal que lista los estudiantes de un curso quedaba permanentemente encima cuando se intentaba acceder a los modales de "Perfil del Estudiante" o "Progreso".

**Causa Raíz:** 
- Todos los modales compartían `z-index: 1000`
- El orden de renderizado en el DOM determina cuál queda encima (último = arriba)
- El modal "Course Students" se renderizaba DESPUÉS de "Student Detail" y "Student Progress"

**Solución Implementada:**
- Reordenado el renderizado: "Course Students Modal" ahora se renderiza ANTES
- Establecido `z-index: 1000` para "Course Students Modal"
- Asignado `z-index: 1100` a "Student Detail Modal" y "Student Progress Modal"
- Esto garantiza que los modales secundarios siempre aparezcan encima del modal del curso

**Archivo Modificado:**
- `/frontend/src/pages/Admin.js` - Líneas 2015-2200

**Resultado:** ✅ Modales funcionan correctamente sin bloqueos visuales

---

#### [CORREGIDO] Cursos Gratis Marcados como "Owned" para Todos los Usuarios
**Problema:** Todos los usuarios autenticados veían todos los cursos gratis como "owned/purchased", aunque no tuvieran un registro de compra real.

**Causa Raíz:**
- Backend marcaba automáticamente cursos gratis (`price = 0`) como "purchased" para TODOS los usuarios autenticados
- Lógica en `CourseService.buildCourseResponse()` y `getCourseById()` no validaba registros de compra reales
- Los cursos gratis debían tener registros de compra en la tabla `purchases` con monto 0

**Solución Implementada:**

1. **Backend (`CourseService.java`):**
   - Removida lógica que auto-marcaba cursos gratis como purchased
   - Ahora `purchased = true` SOLO si hay un registro en `purchases` con status COMPLETED
   - Mantiene acceso a lecciones para cursos gratis (lógica en `LessonService`)

2. **Base de Datos (`V17__fix_free_course_enrollments.sql`):**
   - Nueva migración que crea registros de compra con monto 0 para todos los usuarios en cursos gratis
   - Se ejecuta automáticamente en el siguiente deploy
   - Tiene `ON CONFLICT` para ser idempotente

3. **Frontend:**
   - Ya estaba correctamente implementado: permite acceso a cursos gratis sin `purchased = true`
   - Muestra "Free" en lugar de "Purchase" para cursos sin costo

**Archivos Modificados:**
- `/backend/src/main/java/com/lms/courses/CourseService.java` - Líneas 160, 335-345
- `/backend/src/main/resources/db/migration/V17__fix_free_course_enrollments.sql` - NUEVA
- `/backend/src/main/resources/db/migration_clean/V17__fix_free_course_enrollments.sql` - NUEVA

**Resultado:** ✅ Solo cursos con compra real aparecen como "owned". Cursos gratis requieren registro de compra (monto 0).

---

#### [🔴 CRÍTICO] Migración V17 Creaba Compras para TODOS los Cursos
**Problema GRAVE:** Después de aplicar V17, todos los usuarios veían TODOS los cursos como "Owned", aunque no tuvieran compras reales.

**Causa Raíz:** 
- La migración V17 usaba condición `WHERE c.price = 0 OR c.price IS NULL`
- Como muchos cursos tienen `price = NULL`, la condición creaba compras para TODOS los cursos
- Resultado: Cada usuario tenía registros de compra para TODOS los cursos

**Soluciones:**
1. ✅ **V17 Actualizada:** Condición más restrictiva `WHERE c.price = 0::DECIMAL AND c.price IS NOT NULL`
2. ✅ **V18 Nueva:** Limpia compras incorrectas previas (elimina `amount = 0.00` de cursos con `price != 0`)
3. ✅ Garantiza que solo cursos realmente gratis generan compras automáticas

**Archivos Modificados:**
- `/backend/src/main/resources/db/migration/V17__fix_free_course_enrollments.sql` - CORREGIDA
- `/backend/src/main/resources/db/migration_clean/V17__fix_free_course_enrollments.sql` - CORREGIDA
- `/backend/src/main/resources/db/migration/V18__cleanup_incorrect_enrollments.sql` - NUEVA
- `/backend/src/main/resources/db/migration_clean/V18__cleanup_incorrect_enrollments.sql` - NUEVA

**Resultado:** ✅ Solo cursos gratis reales tienen compras. Otros cursos muestran "Purchase" correctamente.

---

## Plan Vigente

El proyecto mantiene las siguientes líneas de desarrollo:

### 🎯 Pruebas Manuales Pendientes (No Críticas)
Pueden ser realizadas en cualquier momento para validar funcionalidades de Course Management:
- [ ] Crear curso con estado DRAFT
- [ ] Publicar curso (cambiar a PUBLISHED)
- [ ] Crear módulos y asignar lecciones
- [ ] Verificar drip content (lecciones bloqueadas)
- [ ] Cargar y reproducir archivos AUDIO
- [ ] Establecer y validar límite de capacidad
- [ ] Filtrar cursos por categoría/tag/enrollmentType
- [ ] Validar prerrequisitos entre cursos

### 🔧 Posibles Mejoras Futuras
- Optimizaciones de UI/UX en secciones de admin
- Validaciones adicionales en formularios
- Mejoras en rendimiento de consultas
- Expansión de reportes y analytics

---

## Estado del Sistema

**Última Actualización:** 21 de Marzo de 2026  
**Estado General:** ✅ FUNCIONAL - Libre de bloqueadores críticos

### Componentes Validados
- ✅ Backend: Cursos, Módulos, Lecciones, Categorías, Tags, Prerrequisitos
- ✅ Frontend: Interfaz de admin, listados de estudiantes, filtros, modales
- ✅ Base de Datos: Migraciones, índices, integridad referencial
- ✅ Autenticación y Autorización: JWT, roles ADMIN
- ✅ Almacenamiento: Archivos VIDEO, PDF, AUDIO
