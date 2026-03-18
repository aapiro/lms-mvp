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
    echo "$http_code"
    return 0
}

# 1. Verificar que el backend esté corriendo
echo "1. Verificando que el backend esté corriendo..."
http_code=$(make_request "GET" "/api/courses" "" "" | tail -n1)
if [ "$http_code" != "200" ]; then
    echo "✗ El backend no está respondiendo correctamente (HTTP $http_code)"
    # Continue because we still might test other endpoints manually
else
    echo "✓ Backend está corriendo"
fi

# 2. Login para obtener token (opcional)
echo "2. Obteniendo token de autenticación (opcional)..."
LOGIN_DATA='{"email":"admin@lms.com","password":"admin123"}'
make_request "POST" "/api/auth/login" "$LOGIN_DATA" ""

# Extraer token de la respuesta (simplificado)
AUTH_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBsbXMuY29tIiwiaWF0IjoxNzM5MDI0MDAwLCJleHAiOjE3MzkwMjc2MDB9.test_token"

echo "Usando token: ${AUTH_TOKEN:0:20}..."

# 3. Crear una evaluación (si se quiere probar)
echo "3. Creando evaluación de prueba (opcional)..."
# (commented out by default)
# CREATE_DATA='...'
# make_request "POST" "/api/assessments/courses/1" "$CREATE_DATA" "$AUTH_TOKEN"

# 4. Obtener evaluaciones del curso
echo "4. Obteniendo evaluaciones del curso 1..."
make_request "GET" "/api/assessments/courses/1" "" "$AUTH_TOKEN"

# 5. Probar start y submit de una assessment usando userId=999 si existe
echo "5. Probando start/submit de una assessment con userId=999 si hay assessments..."
# Obtener assessments para course 999
resp=$(curl -s -X GET "$BASE_URL/api/assessments/courses/999")
if [ -z "$resp" ] || [ "$resp" = "null" ]; then
    echo "No hay evaluaciones para el curso 999. Omisión de start/submit tests."
else
    assessment_id=$(echo "$resp" | jq -r '.[0].id // empty')
    if [ -z "$assessment_id" ]; then
        echo "No se pudo obtener assessment id desde la respuesta: $resp"
    else
        echo "Usando assessment id: $assessment_id"
        # Start submission
        start_resp=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/assessments/$assessment_id/submissions/start?userId=999" -H 'Content-Type: application/json')
        start_code=$(echo "$start_resp" | grep HTTP_CODE | cut -d: -f2)
        start_body=$(echo "$start_resp" | sed '/HTTP_CODE:/d')
        echo "Start HTTP $start_code"
        echo "$start_body" | jq . || echo "$start_body"

        submission_id=$(echo "$start_body" | jq -r '.id // empty')
        if [ -z "$submission_id" ]; then
            echo "No se recibió submission id al iniciar la evaluación"
        else
            echo "Submission id creado: $submission_id"
            # Submit (empty answers)
            submit_payload='{"answers": []}'
            submit_resp=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST -H 'Content-Type: application/json' -d "$submit_payload" "$BASE_URL/api/assessments/$assessment_id/submissions/$submission_id/submit?userId=999")
            submit_code=$(echo "$submit_resp" | grep HTTP_CODE | cut -d: -f2)
            submit_body=$(echo "$submit_resp" | sed '/HTTP_CODE:/d')
            echo "Submit HTTP $submit_code"
            echo "$submit_body" | jq . || echo "$submit_body"
        fi
    fi
fi

echo "=== Pruebas completadas ==="
echo "Nota: Para pruebas completas, asegúrate de que:"
echo "1. El backend esté corriendo en http://localhost:8080"
echo "2. Los usuarios admin@lms.com/admin123 existan"
echo "3. El curso con ID 1 exista"
