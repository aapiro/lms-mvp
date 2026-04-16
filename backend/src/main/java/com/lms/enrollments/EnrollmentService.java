package com.lms.enrollments;

import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final WaitlistRepository waitlistRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public Waitlist joinWaitlist(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (course.getCapacityLimit() == null) {
            throw new IllegalStateException("This course does not have a capacity limit; no waitlist needed");
        }

        boolean alreadyActive = waitlistRepository.existsByUserIdAndCourseIdAndStatusIn(
                userId, courseId,
                List.of(Waitlist.WaitlistStatus.WAITING, Waitlist.WaitlistStatus.NOTIFIED)
        );
        if (alreadyActive) {
            throw new IllegalStateException("User is already on the waitlist for this course");
        }

        int currentCount = waitlistRepository.countByCourseIdAndStatus(courseId, Waitlist.WaitlistStatus.WAITING);

        Waitlist entry = new Waitlist();
        entry.setUserId(userId);
        entry.setCourseId(courseId);
        entry.setPosition(currentCount + 1);
        entry.setStatus(Waitlist.WaitlistStatus.WAITING);
        entry.setJoinedAt(LocalDateTime.now());

        return waitlistRepository.save(entry);
    }

    @Transactional
    public void leaveWaitlist(Long courseId, Long userId) {
        Waitlist entry = waitlistRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException("Waitlist entry not found"));

        if (entry.getStatus() == Waitlist.WaitlistStatus.CANCELLED) {
            throw new IllegalStateException("Already cancelled");
        }

        entry.setStatus(Waitlist.WaitlistStatus.CANCELLED);
        waitlistRepository.save(entry);
    }

    public Integer getWaitlistPosition(Long courseId, Long userId) {
        return waitlistRepository.findByUserIdAndCourseId(userId, courseId)
                .filter(e -> e.getStatus() == Waitlist.WaitlistStatus.WAITING
                          || e.getStatus() == Waitlist.WaitlistStatus.NOTIFIED)
                .map(Waitlist::getPosition)
                .orElse(null);
    }

    public List<Waitlist> getWaitlistForCourse(Long courseId) {
        return waitlistRepository.findByCourseIdAndStatusOrderByPositionAsc(courseId, Waitlist.WaitlistStatus.WAITING);
    }

    @Transactional
    public Waitlist promoteNextInWaitlist(Long courseId) {
        Waitlist next = waitlistRepository
                .findFirstByCourseIdAndStatusOrderByPositionAsc(courseId, Waitlist.WaitlistStatus.WAITING)
                .orElse(null);

        if (next == null) {
            return null;
        }

        next.setStatus(Waitlist.WaitlistStatus.NOTIFIED);
        next.setNotifiedAt(LocalDateTime.now());
        next.setExpiresAt(LocalDateTime.now().plusHours(48));

        return waitlistRepository.save(next);
    }

    @Transactional
    public void checkAndPromote(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (course.getCapacityLimit() == null) {
            return;
        }

        long enrolled = courseRepository.countEnrolled(courseId);
        if (enrolled < course.getCapacityLimit()) {
            promoteNextInWaitlist(courseId);
        }
    }
}
