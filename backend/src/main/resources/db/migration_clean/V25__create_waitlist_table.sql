CREATE TABLE waitlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    position INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notified_at TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);
CREATE INDEX idx_waitlist_course_status ON waitlist(course_id, status);
