-- V11: Seed full demo data for development (idempotent)
-- Inserts users, courses, lessons, purchases, progress, assessments, questions, submissions, grades for testing the whole app.

-- Users (use existing safe columns including full_name)
INSERT INTO users (id, email, full_name, password, role, created_at, updated_at)
SELECT 1000, 'alice@lms.local', 'Alice', '<no-password-hash>', 'STUDENT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@lms.local');

INSERT INTO users (id, email, full_name, password, role, created_at, updated_at)
SELECT 1001, 'bob@lms.local', 'Bob', '<no-password-hash>', 'STUDENT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@lms.local');

INSERT INTO users (id, email, full_name, password, role, created_at, updated_at)
SELECT 1002, 'instructor@lms.local', 'Instructor', '<no-password-hash>', 'INSTRUCTOR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'instructor@lms.local');

-- Courses
INSERT INTO courses (id, title, description, created_by, created_at, updated_at)
SELECT 2000, 'Curso DEMO 1', 'Un curso demo para pruebas', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'instructor@lms.local'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE id = 2000 OR title = 'Curso DEMO 1');

INSERT INTO courses (id, title, description, created_by, created_at, updated_at)
SELECT 2001, 'Curso DEMO 2', 'Otro curso demo', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'instructor@lms.local'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE id = 2001 OR title = 'Curso DEMO 2');

-- Lessons for course 2000
-- The lessons table requires title and uses columns: lesson_order, lesson_type, file_key, duration_seconds
INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3000, c.id, 'Lección 1 - Introducción', 1, 'VIDEO', 'demo/video1.mp4', 300, NOW(), NOW()
FROM courses c
WHERE c.id = 2000 AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3000);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3001, c.id, 'Lección 2 - PDF', 2, 'PDF', 'demo/notes1.pdf', NULL, NOW(), NOW()
FROM courses c
WHERE c.id = 2000 AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3001);

-- Purchases: Alice buys course 2000
INSERT INTO purchases (id, user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT 4000, u.id, c.id, 19.99, 'pi_demo_1', 'COMPLETED', NOW()
FROM users u, courses c
WHERE u.email = 'alice@lms.local' AND c.id = 2000
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE id = 4000);

-- Progress: Alice completed lesson 3000
INSERT INTO progress (id, user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT 5000, u.id, l.id, TRUE, NOW(), NOW(), NOW()
FROM users u, lessons l
WHERE u.email = 'alice@lms.local' AND l.id = 3000
  AND NOT EXISTS (SELECT 1 FROM progress WHERE id = 5000);

-- Assessments for course 2000
INSERT INTO assessments (id, course_id, title, description, start_date, end_date, duration_minutes, total_points, created_at, updated_at)
SELECT 6000, c.id, 'Quiz de Introducción', 'Evaluación de la introducción', NOW()+interval '1 day', NOW()+interval '2 day', 30, 30, NOW(), NOW()
FROM courses c
WHERE c.id = 2000 AND NOT EXISTS (SELECT 1 FROM assessments WHERE id = 6000);

-- Questions for assessment 6000
INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 7000, a.id, '¿Cuál es la capital de Francia?', 'MULTIPLE_CHOICE', '["Madrid","Paris","Berlin"]', 'Paris', 10
FROM assessments a
WHERE a.id = 6000 AND NOT EXISTS (SELECT 1 FROM questions WHERE id = 7000);

INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points)
SELECT 7001, a.id, 'Explica brevemente qué es HTTP.', 'OPEN_ENDED', NULL, NULL, 20
FROM assessments a
WHERE a.id = 6000 AND NOT EXISTS (SELECT 1 FROM questions WHERE id = 7001);

-- Submission: Alice submitted assessment 6000
INSERT INTO submissions (id, assessment_id, user_id, submitted_at, answers, status, score)
SELECT 8000, a.id, u.id, NOW(), '[{"questionId":7000,"answer":"Paris"},{"questionId":7001,"answer":"Protocolo de transferencia de hipertexto"}]', 'SUBMITTED', 10
FROM assessments a, users u
WHERE a.id = 6000 AND u.email = 'alice@lms.local' AND NOT EXISTS (SELECT 1 FROM submissions WHERE id = 8000);

-- Grades: grade the MCQ question
INSERT INTO grades (id, submission_id, question_id, score, feedback, graded_by, graded_at)
SELECT 9000, s.id, q.id, 10, 'Correcto', 'SYSTEM', NOW()
FROM submissions s, questions q
WHERE s.id = 8000 AND q.id = 7000 AND NOT EXISTS (SELECT 1 FROM grades WHERE id = 9000);

-- End V11

