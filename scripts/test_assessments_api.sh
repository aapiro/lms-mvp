#!/bin/bash

# Script mejorado para probar la funcionalidad de evaluaciones

BASE_URL="http://localhost:8080"
AUTH_TOKEN=""

echo "=== Probando funcionalidad de evaluaciones ==="
echo "Base URL: $BASE_URL"

# Función para hacer requests con mejor manejo de errores
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local auth=$4

    echo "Request: $method $url"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi

    local headers="-H 'Content-Type: application/json'"
    if [ -n "$auth" ]; then
        headers="$headers -H 'Authorization: Bearer $auth'"
    fi

    local cmd="curl -s -w '\nHTTP_CODE:%{http_code}' -X $method '$BASE_URL$url' $headers"
    if [ -n "$data" ]; then
        cmd="$cmd -d '$data'"
    fi

    echo "Comando: $cmd"
    local response=$(eval $cmd)
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_CODE:/d')

    echo "HTTP Code: $http_code"
    echo "Response: $body"
    echo "---"

    # Retornar el código de estado
    return $http_code
}

# 1. Verificar que el backend esté corriendo
echo "1. Verificando que el backend esté corriendo..."
make_request "GET" "/api/courses" "" ""
if [ $? -ne 200 ]; then
    echo "✗ El backend no está respondiendo correctamente"
    exit 1
fi
echo "✓ Backend está corriendo"

# 2. Login para obtener token
echo "2. Obteniendo token de autenticación..."
LOGIN_DATA='{"email":"admin@lms.com","password":"admin123"}'
make_request "POST" "/api/auth/login" "$LOGIN_DATA" ""

# Extraer token de la respuesta (simplificado)
AUTH_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBsbXMuY29tIiwiaWF0IjoxNzM5MDI0MDAwLCJleHAiOjE3MzkwMjc2MDB9.test_token"

echo "Usando token: ${AUTH_TOKEN:0:20}..."

# 3. Crear una evaluación
echo "3. Creando evaluación de prueba..."
CREATE_DATA='{
    "title": "Evaluación de Prueba",
    "description": "Evaluación para probar la funcionalidad",
    "startDate": "2026-02-15T10:00:00",
    "endDate": "2026-02-15T12:00:00",
    "durationMinutes": 120,
    "totalPoints": 100,
    "questions": [
      {
        "questionText": "¿Cuál es la capital de España?",
        "questionType": "MULTIPLE_CHOICE",
        "options": "[\"Madrid\", \"Barcelona\", \"Sevilla\", \"Valencia\"]",
        "correctAnswer": "Madrid",
        "points": 20
      },
      {
        "questionText": "Explica qué es la programación orientada a objetos",
        "questionType": "OPEN_ENDED",
        "points": 30
      }
    ]
  }'

make_request "POST" "/api/assessments/courses/1" "$CREATE_DATA" "$AUTH_TOKEN"

# 4. Obtener evaluaciones del curso
echo "4. Obteniendo evaluaciones del curso 1..."
make_request "GET" "/api/assessments/courses/1" "" "$AUTH_TOKEN"

echo "=== Pruebas completadas ==="
echo "Nota: Para pruebas completas, asegúrate de que:"
echo "1. El backend esté corriendo en http://localhost:8080"
echo "2. Los usuarios admin@lms.com/admin123 existan"
echo "3. El curso con ID 1 exista"
