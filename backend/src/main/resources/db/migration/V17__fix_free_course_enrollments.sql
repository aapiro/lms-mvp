-- V17: Fix free course enrollments
-- For FREE courses (price explicitly set to 0.00), create purchase records for all users that don't already have them
-- This ensures free courses are properly "owned" by users through the purchase system
-- NOTE: Only creates purchases for courses with price = 0.00, NOT NULL values

-- Insert purchase records for all users in TRULY FREE courses (price = 0.00)
-- Condition: price must be explicitly 0.00, NOT NULL
INSERT INTO purchases (user_id, course_id, amount, status, purchased_at)
SELECT DISTINCT
    u.id,
    c.id,
    0.00,
    'COMPLETED',
    NOW()
FROM users u
CROSS JOIN courses c
WHERE c.price = 0::DECIMAL
  AND c.price IS NOT NULL
  AND u.role IN ('USER', 'STUDENT', 'ADMIN')
  AND NOT EXISTS (
    SELECT 1 FROM purchases p
    WHERE p.user_id = u.id AND p.course_id = c.id
  )
ON CONFLICT (user_id, course_id) DO NOTHING;

-- End V17


