# Guía de Verificación y Despliegue - Course Management Feature

**Fecha:** 21 de marzo de 2026

---

## 1. Pre-requisitos

Antes de proceder con la verificación, asegúrate de tener:

```bash
# Backend
- Java 21+
- Maven 3.9+
- PostgreSQL 12+
- MinIO (storage)

# Frontend
- Node.js 18+
- npm 9+

# Docker
- Docker 20+
- Docker Compose 2+
```

---

## 2. Verificación Local

### 2.1 Backend - Compilar

```bash
cd /Users/usuario/Downloads/lms-mvp/backend
make compile
```

Si hay errores, verificar:
- Que los archivos de migración SQL están en `src/main/resources/db/migration/`
- Que las entidades Java tienen las anotaciones correctas
- Que los repositorios heredan de `JpaRepository<T, ID>`

### 2.2 Backend - Build Completo

```bash
cd /Users/usuario/Downloads/lms-mvp/backend
make package
```

Debe generar `target/lms-0.0.1-SNAPSHOT.jar` sin errores.

### 2.3 Base de Datos - Aplicar Migraciones

Cuando se inicia la aplicación, Flyway aplicará automáticamente las nuevas migraciones:

```bash
# Las migraciones V13-V16 se ejecutarán automáticamente
# Puedes verificar en los logs:
# - "Executing migration with status: PENDING - version: V13"
# - "Executing migration with status: PENDING - version: V14"
# - etc.
```

### 2.4 Verificación Manual de Migraciones (opcional)

```sql
-- Conectar a PostgreSQL
psql -U postgres -d lms_db

-- Verificar tablas nuevas
SELECT * FROM information_schema.tables WHERE table_schema='public' AND table_name IN (
  'modules', 'categories', 'course_categories', 'tags', 'course_tags', 'course_prerequisites'
);

-- Verificar columnas nuevas en courses
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Verificar columnas nuevas en lessons
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- Verificar columnas nuevas en assessments
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;
```

### 2.5 Frontend - Compilar

```bash
cd /Users/usuario/Downloads/lms-mvp/frontend
npm install
npm run build
```

Debe generar carpeta `build/` sin errores.

---

## 3. Docker - Verificación con Docker Compose

### 3.1 Levantar Stack Local

```bash
cd /Users/usuario/Downloads/lms-mvp

# Construir imágenes
docker-compose build

# Levantar servicios
docker-compose up -d

# Verificar que todos están corriendo
docker-compose ps
```

Debe mostrar:
```
NAME            STATUS
lms-postgres    Up
lms-minio       Up
lms-backend     Up
lms-frontend    Up
```

### 3.2 Logs del Backend

```bash
docker-compose logs -f lms-backend
```

Buscar líneas como:
```
Executing migration with status: PENDING - version: V13
Executing migration with status: PENDING - version: V14
Executing migration with status: PENDING - version: V15
Executing migration with status: PENDING - version: V16
```

### 3.3 Verificar API

```bash
# Backend accesible
curl http://localhost:8080/api/courses

# Frontend accesible
curl http://localhost:3000/
```

---

## 4. Testing de Endpoints

### 4.1 Autenticación

```bash
# Login como admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lms.com", "password": "admin123"}'

# Guardar token
export TOKEN="<token_recibido>"
```

### 4.2 Verificar Nuevos Endpoints

#### Categorías
```bash
# Obtener categorías (público)
curl http://localhost:8080/api/categories

# Crear categoría (admin)
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Web Development", "slug": "web-dev", "description": "..."}'
```

#### Tags
```bash
# Obtener tags (público)
curl http://localhost:8080/api/tags

# Crear tag (admin)
curl -X POST http://localhost:8080/api/admin/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "JavaScript", "slug": "javascript"}'
```

#### Cursos con Nuevos Campos
```bash
# Crear curso
curl -X POST http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript",
    "description": "Learn advanced JS",
    "price": 99.99,
    "status": "PUBLISHED",
    "enrollmentType": "PAID",
    "capacityLimit": 100,
    "certificateTemplate": "Certificate of Completion",
    "categoryIds": [1],
    "tagIds": [1],
    "prerequisiteCourseIds": []
  }'
```

#### Módulos
```bash
# Crear módulo en curso
curl -X POST http://localhost:8080/api/admin/courses/1/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fundamentals",
    "description": "Basic concepts",
    "moduleOrder": 1
  }'

# Obtener módulos
curl http://localhost:8080/api/admin/courses/1/modules \
  -H "Authorization: Bearer $TOKEN"
```

