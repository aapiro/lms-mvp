-- ...existing code...
-- V9__seed_dashboard_test_data.sql
-- Seed dashboard test data: usuarios, cursos, lecciones, compras y progreso
-- Idempotente: usa WHERE NOT EXISTS para evitar duplicados

-- Create test users
INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'alice@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', 'Alice Example', 'USER', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com');

INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'bob@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', 'Bob Example', 'USER', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@example.com');

INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'carol@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', 'Carol Example', 'USER', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carol@example.com');

-- Insert two courses created by admin (if admin user exists)
INSERT INTO courses (title, description, price, thumbnail_url, created_by, created_at, updated_at)
SELECT 'Analytics Course', 'Course for dashboard metrics and tests - Analytics', 49.99, NULL, u.id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
FROM users u
WHERE u.email = 'admin@lms.com'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Analytics Course');

INSERT INTO courses (title, description, price, thumbnail_url, created_by, created_at, updated_at)
SELECT 'React Basics', 'Intro course to React used for dashboard testing', 29.99, NULL, u.id, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'
FROM users u
WHERE u.email = 'admin@lms.com'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE title = 'React Basics');

-- Insert lessons for new courses
INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Analytics Intro', 1, 'VIDEO', 'analytics-intro.mp4', 180, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
FROM courses c
WHERE c.title = 'Analytics Course'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Analytics Intro');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'React Overview', 1, 'VIDEO', 'react-overview.mp4', 150, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'
FROM courses c
WHERE c.title = 'React Basics'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'React Overview');

-- Insert purchases across different dates to exercise timeseries and revenue metrics
-- Alice: purchase today (Analytics Course)
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, 49.99, 'dev-payment-alice', 'COMPLETED', NOW()
FROM users u, courses c
WHERE u.email = 'alice@example.com' AND c.title = 'Analytics Course'
  AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = u.id AND p.course_id = c.id AND p.stripe_payment_id = 'dev-payment-alice');

-- Bob: purchase 3 days ago (React Basics)
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, 29.99, 'dev-payment-bob', 'COMPLETED', NOW() - INTERVAL '3 days'
FROM users u, courses c
WHERE u.email = 'bob@example.com' AND c.title = 'React Basics'
  AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = u.id AND p.course_id = c.id AND p.stripe_payment_id = 'dev-payment-bob');

-- Carol: purchase 15 days ago (use React Basics as fallback)
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, COALESCE((SELECT id FROM courses WHERE title='Sample Course'), c2.id), COALESCE((SELECT price FROM courses WHERE title='Sample Course'), 29.99), 'dev-payment-carol', 'COMPLETED', NOW() - INTERVAL '15 days'
FROM users u
CROSS JOIN (SELECT id FROM courses WHERE title='React Basics' LIMIT 1) c2
WHERE u.email = 'carol@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM purchases p
    WHERE p.user_id = u.id
      AND (p.course_id = COALESCE((SELECT id FROM courses WHERE title='Sample Course'), c2.id))
  );

-- Insert progress rows (alice completed first lesson of Analytics Course)
INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, TRUE, NOW(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM users u, lessons l, courses c
WHERE u.email = 'alice@example.com' AND c.title = 'Analytics Course' AND l.course_id = c.id AND l.title = 'Analytics Intro'
  AND NOT EXISTS (SELECT 1 FROM progress pr WHERE pr.user_id = u.id AND pr.lesson_id = l.id);

-- Bob started but not completed (React Overview)
INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, FALSE, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM users u, lessons l, courses c
WHERE u.email = 'bob@example.com' AND c.title = 'React Basics' AND l.course_id = c.id AND l.title = 'React Overview'
  AND NOT EXISTS (SELECT 1 FROM progress pr WHERE pr.user_id = u.id AND pr.lesson_id = l.id);

-- End of V9 seed migration

