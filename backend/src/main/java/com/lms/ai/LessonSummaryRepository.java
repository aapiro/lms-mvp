package com.lms.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LessonSummaryRepository extends JpaRepository<LessonSummary, Long> {
    Optional<LessonSummary> findByLessonId(Long lessonId);
}
