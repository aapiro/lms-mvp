-- Drip content scheduling on lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS release_after_days INT NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS available_from TIMESTAMP NULL;

-- Assessment type and lesson link
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(20) NOT NULL DEFAULT 'QUIZ'
  CHECK (assessment_type IN ('QUIZ','ASSIGNMENT'));
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS lesson_id BIGINT NULL REFERENCES lessons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_assessments_lesson_id ON assessments(lesson_id);

