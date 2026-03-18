-- V10: Seed dev user, course and assessments (idempotent, safe for dev)
-- Creates a dev user and course if they don't exist, then inserts an assessment with questions.

-- Create dev user with id 999 if not exists (use columns that exist)
INSERT INTO users (id, email, full_name, password, role, created_at, updated_at)
SELECT 999, 'dev@lms.local', 'Dev User', '<no-password-hash>', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 999 OR email = 'dev@lms.local');

-- Create dev course with id 999 if not exists
INSERT INTO courses (id, title, description, created_by, created_at, updated_at)
SELECT 999, 'Curso Demo', 'Curso demo creado por migración V10', u.id, NOW(), NOW()
FROM users u
WHERE (u.id = 999 OR u.email = 'dev@lms.local')
  AND NOT EXISTS (SELECT 1 FROM courses WHERE id = 999 OR title = 'Curso Demo');

-- Create an assessment for course 999 if not exists
INSERT INTO assessments (course_id, title, description, start_date, end_date, duration_minutes, total_points)
SELECT c.id, 'Evaluación Demo V10', 'Evaluación creada por migración V10 para pruebas', NOW()+interval '1 day', NOW()+interval '2 day', 45, 50
FROM courses c
WHERE c.id = 999
  AND NOT EXISTS (SELECT 1 FROM assessments WHERE title = 'Evaluación Demo V10' AND course_id = c.id);

-- Create two questions for the above assessment
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT a.id, '¿Cuál es 2 + 2?', 'MULTIPLE_CHOICE', '["3","4","5"]', '4', 10
FROM assessments a
WHERE a.course_id = 999
  AND a.title = 'Evaluación Demo V10'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.assessment_id = a.id AND q.question_text = '¿Cuál es 2 + 2?');

INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
SELECT a.id, 'Explica brevemente qué es un número primo.', 'OPEN_ENDED', NULL, NULL, 15
FROM assessments a
WHERE a.course_id = 999
  AND a.title = 'Evaluación Demo V10'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.assessment_id = a.id AND q.question_text = 'Explica brevemente qué es un número primo.');

-- End V10

