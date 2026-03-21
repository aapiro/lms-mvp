-- V17: User Management - expand roles, add profile columns, certificates table

-- New profile columns on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Migrate legacy USER role → STUDENT (preserve ADMIN)
UPDATE users SET role = 'STUDENT' WHERE role = 'USER';

-- Indexes for search/filter
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active    ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at   ON users(created_at DESC);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    course_id   BIGINT NOT NULL,
    issue_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id   ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);

