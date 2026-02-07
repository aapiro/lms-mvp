package com.lms.payments;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Optional<Purchase> findByUserIdAndCourseId(Long userId, Long courseId);
    List<Purchase> findByUserIdAndStatus(Long userId, Purchase.PurchaseStatus status);
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, Purchase.PurchaseStatus status);
}
