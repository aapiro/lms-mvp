package com.lms.enrollments;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    Optional<Waitlist> findByUserIdAndCourseId(Long userId, Long courseId);

    List<Waitlist> findByCourseIdAndStatusOrderByPositionAsc(Long courseId, Waitlist.WaitlistStatus status);

    int countByCourseIdAndStatus(Long courseId, Waitlist.WaitlistStatus status);

    Optional<Waitlist> findFirstByCourseIdAndStatusOrderByPositionAsc(Long courseId, Waitlist.WaitlistStatus status);

    boolean existsByUserIdAndCourseIdAndStatusIn(Long userId, Long courseId, List<Waitlist.WaitlistStatus> statuses);
}
