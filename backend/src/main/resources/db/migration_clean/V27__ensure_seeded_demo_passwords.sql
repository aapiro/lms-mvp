-- Ensure README/E2E demo credentials match stored BCrypt hashes (idempotent).
-- Heals DBs where passwords were changed manually or seeds diverged.

INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'admin@lms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@lms.com');

UPDATE users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', updated_at = NOW()
WHERE email = 'admin@lms.com';

INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'test@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', 'Test User', 'USER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com');

UPDATE users
SET password = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', updated_at = NOW()
WHERE email = 'test@example.com';
