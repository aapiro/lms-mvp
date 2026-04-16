-- V32: Rich demo data for development and testing
-- Passwords are BCrypt hashes of 'demo1234'
-- $2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO = demo1234

-- ═══════════════════════════════════════════════════
-- 1. USERS (10 students, 3 instructors)
-- ═══════════════════════════════════════════════════

INSERT INTO users (email, password, full_name, role, bio, is_active, created_at, updated_at)
SELECT * FROM (VALUES
  ('carlos.mendez@demo.com',    '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Carlos Méndez',     'STUDENT',    'Desarrollador frontend aprendiendo backend.', true, NOW() - INTERVAL '45 days', NOW()),
  ('maria.garcia@demo.com',     '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'María García',      'STUDENT',    'Diseñadora UX/UI en transición a desarrollo.', true, NOW() - INTERVAL '40 days', NOW()),
  ('pedro.lopez@demo.com',      '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Pedro López',       'STUDENT',    'Estudiante de ingeniería de sistemas.', true, NOW() - INTERVAL '35 days', NOW()),
  ('ana.martinez@demo.com',     '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Ana Martínez',      'STUDENT',    'Data scientist buscando ampliar conocimientos.', true, NOW() - INTERVAL '30 days', NOW()),
  ('luis.hernandez@demo.com',   '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Luis Hernández',    'STUDENT',    'Emprendedor tech aprendiendo a programar.', true, NOW() - INTERVAL '28 days', NOW()),
  ('sofia.ramirez@demo.com',    '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Sofía Ramírez',     'STUDENT',    'Profesora de matemáticas explorando programación.', true, NOW() - INTERVAL '25 days', NOW()),
  ('diego.torres@demo.com',     '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Diego Torres',      'STUDENT',    'Ingeniero mecánico aprendiendo software.', true, NOW() - INTERVAL '20 days', NOW()),
  ('valentina.diaz@demo.com',   '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Valentina Díaz',    'STUDENT',    'Freelance designer learning React.', true, NOW() - INTERVAL '15 days', NOW()),
  ('jorge.silva@demo.com',      '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Jorge Silva',       'STUDENT',    'QA tester buscando aprender desarrollo.', true, NOW() - INTERVAL '10 days', NOW()),
  ('camila.rojas@demo.com',     '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Camila Rojas',      'STUDENT',    'Marketing digital y analytics.', true, NOW() - INTERVAL '5 days', NOW()),
  ('prof.rodriguez@demo.com',   '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Dr. Andrés Rodríguez', 'INSTRUCTOR', '15 años de experiencia en desarrollo web. Especialista en React y Node.js.', true, NOW() - INTERVAL '60 days', NOW()),
  ('prof.castillo@demo.com',    '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Dra. Laura Castillo',  'INSTRUCTOR', 'PhD en Computer Science. Especialista en IA y Machine Learning.', true, NOW() - INTERVAL '55 days', NOW()),
  ('prof.moreno@demo.com',      '$2a$10$dXJ3SW6G7P50lGmMQEqKI.UCXzLx6hHt6VUlMj8pCPqLBtbGqWHjO', 'Ing. Roberto Moreno',  'INSTRUCTOR', 'Arquitecto de software con 10 años en la industria.', true, NOW() - INTERVAL '50 days', NOW())
) AS v(email, password, full_name, role, bio, is_active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = v.email);

-- ═══════════════════════════════════════════════════
-- 2. CATEGORIES & TAGS
-- ═══════════════════════════════════════════════════

INSERT INTO categories (name, slug, description) SELECT 'Programación', 'programacion', 'Cursos de programación y desarrollo de software' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'programacion');
INSERT INTO categories (name, slug, description) SELECT 'Diseño', 'diseno', 'Cursos de diseño UI/UX y gráfico' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'diseno');
INSERT INTO categories (name, slug, description) SELECT 'Data Science', 'data-science', 'Análisis de datos, ML e inteligencia artificial' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'data-science');
INSERT INTO categories (name, slug, description) SELECT 'DevOps', 'devops', 'Infraestructura, CI/CD y cloud' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'devops');
INSERT INTO categories (name, slug, description) SELECT 'Negocios', 'negocios', 'Emprendimiento y gestión de proyectos' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'negocios');

