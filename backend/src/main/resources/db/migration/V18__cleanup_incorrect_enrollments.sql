-- V18: Clean up incorrect free course enrollments
-- Removes purchase records that were created for courses with non-zero prices
-- These were created incorrectly by V17 before it was fixed

-- Delete free-price purchases (amount = 0.00) from non-free courses
DELETE FROM purchases p
WHERE p.amount = 0.00
  AND p.status = 'COMPLETED'
  AND p.course_id IN (
    SELECT c.id FROM courses c
    WHERE c.price != 0::DECIMAL
  );

-- End V18


