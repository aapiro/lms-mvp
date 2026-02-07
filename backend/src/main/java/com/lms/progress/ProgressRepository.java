package com.lms.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<Progress> findByUserId(Long userId);
    
    @Query("SELECT p FROM Progress p WHERE p.userId = :userId AND p.lessonId IN " +
           "(SELECT l.id FROM Lesson l WHERE l.courseId = :courseId)")
    List<Progress> findByUserIdAndCourseId(Long userId, Long courseId);
}