#### Prerrequisitos
```bash
# Agregar prerequisito
curl -X POST http://localhost:8080/api/admin/courses/2/prerequisites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prerequisiteCourseId": 1}'

# Obtener prerrequisitos
curl http://localhost:8080/api/admin/courses/2/prerequisites \
  -H "Authorization: Bearer $TOKEN"
```

#### Lecciones con Drip Content
```bash
# Crear lección con AUDIO
curl -X POST http://localhost:8080/api/admin/courses/1/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Intro to JS" \
  -F "lessonOrder=1" \
  -F "moduleId=1" \
  -F "releaseAfterDays=3" \
  -F "file=@/path/to/audio.mp3"
```

---

## 5. Testing Frontend

### 5.1 Verificar Interfaz

1. **Home Page:**
   - [ ] Abre http://localhost:3000/
   - [ ] Aparecen 3 selectores de filtro: Categoría, Etiqueta, Tipo Matrícula
   - [ ] Cursos muestran badges de estado (DRAFT, PUBLISHED)
   - [ ] Cursos muestran categorías y tags
   - [ ] Cursos muestran capacidad si existe

2. **Course Detail:**
   - [ ] Click en un curso
   - [ ] Si tiene módulos, se agrupen por módulo
   - [ ] Lecciones muestran 🔒 si están bloqueadas por drip
   - [ ] Se muestra banner si hay prerrequisitos pendientes
   - [ ] Se muestra "X/Y plazas" si hay límite de capacidad

3. **Lesson:**
   - [ ] Lesson de VIDEO: reproductor con Plyr
   - [ ] Lesson de PDF: iframe con PDF
   - [ ] Lesson de AUDIO: reproductor HTML5 audio
   - [ ] Botón "Mark as Completed"

4. **Admin - Course Form:**
   - [ ] Campo "Status": DRAFT, PUBLISHED, ARCHIVED
   - [ ] Campo "Enrollment Type": OPEN, PAID, INVITE_ONLY
   - [ ] Campo "Capacity Limit": número
   - [ ] Campo "Certificate Template": texto
   - [ ] Multi-select de Categorías
   - [ ] Multi-select de Tags

### 5.2 Flujo Completo de Testing

```
1. Admin crea categoría "Web Development"
   ↓
2. Admin crea tag "JavaScript"
   ↓
3. Admin crea curso:
   - Título: "JavaScript Advanced"
   - Status: DRAFT
   - Enrollment: PAID
   - Price: $99.99
   - Capacity: 50
   - Categoría: Web Development
   - Tag: JavaScript
   ↓
4. Admin crea módulo "Part 1: Basics"
   ↓
5. Admin carga lección VIDEO al módulo
   ↓
6. Admin carga lección AUDIO al módulo con releaseAfterDays=3
   ↓
7. Admin cambia curso a PUBLISHED
   ↓
8. Usuario regular ve el curso en Home (filtrable por categoría/tag)
   ↓
9. Usuario compra el curso
   ↓
10. Usuario ve módulo y lecciones
    - Lección 1: disponible
    - Lección 2: bloqueada con 🔒 (esperando 3 días)
    ↓
11. Usuario completa Lección 1
    ↓
12. Progreso se actualiza en Home y CourseDetail
    ↓
13. Esperamos 3 días (o alteramos fecha en BD para testing)
    ↓
14. Lección 2 se desbloquea automáticamente
```

---

## 6. Problemas Comunes y Soluciones

### Error: "No such column: status"
**Causa:** Migraciones no ejecutadas
**Solución:**
```bash
# Limpiar schema
docker-compose down -v
# Levantar nuevamente
docker-compose up -d
```

### Error: "java.util.NoSuchElementException" en CourseService
**Causa:** Categoría o Tag no existen
**Solución:** Crear categorías/tags primero antes de asignarlos

### Audio no se reproduce en Lesson
**Causa:** Content-Type incorrecto
**Solución:**
```bash
# Verificar en MinIO que el arquivo tiene tipo audio/mpeg
# En StorageService, verificar que isAudioFile() detecta correctamente
```

### Drip content no funciona
**Causa:** `purchaseDate` es NULL
**Solución:** Verificar que existe registro en `purchases` con `status='COMPLETED'`

### Módulos no agrupan lecciones
**Causa:** Lecciones no tienen `moduleId` asignado
**Solución:** Asignar lecciones a módulos usando endpoint PUT `/api/admin/lessons/{lessonId}/module`

---

## 7. Despliegue a Producción

### 7.1 Build de Imágenes Docker

