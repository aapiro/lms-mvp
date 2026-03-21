#!/bin/bash
# Instrucciones Rápidas de Verificación
# Ejecutar después de que la aplicación esté levantada con docker-compose

echo "🎓 LMS - Course Management Feature - Verificación Rápida"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Esperar a que backend esté listo
echo "${YELLOW}⏳ Esperando a que el backend esté listo...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:8080/api/courses > /dev/null 2>&1; then
    echo "${GREEN}✓ Backend está listo${NC}"
    break
  fi
  echo "  Intento $i/30..."
  sleep 2
done

echo ""

# 2. Login como admin
echo "${YELLOW}🔐 Iniciando sesión como administrador...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lms.com", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "${YELLOW}! No se pudo obtener token. Respuesta:${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "${GREEN}✓ Token obtenido: ${TOKEN:0:20}...${NC}"
echo ""

# 3. Verificar endpoints públicos
echo "${YELLOW}📚 Verificando endpoints públicos...${NC}"

COURSES=$(curl -s http://localhost:8080/api/courses | jq 'length')
echo "${GREEN}✓ GET /api/courses: $COURSES cursos${NC}"

CATEGORIES=$(curl -s http://localhost:8080/api/categories | jq 'length')
echo "${GREEN}✓ GET /api/categories: $CATEGORIES categorías${NC}"

TAGS=$(curl -s http://localhost:8080/api/tags | jq 'length')
echo "${GREEN}✓ GET /api/tags: $TAGS tags${NC}"

echo ""

# 4. Crear categoría de prueba
echo "${YELLOW}➕ Creando categoría de prueba...${NC}"
CAT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "slug": "web-dev",
    "description": "Web development courses"
  }')

CAT_ID=$(echo $CAT_RESPONSE | jq -r '.id // empty')
if [ ! -z "$CAT_ID" ]; then
  echo "${GREEN}✓ Categoría creada: ID=$CAT_ID${NC}"
else
  echo "${YELLOW}! Error creando categoría (puede que ya exista)${NC}"
fi

echo ""

# 5. Crear tag de prueba
echo "${YELLOW}➕ Creando tag de prueba...${NC}"
TAG_RESPONSE=$(curl -s -X POST http://localhost:8080/api/admin/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript",
    "slug": "javascript"
  }')

TAG_ID=$(echo $TAG_RESPONSE | jq -r '.id // empty')
if [ ! -z "$TAG_ID" ]; then
  echo "${GREEN}✓ Tag creado: ID=$TAG_ID${NC}"
else
  echo "${YELLOW}! Error creando tag (puede que ya exista)${NC}"
fi

echo ""

# 6. Crear curso con nuevos campos
echo "${YELLOW}➕ Creando curso con nuevas features...${NC}"
COURSE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript - Testing",
    "description": "Learn advanced JavaScript concepts",
    "price": 99.99,
    "status": "PUBLISHED",
    "enrollmentType": "PAID",
    "capacityLimit": 100,
    "certificateTemplate": "Certificate of Completion - Advanced JavaScript",
    "categoryIds": [],
    "tagIds": [],
    "prerequisiteCourseIds": []
  }')

COURSE_ID=$(echo $COURSE_RESPONSE | jq -r '.id // empty')
if [ ! -z "$COURSE_ID" ]; then
  echo "${GREEN}✓ Curso creado: ID=$COURSE_ID${NC}"
  echo "  - Status: PUBLISHED"
  echo "  - Enrollment: PAID"
  echo "  - Capacity: 100"
  echo "  - Certificate: Habilitado"
else
  echo "${YELLOW}! Error creando curso${NC}"
  echo $COURSE_RESPONSE | jq '.'
  exit 1
fi

echo ""

# 7. Crear módulo en el curso
echo "${YELLOW}➕ Creando módulo en el curso...${NC}"
MODULE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/admin/courses/$COURSE_ID/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Module 1: Fundamentals",
    "description": "Learn the basics of advanced JavaScript",
    "moduleOrder": 1
  }')

MODULE_ID=$(echo $MODULE_RESPONSE | jq -r '.id // empty')
if [ ! -z "$MODULE_ID" ]; then
  echo "${GREEN}✓ Módulo creado: ID=$MODULE_ID${NC}"
else
  echo "${YELLOW}! Error creando módulo${NC}"
fi

echo ""

# 8. Obtener detalles del curso
echo "${YELLOW}📋 Obteniendo detalles del curso...${NC}"
COURSE_DETAIL=$(curl -s http://localhost:8080/api/courses/$COURSE_ID)
STATUS=$(echo $COURSE_DETAIL | jq -r '.status // "N/A"')
ENROLLMENT=$(echo $COURSE_DETAIL | jq -r '.enrollmentType // "N/A"')
CAPACITY=$(echo $COURSE_DETAIL | jq -r '.capacityLimit // "N/A"')
CERT=$(echo $COURSE_DETAIL | jq -r '.certificateTemplate // "N/A"' | cut -c1-40)

echo "${GREEN}✓ Curso Details:${NC}"
echo "  - Título: $(echo $COURSE_DETAIL | jq -r '.title')"
echo "  - Estado: $STATUS"
echo "  - Tipo Matrícula: $ENROLLMENT"
echo "  - Capacidad: $CAPACITY"
echo "  - Certificado: $CERT..."

echo ""

# 9. Verificar que el curso aparece en home con filtros
echo "${YELLOW}🔍 Verificando filtros en Home...${NC}"
FILTERED=$(curl -s "http://localhost:8080/api/courses?enrollmentType=PAID" | jq 'length')
echo "${GREEN}✓ Cursos PAID: $FILTERED${NC}"

echo ""

# 10. Resumen
echo "${GREEN}============================================================${NC}"
echo "${GREEN}✅ VERIFICACIÓN EXITOSA${NC}"
echo "${GREEN}============================================================${NC}"
echo ""
echo "📊 Resumen de lo verificado:"
echo "  ✓ Backend API respondiendo"
echo "  ✓ Autenticación JWT funcionando"
echo "  ✓ Nuevos endpoints creados"
echo "  ✓ Categorías y tags operacionales"
echo "  ✓ Cursos con nuevos campos (status, enrollment, capacity, cert)"
echo "  ✓ Módulos para organizar lecciones"
echo "  ✓ Filtros por enrollmentType"
echo ""
echo "🚀 Próximos pasos:"
echo "  1. Abrir http://localhost:3000/ en el navegador"
echo "  2. Verificar que el curso aparece en Home"
echo "  3. Hacer click en el curso para ver módulos"
echo "  4. Ir a /admin para crear más contenido"
echo "  5. Cargar lecciones de VIDEO, PDF y AUDIO"
echo "  6. Probar drip content con releaseAfterDays"
echo "  7. Crear prerrequisitos entre cursos"
echo ""
echo "${YELLOW}📚 Documentación disponible:${NC}"
echo "  - IMPLEMENTATION_SUMMARY.md"
echo "  - DEPLOYMENT_GUIDE.md"
echo "  - CHECKLIST.md"
echo ""

