-- V9: Seed de datos de prueba para assessments (aplicable en entorno de desarrollo)
-- Inserta evaluaciones, preguntas y una submission de ejemplo si los cursos/usuarios existen.

-- Nota: estas inserciones usan SELECT ... WHERE EXISTS para evitar errores si no existen los ids.

-- Assessment para curso 1
INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points)
SELECT c.id, 'Evaluación de Ejemplo - Curso 1', 'Evaluación automática de ejemplo creada en migración V9',
       NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', 60, 100
FROM courses c
WHERE c.id = 1
ON CONFLICT DO NOTHING;

-- Assessment para curso 2
INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points)
SELECT c.id, 'Quiz de Ejemplo - Curso 2', 'Quiz automático para pruebas',
       NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', 30, 50
FROM courses c
WHERE c.id = 2
ON CONFLICT DO NOTHING;

-- Preguntas para la assessment creada en curso 1 (si existe)
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT a.id, '¿Cuál es 2 + 2?', 'MULTIPLE_CHOICE', '["3","4","5","6"]', '4', 10
FROM assessments a
WHERE a.course_id = 1
  AND a.title = 'Evaluación de Ejemplo - Curso 1'
ON CONFLICT DO NOTHING;

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT a.id, 'Describe brevemente qué es un número primo.', 'OPEN_ENDED', NULL, NULL, 20
FROM assessments a
WHERE a.course_id = 1
  AND a.title = 'Evaluación de Ejemplo - Curso 1'
ON CONFLICT DO NOTHING;

-- Preguntas para la assessment creada en curso 2 (si existe)
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT a.id, '¿Qué significa HTML?', 'MULTIPLE_CHOICE', '["HyperText Markup Language","Home Tool Markup Language","Hyperlink and Text Markup Language"]', 'HyperText Markup Language', 10
FROM assessments a
WHERE a.course_id = 2
  AND a.title = 'Quiz de Ejemplo - Curso 2'
ON CONFLICT DO NOTHING;

-- Crear una submission de ejemplo para la primera assessment y usuario 1 (si existen)
INSERT INTO submissions (assessment_id, user_id, submitted_at, answers, status, score)
SELECT a.id, u.id, NOW(), '{"1": "4", "2": "Respondiendo..."}', 'SUBMITTED', 30
FROM assessments a, users u
WHERE a.course_id = 1
  AND a.title = 'Evaluación de Ejemplo - Curso 1'
  AND u.id = 1
LIMIT 1
ON CONFLICT DO NOTHING;

-- No añadimos grades automáticos aquí: la aplicación puede calificarlas o se pueden añadir manualmente.

-- FIN V9

