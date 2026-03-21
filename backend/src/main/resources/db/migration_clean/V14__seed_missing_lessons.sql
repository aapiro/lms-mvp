-- V14: Seed missing lessons for courses created without lessons (idempotent)
-- Cursos afectados: "Curso Demo" (999), "Curso DEMO 2" (2001), "Curso QA" (2100)

-- ── Lecciones para "Curso Demo" (id 999, creado en V10) ─────────────────────
INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3900, c.id, 'Introducción al Curso Demo', 1, 'VIDEO', 'demo/v10-intro.mp4', 240, NOW(), NOW()
FROM courses c
WHERE c.id = 999
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3900);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3901, c.id, 'Conceptos Básicos', 2, 'VIDEO', 'demo/v10-basics.mp4', 360, NOW(), NOW()
FROM courses c
WHERE c.id = 999
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3901);

-- ── Lecciones para "Curso DEMO 2" (id 2001, creado en V11) ──────────────────
INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3100, c.id, 'Lección 1 - Fundamentos', 1, 'VIDEO', 'demo/v11-c2-intro.mp4', 300, NOW(), NOW()
FROM courses c
WHERE c.id = 2001
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3100);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3101, c.id, 'Lección 2 - Práctica', 2, 'VIDEO', 'demo/v11-c2-practice.mp4', 420, NOW(), NOW()
FROM courses c
WHERE c.id = 2001
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3101);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3102, c.id, 'Material de Apoyo', 3, 'PDF', 'demo/v11-c2-notes.pdf', NULL, NOW(), NOW()
FROM courses c
WHERE c.id = 2001
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3102);

-- ── Lecciones para "Curso QA" (id 2100, creado en V12) ──────────────────────
INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3200, c.id, 'Introducción a QA', 1, 'VIDEO', 'demo/v12-qa-intro.mp4', 300, NOW(), NOW()
FROM courses c
WHERE c.id = 2100
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3200);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3201, c.id, 'Pruebas Automáticas', 2, 'VIDEO', 'demo/v12-qa-auto.mp4', 480, NOW(), NOW()
FROM courses c
WHERE c.id = 2100
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3201);

INSERT INTO lessons (id, course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT 3202, c.id, 'Casos de Prueba - PDF', 3, 'PDF', 'demo/v12-qa-cases.pdf', NULL, NOW(), NOW()
FROM courses c
WHERE c.id = 2100
  AND NOT EXISTS (SELECT 1 FROM lessons WHERE id = 3202);

-- End V14

