package com.lms.courses;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findAllByOrderByCreatedAtDesc();
    List<Course> findByCreatedBy(Long createdBy);
    List<Course> findByStatusOrderByCreatedAtDesc(Course.CourseStatus status);
    List<Course> findByStatus(Course.CourseStatus status);

    @Query("SELECT c FROM Course c JOIN c.categories cat WHERE cat.slug = :slug")
    List<Course> findByCategorySlug(@Param("slug") String slug);

    @Query("SELECT c FROM Course c JOIN c.tags t WHERE t.slug = :slug")
    List<Course> findByTagSlug(@Param("slug") String slug);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.courseId = :courseId AND p.status = 'COMPLETED'")
    long countEnrolled(@Param("courseId") Long courseId);
}
