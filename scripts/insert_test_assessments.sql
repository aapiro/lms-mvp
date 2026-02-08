-- Script para insertar datos de prueba de evaluaciones
-- Ejecutar después de verificar que las tablas existen

-- Insertar evaluaciones de prueba
INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points)
SELECT 1, 'Evaluación Final de Matemáticas', 'Evaluación completa del curso de matemáticas básicas', '2026-02-10 09:00:00', '2026-02-10 11:00:00', 120, 100
WHERE EXISTS (SELECT 1 FROM courses WHERE id = 1);

INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points)
SELECT 2, 'Quiz de Programación', 'Evaluación rápida de conceptos básicos de programación', '2026-02-15 14:00:00', '2026-02-15 15:00:00', 60, 50
WHERE EXISTS (SELECT 1 FROM courses WHERE id = 2);

-- Insertar preguntas para las evaluaciones
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 1, '¿Cuál es el resultado de 2 + 2?', 'MULTIPLE_CHOICE', '["3", "4", "5", "6"]', '4', 10
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 1);

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 1, '¿Qué es un número primo?', 'OPEN_ENDED', NULL, 'Un número mayor que 1 que solo es divisible por 1 y por sí mismo', 20
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 1);

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 1, 'Resuelve la ecuación: 2x + 3 = 7', 'OPEN_ENDED', NULL, 'x = 2', 15
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 1);

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 2, '¿Qué significa HTML?', 'MULTIPLE_CHOICE', '["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"]', 'HyperText Markup Language', 10
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 2);

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 2, '¿Cuál es la función principal de un bucle en programación?', 'OPEN_ENDED', NULL, 'Repetir un conjunto de instrucciones múltiples veces', 20
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 2);

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 2, '¿Qué es un algoritmo?', 'OPEN_ENDED', NULL, 'Un conjunto finito de instrucciones bien definidas para resolver un problema', 20
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 2);

-- Insertar una submission de prueba (asumiendo user_id = 1 existe)
INSERT INTO submissions (assessment_id, user_id, submitted_at, answers, status, score)
SELECT 1, 1, '2026-02-10 10:30:00', '{"1": "4", "2": "Un número primo es aquel mayor que 1 que solo es divisible por 1 y por sí mismo", "3": "x = 2"}', 'SUBMITTED', 45
WHERE EXISTS (SELECT 1 FROM assessments WHERE id = 1) AND EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Insertar grades para la submission
INSERT INTO grades (submission_id, question_id, score, feedback, graded_by, graded_at)
SELECT 1, 1, 10, 'Respuesta correcta', 'Sistema', '2026-02-10 10:35:00'
WHERE EXISTS (SELECT 1 FROM submissions WHERE id = 1) AND EXISTS (SELECT 1 FROM questions WHERE id = 1);

INSERT INTO grades (submission_id, question_id, score, feedback, graded_by, graded_at)
SELECT 1, 2, 20, 'Definición correcta', 'Sistema', '2026-02-10 10:35:00'
WHERE EXISTS (SELECT 1 FROM submissions WHERE id = 1) AND EXISTS (SELECT 1 FROM questions WHERE id = 2);

INSERT INTO grades (submission_id, question_id, score, feedback, graded_by, graded_at)
SELECT 1, 3, 15, 'Respuesta correcta', 'Sistema', '2026-02-10 10:35:00'
WHERE EXISTS (SELECT 1 FROM submissions WHERE id = 1) AND EXISTS (SELECT 1 FROM questions WHERE id = 3);
