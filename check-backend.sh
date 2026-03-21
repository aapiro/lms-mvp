#!/bin/bash

echo "=== Verificando estado de los contenedores ==="
docker ps -a

echo ""
echo "=== Logs del backend (últimas 30 líneas) ==="
docker logs --tail=30 lms-backend

echo ""
echo "=== Verificando si el backend responde ==="
curl -s http://localhost:8080/api/health && echo " ✓ Backend activo" || echo " ✗ Backend no responde"