INSERT INTO tags (name, slug) SELECT 'JavaScript', 'javascript' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'javascript');
INSERT INTO tags (name, slug) SELECT 'Python', 'python' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'python');
INSERT INTO tags (name, slug) SELECT 'React', 'react' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'react');
INSERT INTO tags (name, slug) SELECT 'Node.js', 'nodejs' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'nodejs');
INSERT INTO tags (name, slug) SELECT 'SQL', 'sql' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'sql');
INSERT INTO tags (name, slug) SELECT 'Docker', 'docker' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'docker');
INSERT INTO tags (name, slug) SELECT 'AWS', 'aws' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'aws');
INSERT INTO tags (name, slug) SELECT 'Figma', 'figma' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'figma');
INSERT INTO tags (name, slug) SELECT 'Git', 'git' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'git');
INSERT INTO tags (name, slug) SELECT 'TypeScript', 'typescript' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'typescript');

-- ═══════════════════════════════════════════════════
-- 3. COURSES (8 cursos variados)
-- ═══════════════════════════════════════════════════

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'React desde Cero hasta Experto',
       'Aprende React 18 desde los fundamentos hasta técnicas avanzadas. Incluye hooks, context, routing, state management con Zustand y testing con Vitest. Proyecto final: dashboard completo.',
       49.99, 'PUBLISHED', 'PAID', NULL,
       (SELECT id FROM users WHERE email = 'prof.rodriguez@demo.com'), NOW() - INTERVAL '50 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'React desde Cero hasta Experto');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'Python para Data Science',
       'Domina Python aplicado al análisis de datos. NumPy, Pandas, Matplotlib, Seaborn y Scikit-learn. Proyectos prácticos con datasets reales de Kaggle.',
       39.99, 'PUBLISHED', 'PAID', 50,
       (SELECT id FROM users WHERE email = 'prof.castillo@demo.com'), NOW() - INTERVAL '45 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Python para Data Science');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'Arquitectura de Software Moderna',
       'Patrones de diseño, microservicios, event-driven architecture, CQRS y DDD. Para desarrolladores con 2+ años de experiencia.',
       69.99, 'PUBLISHED', 'PAID', 30,
       (SELECT id FROM users WHERE email = 'prof.moreno@demo.com'), NOW() - INTERVAL '40 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Arquitectura de Software Moderna');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'Introducción a la Programación',
       'Tu primer paso en el mundo del código. Variables, condicionales, bucles, funciones y estructuras de datos explicados de forma simple y práctica.',
       0, 'PUBLISHED', 'OPEN', NULL,
       (SELECT id FROM users WHERE email = 'prof.rodriguez@demo.com'), NOW() - INTERVAL '55 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Introducción a la Programación');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'DevOps con Docker y Kubernetes',
       'Containerización, orquestación, CI/CD pipelines con GitHub Actions, monitoreo con Prometheus y Grafana. Del código al deploy automatizado.',
       59.99, 'PUBLISHED', 'PAID', 40,
       (SELECT id FROM users WHERE email = 'prof.moreno@demo.com'), NOW() - INTERVAL '30 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'DevOps con Docker y Kubernetes');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'Diseño UX/UI con Figma',
       'Aprende a diseñar interfaces modernas y centradas en el usuario. Wireframing, prototipos interactivos, design systems y handoff a desarrollo.',
       29.99, 'PUBLISHED', 'OPEN', NULL,
       (SELECT id FROM users WHERE email = 'prof.castillo@demo.com'), NOW() - INTERVAL '25 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Diseño UX/UI con Figma');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'SQL y Bases de Datos Relacionales',
       'Desde SELECT hasta optimización de queries. PostgreSQL, índices, transacciones, vistas materializadas y administración de bases de datos en producción.',
       34.99, 'PUBLISHED', 'PAID', NULL,
       (SELECT id FROM users WHERE email = 'prof.moreno@demo.com'), NOW() - INTERVAL '20 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'SQL y Bases de Datos Relacionales');

