-- Modules table (level between course and lessons)
CREATE TABLE IF NOT EXISTS modules (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    module_order INT NOT NULL DEFAULT 1,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);

-- Add module FK to lessons (nullable — lessons without module stay in flat list)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id BIGINT NULL REFERENCES modules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

