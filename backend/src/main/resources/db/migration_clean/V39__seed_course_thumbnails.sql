-- Seed deterministic demo cover images for existing courses missing a thumbnail.
-- Uses picsum.photos with a stable seed per course id so images are reproducible
-- across environments without pulling in Unsplash/Pexels keys.

UPDATE courses
SET thumbnail_url = 'https://picsum.photos/seed/lms-course-' || id || '/640/360'
WHERE thumbnail_url IS NULL OR thumbnail_url = '';