INSERT INTO courses (title, description, price, status, enrollment_type, capacity_limit, created_by, created_at, updated_at)
SELECT 'Machine Learning Avanzado',
       'Redes neuronales, deep learning con TensorFlow/PyTorch, NLP y computer vision. Para quienes ya dominan Python y estadística básica.',
       79.99, 'DRAFT', 'PAID', 25,
       (SELECT id FROM users WHERE email = 'prof.castillo@demo.com'), NOW() - INTERVAL '5 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Machine Learning Avanzado');

-- ═══════════════════════════════════════════════════
-- 4. COURSE-CATEGORY & COURSE-TAG ASSOCIATIONS
-- ═══════════════════════════════════════════════════

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'React desde Cero hasta Experto' AND cat.slug = 'programacion'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'Python para Data Science' AND cat.slug = 'data-science'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'Arquitectura de Software Moderna' AND cat.slug = 'programacion'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'Introducción a la Programación' AND cat.slug = 'programacion'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'DevOps con Docker y Kubernetes' AND cat.slug = 'devops'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'Diseño UX/UI con Figma' AND cat.slug = 'diseno'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

INSERT INTO course_categories (course_id, category_id)
SELECT c.id, cat.id FROM courses c, categories cat
WHERE c.title = 'SQL y Bases de Datos Relacionales' AND cat.slug = 'programacion'
  AND NOT EXISTS (SELECT 1 FROM course_categories WHERE course_id = c.id AND category_id = cat.id);

-- Tags
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'React desde Cero hasta Experto' AND t.slug = 'react' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'React desde Cero hasta Experto' AND t.slug = 'javascript' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'React desde Cero hasta Experto' AND t.slug = 'typescript' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'Python para Data Science' AND t.slug = 'python' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'Python para Data Science' AND t.slug = 'sql' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'DevOps con Docker y Kubernetes' AND t.slug = 'docker' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'DevOps con Docker y Kubernetes' AND t.slug = 'aws' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'DevOps con Docker y Kubernetes' AND t.slug = 'git' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'Diseño UX/UI con Figma' AND t.slug = 'figma' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);
INSERT INTO course_tags (course_id, tag_id) SELECT c.id, t.id FROM courses c, tags t WHERE c.title = 'SQL y Bases de Datos Relacionales' AND t.slug = 'sql' AND NOT EXISTS (SELECT 1 FROM course_tags WHERE course_id = c.id AND tag_id = t.id);

-- ═══════════════════════════════════════════════════
-- 5. MODULES & LESSONS (4-6 lecciones por curso)
-- ═══════════════════════════════════════════════════

-- React modules
INSERT INTO modules (course_id, title, description, module_order, created_at, updated_at)
SELECT c.id, 'Fundamentos de React', 'JSX, componentes, props y estado', 1, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = c.id AND title = 'Fundamentos de React');

INSERT INTO modules (course_id, title, description, module_order, created_at, updated_at)
SELECT c.id, 'React Avanzado', 'Hooks, context, performance y patrones', 2, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = c.id AND title = 'React Avanzado');

-- React lessons
INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Bienvenida y Setup del Entorno', 1, 'VIDEO', 'demo/sample.mp4', 480, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Bienvenida y Setup del Entorno');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'JSX y Componentes Funcionales', 2, 'VIDEO', 'demo/sample.mp4', 1200, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'JSX y Componentes Funcionales');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Props, State y Eventos', 3, 'VIDEO', 'demo/sample.mp4', 1500, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Props, State y Eventos');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Guía de Hooks (PDF)', 4, 'PDF', 'demo/sample.pdf', NULL, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Guía de Hooks (PDF)');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'useEffect y Custom Hooks', 5, 'VIDEO', 'demo/sample.mp4', 1800, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'useEffect y Custom Hooks');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Context API y State Management', 6, 'VIDEO', 'demo/sample.mp4', 2100, NOW(), NOW()
FROM courses c WHERE c.title = 'React desde Cero hasta Experto' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Context API y State Management');

