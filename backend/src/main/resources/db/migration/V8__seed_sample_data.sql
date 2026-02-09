-- Seed sample course, lesson and purchase for local development

-- Insert a sample course created by admin (only if admin exists and course does not exist)
INSERT INTO courses (title, description, price, thumbnail_url, created_by)
SELECT 'Sample Course', 'Course used for dashboard metrics & testing', 29.99, '', u.id
FROM users u
WHERE u.email = 'admin@lms.com'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Sample Course');

-- Insert a sample lesson for the sample course
INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds)
SELECT c.id, 'Intro Lesson', 1, 'VIDEO', 'sample-intro.mp4', 120
FROM courses c
WHERE c.title = 'Sample Course'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Intro Lesson');

-- Insert a sample purchase by test user for sample course
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status)
SELECT u.id, c.id, 29.99, 'dev-payment', 'COMPLETED'
FROM users u, courses c
WHERE u.email = 'test@example.com'
  AND c.title = 'Sample Course'
  AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = u.id AND p.course_id = c.id);
