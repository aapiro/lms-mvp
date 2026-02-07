package com.lms.progress;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.courses.CourseRepository;
import com.lms.courses.Course;
import com.lms.lessons.LessonRepository;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {
    
    private final ProgressRepository progressRepository;
    private final PurchaseRepository purchaseRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public int markLessonCompleted(Long lessonId, Long courseId, User user) {
        if (user == null) {
            throw new RuntimeException("Authentication required");
        }

        // Validate course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isFree = course.getPrice() != null && course.getPrice().compareTo(java.math.BigDecimal.ZERO) == 0;

        if (!isFree) {
            boolean hasPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                    user.getId(), courseId, Purchase.PurchaseStatus.COMPLETED);
            if (!hasPurchased) {
                throw new RuntimeException("You must purchase this course");
            }
        }

        Progress progress = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> {
                    Progress newProgress = new Progress();
                    newProgress.setUserId(user.getId());
                    newProgress.setLessonId(lessonId);
                    return newProgress;
                });

        if (progress.getCompleted() == null || !progress.getCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);
        }

        // Recalculate progress percentage
        List<com.lms.lessons.Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        if (lessons.isEmpty()) return 0;

        List<Progress> progressList = progressRepository.findByUserIdAndCourseId(user.getId(), courseId);
        long completedCount = progressList.stream().filter(p -> Boolean.TRUE.equals(p.getCompleted())).count();

        return (int) ((completedCount * 100) / lessons.size());
    }
}
