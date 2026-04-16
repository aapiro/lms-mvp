package com.lms.reviews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<Review> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.courseId = :courseId")
    Double getAverageRating(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.courseId = :courseId")
    int getReviewCount(@Param("courseId") Long courseId);
}
