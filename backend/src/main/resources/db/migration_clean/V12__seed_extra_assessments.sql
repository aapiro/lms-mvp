-- V12: Seed extra demo data for QA/testing (idempotent)
-- Creates a QA user, a QA course and an assessment with questions and a sample submission.

-- Insert QA user if not exists (let the DB assign id)
INSERT INTO users (email, full_name, password, role, created_at, updated_at)
SELECT 'qa@lms.local', 'QA User', '<no-password-hash>', 'STUDENT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'qa@lms.local');

-- Insert QA course with fixed id 2100 if not exists (references QA user)
INSERT INTO courses (id, title, description, created_by, created_at, updated_at)
SELECT 2100, 'Curso QA', 'Curso para pruebas automáticas creado por migración V12', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'qa@lms.local'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE id = 2100 OR title = 'Curso QA');

-- Create an assessment for course 2100 if not exists
INSERT INTO assessments (id, course_id, title, description, start_date, end_date, duration_minutes, total_points, created_at, updated_at)
SELECT 6100, c.id, 'Evaluación QA', 'Evaluación creada por migración V12', NOW()+interval '1 day', NOW()+interval '2 day', 30, 30, NOW(), NOW()
FROM courses c
WHERE c.id = 2100
  AND NOT EXISTS (SELECT 1 FROM assessments WHERE id = 6100 OR (title = 'Evaluación QA' AND course_id = c.id));

-- Add two questions for the QA assessment
INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 7100, a.id, '¿Cuál es 2 + 2?', 'MULTIPLE_CHOICE', '["3","4","5"]', '4', 10
FROM assessments a
WHERE a.id = 6100
  AND NOT EXISTS (SELECT 1 FROM questions WHERE id = 7100);

INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 7101, a.id, 'Explica brevemente qué es un número primo.', 'OPEN_ENDED', NULL, NULL, 20
FROM assessments a
WHERE a.id = 6100
  AND NOT EXISTS (SELECT 1 FROM questions WHERE id = 7101);

-- Optional: create a sample submission by the QA user if both exist
INSERT INTO submissions (id, assessment_id, user_id, submitted_at, answers, status, score)
SELECT 8100, a.id, u.id, NOW(), '[{"questionId":7100,"answer":"4"},{"questionId":7101,"answer":"Es un número divisible solo por 1 y sí mismo"}]', 'SUBMITTED', 20
FROM assessments a, users u
WHERE a.id = 6100
  AND u.email = 'qa@lms.local'
  AND NOT EXISTS (SELECT 1 FROM submissions WHERE id = 8100);

-- End V12

