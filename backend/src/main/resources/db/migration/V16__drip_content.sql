-- V16__drip_content.sql
-- Add support for assessments with lesson associations

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(50) DEFAULT 'QUIZ';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS lesson_id BIGINT;

-- Add foreign key for lesson_id
DO $$ BEGIN
    ALTER TABLE assessments ADD CONSTRAINT fk_assessments_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Constraint might already exist
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_assessments_lesson_id ON assessments(lesson_id);

