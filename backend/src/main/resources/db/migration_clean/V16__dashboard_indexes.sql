-- V16: Índices para optimizar queries del dashboard ampliado
CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON progress(user_id, lesson_id) WHERE completed = true;
CREATE INDEX IF NOT EXISTS idx_progress_updated_at ON progress(updated_at);

