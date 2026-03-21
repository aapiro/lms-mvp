package com.lms.assessments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    List<Assessment> findByCourseIdAndAssessmentType(Long courseId, Assessment.AssessmentType type);
    List<Assessment> findByLessonId(Long lessonId);
}