-- Python lessons
INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Introducción a Python y Jupyter', 1, 'VIDEO', 'demo/sample.mp4', 600, NOW(), NOW()
FROM courses c WHERE c.title = 'Python para Data Science' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Introducción a Python y Jupyter');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'NumPy: Arrays y Operaciones', 2, 'VIDEO', 'demo/sample.mp4', 1500, NOW(), NOW()
FROM courses c WHERE c.title = 'Python para Data Science' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'NumPy: Arrays y Operaciones');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Pandas: DataFrames y Análisis', 3, 'VIDEO', 'demo/sample.mp4', 2400, NOW(), NOW()
FROM courses c WHERE c.title = 'Python para Data Science' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Pandas: DataFrames y Análisis');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Cheatsheet Pandas (PDF)', 4, 'PDF', 'demo/sample.pdf', NULL, NOW(), NOW()
FROM courses c WHERE c.title = 'Python para Data Science' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Cheatsheet Pandas (PDF)');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Visualización con Matplotlib', 5, 'VIDEO', 'demo/sample.mp4', 1800, NOW(), NOW()
FROM courses c WHERE c.title = 'Python para Data Science' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Visualización con Matplotlib');

-- Intro Programación lessons (free course)
INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, '¿Qué es Programar?', 1, 'VIDEO', 'demo/sample.mp4', 360, NOW(), NOW()
FROM courses c WHERE c.title = 'Introducción a la Programación' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = '¿Qué es Programar?');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Variables y Tipos de Datos', 2, 'VIDEO', 'demo/sample.mp4', 900, NOW(), NOW()
FROM courses c WHERE c.title = 'Introducción a la Programación' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Variables y Tipos de Datos');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Condicionales y Bucles', 3, 'VIDEO', 'demo/sample.mp4', 1200, NOW(), NOW()
FROM courses c WHERE c.title = 'Introducción a la Programación' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Condicionales y Bucles');

INSERT INTO lessons (course_id, title, lesson_order, lesson_type, file_key, duration_seconds, created_at, updated_at)
SELECT c.id, 'Funciones y Modularidad', 4, 'VIDEO', 'demo/sample.mp4', 1500, NOW(), NOW()
FROM courses c WHERE c.title = 'Introducción a la Programación' AND NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id AND title = 'Funciones y Modularidad');

-- ═══════════════════════════════════════════════════
-- 6. PURCHASES (inscripciones variadas)
-- ═══════════════════════════════════════════════════

-- Carlos compró React y Python
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_react_carlos', 'COMPLETED', NOW() - INTERVAL '30 days'
FROM users u, courses c WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_python_carlos', 'COMPLETED', NOW() - INTERVAL '20 days'
FROM users u, courses c WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- María compró React y Figma
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_react_maria', 'COMPLETED', NOW() - INTERVAL '25 days'
FROM users u, courses c WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_figma_maria', 'COMPLETED', NOW() - INTERVAL '15 days'
FROM users u, courses c WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'Diseño UX/UI con Figma'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- Pedro compró Python y SQL
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_python_pedro', 'COMPLETED', NOW() - INTERVAL '20 days'
FROM users u, courses c WHERE u.email = 'pedro.lopez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_sql_pedro', 'COMPLETED', NOW() - INTERVAL '10 days'
FROM users u, courses c WHERE u.email = 'pedro.lopez@demo.com' AND c.title = 'SQL y Bases de Datos Relacionales'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- Ana compró Arquitectura y DevOps
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_arq_ana', 'COMPLETED', NOW() - INTERVAL '18 days'
FROM users u, courses c WHERE u.email = 'ana.martinez@demo.com' AND c.title = 'Arquitectura de Software Moderna'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_devops_ana', 'COMPLETED', NOW() - INTERVAL '8 days'
FROM users u, courses c WHERE u.email = 'ana.martinez@demo.com' AND c.title = 'DevOps con Docker y Kubernetes'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- Luis compró React
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_react_luis', 'COMPLETED', NOW() - INTERVAL '12 days'
FROM users u, courses c WHERE u.email = 'luis.hernandez@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- Sofía compró Python
INSERT INTO purchases (user_id, course_id, amount, stripe_payment_id, status, purchased_at)
SELECT u.id, c.id, c.price, 'pi_demo_python_sofia', 'COMPLETED', NOW() - INTERVAL '15 days'
FROM users u, courses c WHERE u.email = 'sofia.ramirez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = u.id AND course_id = c.id);

