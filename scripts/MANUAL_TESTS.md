# Pruebas Manuales para el Módulo de Evaluaciones

## Verificación de la Implementación

### 1. Verificar que el Backend esté Corriendo
```bash
curl http://localhost:8080/api/courses
```
Debería devolver una lista de cursos (código 200).

### 2. Login para Obtener Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'
```
Debería devolver un token JWT.

### 3. Crear una Evaluación
```bash
curl -X POST http://localhost:8080/api/assessments/courses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
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
```

### 4. Obtener Evaluaciones de un Curso
```bash
curl -X GET http://localhost:8080/api/assessments/courses/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Obtener Evaluación Específica con Preguntas
```bash
curl -X GET http://localhost:8080/api/assessments/ASSESSMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Iniciar una Submission
```bash
curl -X POST http://localhost:8080/api/assessments/ASSESSMENT_ID/submissions/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Enviar Respuestas
```bash
curl -X POST http://localhost:8080/api/assessments/ASSESSMENT_ID/submissions/SUBMISSION_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "answers": {
      "1": "Madrid",
      "2": "La programación orientada a objetos es un paradigma que utiliza objetos y clases."
    }
  }'
```

## Verificación en Base de Datos

Después de las pruebas, verificar en PostgreSQL:

```sql
-- Ver evaluaciones creadas
SELECT * FROM assessments;

-- Ver preguntas
SELECT * FROM questions;

-- Ver submissions
SELECT * FROM submissions;

-- Ver calificaciones
SELECT * FROM grades;
```

## Funcionalidades Implementadas

✅ **Creación de evaluaciones** con preguntas de opción múltiple y abiertas
✅ **Gestión de submissions** (envío de respuestas)
✅ **Calificación automática** para preguntas de opción múltiple
✅ **Integración con IA** para preguntas abiertas (simulada)
✅ **Reportes de desempeño** a través de las calificaciones
✅ **Programación de fechas** de entrega
✅ **Asignación de puntos** por pregunta

## Archivos Implementados

- `Assessment.java` - Entidad principal
- `Question.java` - Entidad de preguntas
- `Submission.java` - Entidad de envíos
- `Grade.java` - Entidad de calificaciones
- `AssessmentController.java` - Endpoints REST
- `AssessmentService.java` - Lógica de negocio
- `AssessmentDto.java` - DTOs para requests/responses
- `V8__create_assessments_tables.sql` - Migración de base de datos

El módulo está completamente funcional y listo para pruebas.
