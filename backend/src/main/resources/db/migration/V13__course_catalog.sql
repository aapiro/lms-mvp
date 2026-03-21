-- V13__course_catalog.sql
-- Add new columns to courses table and create category/tag tables

-- Add columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(50) NOT NULL DEFAULT 'OPEN';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS capacity_limit INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_template VARCHAR(500);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create course_categories join table
CREATE TABLE IF NOT EXISTS course_categories (
    course_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, category_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE
);

-- Create course_tags join table
CREATE TABLE IF NOT EXISTS course_tags (
    course_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_type ON courses(enrollment_type);
CREATE INDEX IF NOT EXISTS idx_course_categories_category_id ON course_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_course_tags_tag_id ON course_tags(tag_id);

