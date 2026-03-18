-- Insertar datos de prueba para evaluaciones

-- Primero, obtener IDs de cursos existentes
-- Asumiendo que hay cursos con IDs 1, 2, etc.

-- Insertar evaluaciones
INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points) VALUES
(1, 'Evaluación Final de Matemáticas', 'Evaluación completa del curso de matemáticas básicas', '2026-02-10 09:00:00', '2026-02-10 11:00:00', 120, 100),
(2, 'Quiz de Programación', 'Evaluación rápida de conceptos básicos de programación', '2026-02-15 14:00:00', '2026-02-15 15:00:00', 60, 50);

-- Insertar preguntas para la primera evaluación (assessment_id = 1)
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points) VALUES
(1, '¿Cuál es el resultado de 2 + 2?', 'MULTIPLE_CHOICE', '["3", "4", "5", "6"]', '4', 10),
(1, '¿Qué es un número primo?', 'OPEN_ENDED', NULL, 'Un número mayor que 1 que solo es divisible por 1 y por sí mismo', 20),
(1, 'Resuelve la ecuación: 2x + 3 = 7', 'OPEN_ENDED', NULL, 'x = 2', 15);

-- Insertar preguntas para la segunda evaluación (assessment_id = 2)
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points) VALUES
(2, '¿Qué significa HTML?', 'MULTIPLE_CHOICE', '["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"]', 'HyperText Markup Language', 10),
(2, '¿Cuál es la función principal de un bucle en programación?', 'OPEN_ENDED', NULL, 'Repetir un conjunto de instrucciones múltiples veces', 20),
(2, '¿Qué es un algoritmo?', 'OPEN_ENDED', NULL, 'Un conjunto finito de instrucciones bien definidas para resolver un problema', 20);

-- Insertar una submission de prueba (asumiendo user_id = 1 existe)
INSERT INTO submissions (assessment_id, user_id, submitted_at, answers, status, score) VALUES
(1, 1, '2026-02-10 10:30:00', '{"1": "4", "2": "Un número primo es aquel mayor que 1 que solo es divisible por 1 y por sí mismo", "3": "x = 2"}', 'SUBMITTED', 45);

-- Insertar grades para la submission
INSERT INTO grades (submission_id, question_id, score, feedback, graded_by, graded_at) VALUES
(1, 1, 10, 'Respuesta correcta', 'Sistema', '2026-02-10 10:35:00'),
(1, 2, 20, 'Definición correcta', 'Sistema', '2026-02-10 10:35:00'),
(1, 3, 15, 'Respuesta correcta', 'Sistema', '2026-02-10 10:35:00');
