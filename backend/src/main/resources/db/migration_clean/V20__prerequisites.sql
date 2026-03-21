-- Course prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id                     BIGSERIAL PRIMARY KEY,
    course_id              BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (course_id, prerequisite_course_id)
);
CREATE INDEX IF NOT EXISTS idx_prereq_course_id ON course_prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_prereq_prereq_id ON course_prerequisites(prerequisite_course_id);

