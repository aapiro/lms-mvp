-- Course status
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'
  CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'));

-- Enrollment type and settings
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(20) NOT NULL DEFAULT 'OPEN'
  CHECK (enrollment_type IN ('OPEN','INVITE_ONLY','PAID'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS capacity_limit INT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_template VARCHAR(500) NULL;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS course_categories (
    course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS course_tags (
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tag_id    BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_status     ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment ON courses(enrollment_type);
CREATE INDEX IF NOT EXISTS idx_course_cat_cat     ON course_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_course_tags_tag    ON course_tags(tag_id);