-- ═══════════════════════════════════════════════════
-- 7. PROGRESS (lecciones completadas)
-- ═══════════════════════════════════════════════════

-- Carlos completó 4/6 lecciones de React
INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 1
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 2
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 3
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 4
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

-- María completó 2/6 de React
INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 1
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

INSERT INTO progress (user_id, lesson_id, completed, completed_at, created_at, updated_at)
SELECT u.id, l.id, true, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days', NOW()
FROM users u, lessons l, courses c
WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'React desde Cero hasta Experto' AND l.course_id = c.id AND l.lesson_order = 2
  AND NOT EXISTS (SELECT 1 FROM progress WHERE user_id = u.id AND lesson_id = l.id);

-- ═══════════════════════════════════════════════════
-- 8. REVIEWS
-- ═══════════════════════════════════════════════════

INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
SELECT u.id, c.id, 5, 'Excelente curso. El profesor explica muy bien los hooks y el proyecto final me ayudó a consolidar todo.', NOW() - INTERVAL '10 days', NOW()
FROM users u, courses c WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND course_id = c.id);

INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
SELECT u.id, c.id, 4, 'Muy buen contenido, aunque me hubiera gustado más ejemplos prácticos en la sección de Context.', NOW() - INTERVAL '8 days', NOW()
FROM users u, courses c WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND course_id = c.id);

INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
SELECT u.id, c.id, 5, 'Los notebooks de Jupyter son increíbles. Cada lección tiene ejercicios prácticos con datos reales.', NOW() - INTERVAL '12 days', NOW()
FROM users u, courses c WHERE u.email = 'pedro.lopez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND course_id = c.id);

INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
SELECT u.id, c.id, 4, 'Buen curso pero el ritmo es un poco rápido para principiantes absolutos.', NOW() - INTERVAL '6 days', NOW()
FROM users u, courses c WHERE u.email = 'sofia.ramirez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND course_id = c.id);

INSERT INTO reviews (user_id, course_id, rating, comment, created_at, updated_at)
SELECT u.id, c.id, 3, 'El contenido está bien, pero algunos videos se ven desactualizados. Esperando actualización.', NOW() - INTERVAL '4 days', NOW()
FROM users u, courses c WHERE u.email = 'luis.hernandez@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND course_id = c.id);

-- ═══════════════════════════════════════════════════
-- 9. GAMIFICATION (XP, badges, streaks)
-- ═══════════════════════════════════════════════════

-- Carlos: heavy user
INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '25 days' FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND reason = 'Lección completada' AND created_at > NOW() - INTERVAL '26 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '22 days' FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND created_at BETWEEN NOW() - INTERVAL '23 days' AND NOW() - INTERVAL '21 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '18 days' FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND created_at BETWEEN NOW() - INTERVAL '19 days' AND NOW() - INTERVAL '17 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '15 days' FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND created_at BETWEEN NOW() - INTERVAL '16 days' AND NOW() - INTERVAL '14 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 15, 'Reseña escrita', 'REVIEW', NOW() - INTERVAL '10 days' FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND source_type = 'REVIEW');

INSERT INTO user_badges (user_id, badge_key, badge_name, badge_description, badge_icon, earned_at)
SELECT u.id, 'xp_100', 'Primeros pasos', 'Alcanzaste 100 XP', '⭐', NOW() - INTERVAL '15 days'
FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = u.id AND badge_key = 'xp_100');

INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
SELECT u.id, 5, 12, CURRENT_DATE, NOW()
FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_streaks WHERE user_id = u.id);

INSERT INTO leaderboard_cache (user_id, total_xp, level, rank, period, updated_at)
SELECT u.id, 115, 2, 1, 'all_time', NOW()
FROM users u WHERE u.email = 'carlos.mendez@demo.com' AND NOT EXISTS (SELECT 1 FROM leaderboard_cache WHERE user_id = u.id AND period = 'all_time');

-- María: moderate user
INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '20 days' FROM users u WHERE u.email = 'maria.garcia@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND source_type = 'LESSON_COMPLETE' AND created_at > NOW() - INTERVAL '21 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 25, 'Lección completada', 'LESSON_COMPLETE', NOW() - INTERVAL '17 days' FROM users u WHERE u.email = 'maria.garcia@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND created_at BETWEEN NOW() - INTERVAL '18 days' AND NOW() - INTERVAL '16 days');

INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 15, 'Reseña escrita', 'REVIEW', NOW() - INTERVAL '8 days' FROM users u WHERE u.email = 'maria.garcia@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND source_type = 'REVIEW');

INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
SELECT u.id, 2, 7, CURRENT_DATE - 1, NOW()
FROM users u WHERE u.email = 'maria.garcia@demo.com' AND NOT EXISTS (SELECT 1 FROM user_streaks WHERE user_id = u.id);

INSERT INTO leaderboard_cache (user_id, total_xp, level, rank, period, updated_at)
SELECT u.id, 65, 1, 2, 'all_time', NOW()
FROM users u WHERE u.email = 'maria.garcia@demo.com' AND NOT EXISTS (SELECT 1 FROM leaderboard_cache WHERE user_id = u.id AND period = 'all_time');

-- Pedro
INSERT INTO user_xp (user_id, amount, reason, source_type, created_at)
SELECT u.id, 15, 'Reseña escrita', 'REVIEW', NOW() - INTERVAL '12 days' FROM users u WHERE u.email = 'pedro.lopez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = u.id AND source_type = 'REVIEW');

INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
SELECT u.id, 1, 3, CURRENT_DATE, NOW()
FROM users u WHERE u.email = 'pedro.lopez@demo.com' AND NOT EXISTS (SELECT 1 FROM user_streaks WHERE user_id = u.id);

INSERT INTO leaderboard_cache (user_id, total_xp, level, rank, period, updated_at)
SELECT u.id, 15, 1, 3, 'all_time', NOW()
FROM users u WHERE u.email = 'pedro.lopez@demo.com' AND NOT EXISTS (SELECT 1 FROM leaderboard_cache WHERE user_id = u.id AND period = 'all_time');

-- ═══════════════════════════════════════════════════
-- 10. NOTIFICATIONS (sample)
-- ═══════════════════════════════════════════════════

INSERT INTO notifications (user_id, type, title, message, resource_url, is_read, created_at)
SELECT u.id, 'ENROLLMENT', 'Inscripción confirmada', 'Te has inscrito exitosamente en React desde Cero hasta Experto.', '/course/' || c.id, true, NOW() - INTERVAL '30 days'
FROM users u, courses c WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND type = 'ENROLLMENT' AND resource_url LIKE '%/course/' || c.id);

INSERT INTO notifications (user_id, type, title, message, resource_url, is_read, created_at)
SELECT u.id, 'BADGE_EARNED', '⭐ ¡Nuevo logro desbloqueado!', 'Has ganado el logro "Primeros pasos": Alcanzaste 100 XP', '/profile', false, NOW() - INTERVAL '15 days'
FROM users u WHERE u.email = 'carlos.mendez@demo.com'
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND type = 'BADGE_EARNED');

INSERT INTO notifications (user_id, type, title, message, resource_url, is_read, created_at)
SELECT u.id, 'ENROLLMENT', 'Inscripción confirmada', 'Te has inscrito en Python para Data Science.', '/course/' || c.id, true, NOW() - INTERVAL '20 days'
FROM users u, courses c WHERE u.email = 'carlos.mendez@demo.com' AND c.title = 'Python para Data Science'
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND message LIKE '%Python%');

