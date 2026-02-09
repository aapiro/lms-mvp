#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "1) Reconstruir y levantar servicios (postgres, minio, backend, frontend)..."
docker-compose up -d --build

echo "\n2) Esperar 6s para que servicios arranquen..."
sleep 6

echo "\n3) Mostrar estado de contenedores:"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'

echo "\n4) Backend logs (últimas 200 líneas):"
docker-compose logs backend --tail=200 | sed -n '1,200p'

echo "\n5) Comprobar tablas y conteos (Postgres - lmsuser):"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM users WHERE email LIKE '%@lms.local';"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM courses WHERE title LIKE 'Curso DEMO%';"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM lessons WHERE course_id IN (2000,2001);"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM assessments WHERE course_id = 2000;"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM questions WHERE assessment_id = 6000;"
docker-compose exec -T postgres psql -U lmsuser -d lmsdb -c "SELECT count(*) FROM submissions WHERE id = 8000;"

echo "\n6) Probar endpoints HTTP del backend (cursos/assessments/lessons):"
for url in "/api/courses" "/api/courses/2000" "/api/assessments/courses/2000" "/api/assessments/6000" "/api/lessons/3000"; do
  echo "-- GET $url --"
  curl -sS -i "http://localhost:8080${url}" || echo "request failed"
  echo -e "\n"
done

echo "\n7) Probar frontend estático (http://localhost:3000)"
curl -sS -I http://localhost:3000 || true

echo "\n8) Comprobación final: revisa los logs anteriores y confirma que endpoints devolvieron 200 y que las tablas tienen datos."

echo "\nScript finalizado. Copia/pega la salida completa aquí para que la revise."

