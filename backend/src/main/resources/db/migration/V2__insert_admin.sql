-- Insert default admin user
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (email, password, full_name, role) 
VALUES ('admin@lms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN');
