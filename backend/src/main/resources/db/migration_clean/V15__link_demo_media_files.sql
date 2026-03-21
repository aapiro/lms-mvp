-- V15: Apuntar file_key de lecciones demo a archivos reales en MinIO
-- Los archivos demo/sample.mp4 y demo/sample.pdf fueron subidos a MinIO
-- como recursos de ejemplo reales para todas las lecciones de prueba.

-- ── Lecciones VIDEO → demo/sample.mp4 ───────────────────────────────────────
UPDATE lessons SET file_key = 'demo/sample.mp4', updated_at = NOW()
WHERE lesson_type = 'VIDEO'
  AND course_id IN (999, 2000, 2001, 2100)
  AND file_key != 'demo/sample.mp4';

-- ── Lecciones PDF → demo/sample.pdf ─────────────────────────────────────────
UPDATE lessons SET file_key = 'demo/sample.pdf', updated_at = NOW()
WHERE lesson_type = 'PDF'
  AND course_id IN (999, 2000, 2001, 2100)
  AND file_key != 'demo/sample.pdf';

-- Lecciones de cursos de Analytics/React (V9) también son datos demo
UPDATE lessons SET file_key = 'demo/sample.mp4', updated_at = NOW()
WHERE lesson_type = 'VIDEO'
  AND course_id IN (SELECT id FROM courses WHERE title IN ('Analytics Course', 'React Basics', 'Sample Course'))
  AND file_key != 'demo/sample.mp4';

-- End V15

