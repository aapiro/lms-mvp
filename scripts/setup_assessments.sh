#!/bin/bash

echo "=== Verificando y poblando datos de evaluaciones ==="

# Verificar estado de Docker
echo "1. Verificando contenedores Docker..."
docker-compose ps

# Verificar tablas en la base de datos
echo "2. Verificando tablas de evaluaciones..."
docker-compose exec postgres psql -U postgres -d lmsdb -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('assessments', 'questions', 'submissions', 'grades');
"

# Verificar cursos existentes
echo "3. Verificando cursos existentes..."
docker-compose exec postgres psql -U postgres -d lmsdb -c "SELECT id, title FROM courses LIMIT 5;"

# Insertar datos de prueba
echo "4. Insertando datos de prueba..."
docker-compose exec postgres psql -U postgres -d lmsdb -f scripts/insert_test_assessments.sql

# Verificar datos insertados
echo "5. Verificando datos insertados..."
docker-compose exec postgres psql -U postgres -d lmsdb -c "
SELECT a.id, a.title, COUNT(q.id) as questions
FROM assessments a
LEFT JOIN questions q ON a.id = q.assessment_id
GROUP BY a.id, a.title;
"

echo "6. Verificando submissions..."
docker-compose exec postgres psql -U postgres -d lmsdb -c "SELECT * FROM submissions;"

echo "7. Verificando calificaciones..."
docker-compose exec postgres psql -U postgres -d lmsdb -c "SELECT * FROM grades;"

echo "=== Proceso completado ==="
echo ""
echo "Para probar el frontend:"
echo "1. Abre http://localhost:3000"
echo "2. Ve a un curso (ej: http://localhost:3000/course/1)"
echo "3. Haz clic en la pestaña 'Assessments'"
echo "4. Deberías ver las evaluaciones disponibles"
