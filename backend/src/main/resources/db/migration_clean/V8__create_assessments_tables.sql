-- V8__create_assessments_tables.sql

-- Assessments table
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    duration_minutes INTEGER,
    total_points INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('MULTIPLE_CHOICE', 'OPEN_ENDED')),
    options TEXT,
    correct_answer TEXT,
    points INTEGER NOT NULL
);

-- Submissions table
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    submitted_at TIMESTAMP,
    answers TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED')),
    score INTEGER
);

-- Grades table
CREATE TABLE grades (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    graded_by VARCHAR(255) NOT NULL,
    graded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_assessments_course_id ON assessments(course_id);
CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX idx_submissions_assessment_id ON submissions(assessment_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_grades_submission_id ON grades(submission_id);
CREATE INDEX idx_grades_question_id ON grades(question_id);

