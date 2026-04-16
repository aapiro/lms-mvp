CREATE TABLE lesson_summaries (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL UNIQUE REFERENCES lessons(id),
    summary TEXT NOT NULL,
    key_concepts TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
