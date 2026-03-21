package com.lms.lessons;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseIdOrderByLessonOrderAsc(Long courseId);
    void deleteByCourseId(Long courseId);
    List<Lesson> findByModuleIdOrderByLessonOrderAsc(Long moduleId);
    List<Lesson> findByCourseIdAndModuleIdOrderByLessonOrderAsc(Long courseId, Long moduleId);
    List<Lesson> findByCourseIdAndModuleIdIsNullOrderByLessonOrderAsc(Long courseId);
}
