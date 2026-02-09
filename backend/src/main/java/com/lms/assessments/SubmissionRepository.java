package com.lms.assessments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByAssessmentIdAndUserId(Long assessmentId, Long userId);
}