```bash
# Backend
docker build -f backend/Dockerfile -t lms-backend:1.0 ./backend

# Frontend
docker build -f frontend/Dockerfile -t lms-frontend:1.0 ./frontend

# Push a registry (si es necesario)
docker tag lms-backend:1.0 myregistry/lms-backend:1.0
docker push myregistry/lms-backend:1.0
```

### 7.2 Database Migration en Prod

```bash
# Usar docker-compose.yml (no override) en producción
docker-compose -f docker-compose.yml up -d

# Las migraciones se ejecutarán automáticamente con Flyway
# Verificar logs:
docker logs lms-backend | grep -i migration
```

### 7.3 Verificación Post-Deploy

```bash
# Health check
curl https://api.ejemplo.com/api/health

# Endpoints públicos
curl https://api.ejemplo.com/api/courses
curl https://api.ejemplo.com/api/categories
curl https://api.ejemplo.com/api/tags

# Verificar SSL/TLS
curl -I https://ejemplo.com/
```

---

## 8. Rollback (si es necesario)

### 8.1 Revertir Migraciones

Si necesitas rollback:

```sql
-- Conectar a BD
DELETE FROM flyway_schema_history WHERE version IN ('13', '14', '15', '16');

-- Las tablas seguirán existiendo, pero serán ignoradas por la app
-- Para eliminarlas:
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS course_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS course_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS modules CASCADE;

-- Revertir columnas en tablas existentes
ALTER TABLE courses DROP COLUMN IF EXISTS status;
ALTER TABLE courses DROP COLUMN IF EXISTS enrollment_type;
ALTER TABLE courses DROP COLUMN IF EXISTS capacity_limit;
ALTER TABLE courses DROP COLUMN IF EXISTS certificate_template;

ALTER TABLE lessons DROP COLUMN IF EXISTS module_id;
ALTER TABLE lessons DROP COLUMN IF EXISTS release_after_days;
ALTER TABLE lessons DROP COLUMN IF EXISTS available_from;

ALTER TABLE assessments DROP COLUMN IF EXISTS assessment_type;
ALTER TABLE assessments DROP COLUMN IF EXISTS lesson_id;
```

---

## 9. Monitoreo en Producción

### 9.1 Logs Importantes

```bash
# Backend - migraciones
grep -i "migration\|executing" /var/log/lms-backend.log

# Backend - errores de curso
grep -i "course\|category\|module" /var/log/lms-backend.log | grep -i error

# Frontend - errores de filtros
grep -i "filter\|course.*load" /var/log/lms-frontend.log
```

### 9.2 Métricas a Vigilar

- Tiempo de respuesta de `/api/courses` (especialmente con filtros)
- Queries a tablas nuevas (modules, categories, course_prerequisites)
- Uso de almacenamiento (carpeta "audios/")
- Errores al aplicar migraciones

### 9.3 Backups

```bash
# Backup de BD antes de deploy
pg_dump -U postgres lms_db > lms_db_backup_$(date +%Y%m%d).sql

# Backup de MinIO
# Usar AWS S3 CLI o similares para respaldar bucket
```

---

## 10. Documentación de Endpoints

### Nuevos Endpoints Públicos
```
GET  /api/courses?category=slug&tag=slug&enrollmentType=TYPE
GET  /api/categories
GET  /api/tags
```

### Nuevos Endpoints Admin
```
PUT    /api/admin/courses/{id}/status
GET    /api/admin/courses/{courseId}/modules
POST   /api/admin/courses/{courseId}/modules
PUT    /api/admin/modules/{moduleId}
DELETE /api/admin/modules/{moduleId}
PUT    /api/admin/lessons/{lessonId}/module
GET    /api/admin/courses/{id}/prerequisites
POST   /api/admin/courses/{id}/prerequisites
DELETE /api/admin/courses/{id}/prerequisites/{prereqId}
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
POST   /api/admin/courses/{id}/categories
DELETE /api/admin/courses/{id}/categories/{categoryId}
GET    /api/admin/tags
POST   /api/admin/tags
PUT    /api/admin/tags/{id}
DELETE /api/admin/tags/{id}
POST   /api/admin/courses/{id}/tags
DELETE /api/admin/courses/{id}/tags/{tagId}
POST   /api/admin/courses/{courseId}/enroll
DELETE /api/admin/courses/{courseId}/enroll/{userId}
```

---

**Documento de Verificación y Despliegue**  
**Responsable:** GitHub Copilot  
**Última Actualización:** 21 de marzo de 2026

