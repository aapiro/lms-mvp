-- V14__modules.sql
-- Create modules table and add module support to lessons

CREATE TABLE IF NOT EXISTS modules (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Add module_id to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id BIGINT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS release_after_days INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS available_from TIMESTAMP;

-- Add foreign key constraint if not exists
DO $$ BEGIN
    ALTER TABLE lessons ADD CONSTRAINT fk_lessons_module_id FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Constraint might already exist
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

