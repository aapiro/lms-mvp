-- Insert a normal test user if not exists
-- Password: Password123 (BCrypt)
-- NOTE: If you prefer, you can register via the API instead (see README)

INSERT INTO users (email, password, full_name, role, created_at, updated_at)
SELECT 'test@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG', 'Test User', 'USER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com');
