#!/usr/bin/env bash
set -euo pipefail

# Script para verificar flujo completo de administración de usuarios
# Requisitos: curl, jq
# Uso: ./scripts/test-admin-users.sh

API_URL=${API_URL:-http://localhost:8080}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@lms.com}
ADMIN_PASS=${ADMIN_PASS:-admin123}

echo "Usando API: $API_URL"

echo "1) Login admin..."
LOGIN_RESP=$(curl -sS -X POST "$API_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" ) || true
if [ -z "$LOGIN_RESP" ]; then
  echo "ERROR: login no devolvió respuesta. Asegúrate de que el backend esté corriendo en $API_URL" >&2
  exit 2
fi
TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token // empty')
if [ -z "$TOKEN" ]; then
  echo "ERROR: no se obtuvo token. Respuesta: $LOGIN_RESP" >&2
  exit 3
fi
echo " -> Token obtenido"

AUTH_HEADER=("Authorization: Bearer $TOKEN")

# Helper para imprimir separador
sep() { echo "\n============================================\n"; }

sep
echo "2) Listar usuarios (GET /api/admin/users)"
curl -sS -H "${AUTH_HEADER[0]}" "$API_URL/api/admin/users" | jq '.' || true

sep
echo "3) Crear usuario de prueba (POST /api/admin/users)"
CREATE_PAYLOAD='{ "fullName": "Test User Auto", "email": "test-auto@example.com", "password": "TestPass123", "role": "USER" }'
CREATE_RESP=$(curl -sS -X POST -H 'Content-Type: application/json' -H "${AUTH_HEADER[0]}" -d "$CREATE_PAYLOAD" "$API_URL/api/admin/users" ) || true
echo "$CREATE_RESP" | jq '.' || true
NEW_ID=$(echo "$CREATE_RESP" | jq -r '.id // empty')
if [ -z "$NEW_ID" ]; then
  echo "ERROR: no se pudo crear usuario. Respuesta: $CREATE_RESP" >&2
  exit 4
fi
echo " -> Usuario creado id=$NEW_ID"

sep
echo "4) Actualizar usuario (PUT /api/admin/users/$NEW_ID) - cambiar nombre y rol"
UPDATE_PAYLOAD='{ "fullName": "Test User Renamed", "role": "ADMIN" }'
UPDATE_RESP=$(curl -sS -X PUT -H 'Content-Type: application/json' -H "${AUTH_HEADER[0]}" -d "$UPDATE_PAYLOAD" "$API_URL/api/admin/users/$NEW_ID") || true
echo "$UPDATE_RESP" | jq '.' || true

sep
echo "5) Verificar usuario actualizado (GET /api/admin/users | filter id)"
curl -sS -H "${AUTH_HEADER[0]}" "$API_URL/api/admin/users" | jq ".[] | select(.id == $NEW_ID)" || true

sep
echo "6) Eliminar usuario (DELETE /api/admin/users/$NEW_ID)"
DEL_RESP=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE -H "${AUTH_HEADER[0]}" "$API_URL/api/admin/users/$NEW_ID" ) || true
if [ "$DEL_RESP" == "204" ]; then
  echo " -> Usuario eliminado (HTTP 204)"
else
  echo " -> Respuesta al eliminar: $DEL_RESP"
fi

sep
echo "7) Verificar eliminación de usuario (GET /api/admin/users)"
curl -sS -H "${AUTH_HEADER[0]}" "$API_URL/api/admin/users" | jq '.' || true

sep
echo "Flujo de administración de usuarios completado."
