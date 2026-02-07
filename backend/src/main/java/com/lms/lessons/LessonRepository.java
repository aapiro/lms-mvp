package com.lms.lessons;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseIdOrderByLessonOrderAsc(Long courseId);
    void deleteByCourseId(Long courseId);
}
