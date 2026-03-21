package com.lms.courses;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoursePrerequisiteRepository extends JpaRepository<CoursePrerequisite, Long> {
    List<CoursePrerequisite> findByCourseId(Long courseId);
    void deleteByCourseIdAndPrerequisiteCourseId(Long courseId, Long prereqId);
    boolean existsByCourseIdAndPrerequisiteCourseId(Long courseId, Long prereqId);
}