INSERT INTO notifications (user_id, type, title, message, resource_url, is_read, created_at)
SELECT u.id, 'COURSE_COMPLETED', '¡Felicidades!', 'Has completado el 67% de React desde Cero. ¡Sigue así!', '/profile', false, NOW() - INTERVAL '10 days'
FROM users u WHERE u.email = 'carlos.mendez@demo.com'
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND type = 'COURSE_COMPLETED');

INSERT INTO notifications (user_id, type, title, message, resource_url, is_read, created_at)
SELECT u.id, 'ENROLLMENT', 'Bienvenida al curso', 'Te has inscrito en React desde Cero hasta Experto. ¡Buena suerte!', '/course/' || c.id, false, NOW() - INTERVAL '25 days'
FROM users u, courses c WHERE u.email = 'maria.garcia@demo.com' AND c.title = 'React desde Cero hasta Experto'
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND type = 'ENROLLMENT');

-- ═══════════════════════════════════════════════════
-- 11. USER GROUPS
-- ═══════════════════════════════════════════════════

INSERT INTO user_groups (name, description, created_by, created_at, updated_at)
SELECT 'Bootcamp Cohorte 2026', 'Grupo del bootcamp de desarrollo web Q1 2026',
       (SELECT id FROM users WHERE email = 'admin@lms.com'), NOW() - INTERVAL '30 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE name = 'Bootcamp Cohorte 2026');

INSERT INTO user_groups (name, description, created_by, created_at, updated_at)
SELECT 'Empresa TechCorp', 'Licencia corporativa TechCorp - 5 asientos',
       (SELECT id FROM users WHERE email = 'admin@lms.com'), NOW() - INTERVAL '20 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE name = 'Empresa TechCorp');

-- Add members to Bootcamp group
INSERT INTO user_group_members (group_id, user_id, added_at)
SELECT g.id, u.id, NOW() - INTERVAL '28 days'
FROM user_groups g, users u WHERE g.name = 'Bootcamp Cohorte 2026' AND u.email = 'carlos.mendez@demo.com'
  AND NOT EXISTS (SELECT 1 FROM user_group_members WHERE group_id = g.id AND user_id = u.id);

INSERT INTO user_group_members (group_id, user_id, added_at)
SELECT g.id, u.id, NOW() - INTERVAL '28 days'
FROM user_groups g, users u WHERE g.name = 'Bootcamp Cohorte 2026' AND u.email = 'maria.garcia@demo.com'
  AND NOT EXISTS (SELECT 1 FROM user_group_members WHERE group_id = g.id AND user_id = u.id);

INSERT INTO user_group_members (group_id, user_id, added_at)
SELECT g.id, u.id, NOW() - INTERVAL '28 days'
FROM user_groups g, users u WHERE g.name = 'Bootcamp Cohorte 2026' AND u.email = 'pedro.lopez@demo.com'
  AND NOT EXISTS (SELECT 1 FROM user_group_members WHERE group_id = g.id AND user_id = u.id);

-- Add members to TechCorp group
INSERT INTO user_group_members (group_id, user_id, added_at)
SELECT g.id, u.id, NOW() - INTERVAL '18 days'
FROM user_groups g, users u WHERE g.name = 'Empresa TechCorp' AND u.email = 'ana.martinez@demo.com'
  AND NOT EXISTS (SELECT 1 FROM user_group_members WHERE group_id = g.id AND user_id = u.id);

INSERT INTO user_group_members (group_id, user_id, added_at)
SELECT g.id, u.id, NOW() - INTERVAL '18 days'
FROM user_groups g, users u WHERE g.name = 'Empresa TechCorp' AND u.email = 'diego.torres@demo.com'
  AND NOT EXISTS (SELECT 1 FROM user_group_members WHERE group_id = g.id AND user_id = u.id);

-- End V32
