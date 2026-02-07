package com.lms.progress;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProgressService {
    
    private final ProgressRepository progressRepository;
    private final PurchaseRepository purchaseRepository;
    
    @Transactional
    public void markLessonCompleted(Long lessonId, Long courseId, User user) {
        // Verificar que el usuario compró el curso
        boolean hasPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                user.getId(), courseId, Purchase.PurchaseStatus.COMPLETED);
        
        if (!hasPurchased) {
            throw new RuntimeException("You must purchase this course");
        }
        
        Progress progress = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> {
                    Progress newProgress = new Progress();
                    newProgress.setUserId(user.getId());
                    newProgress.setLessonId(lessonId);
                    return newProgress;
                });
        
        if (!progress.getCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);
        }
    }
}
