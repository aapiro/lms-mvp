package com.lms.payments;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchases")
public class Purchase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "stripe_payment_id")
    private String stripePaymentId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status = PurchaseStatus.PENDING;
    
    @Column(name = "purchased_at", nullable = false, updatable = false)
    private LocalDateTime purchasedAt = LocalDateTime.now();
    
    public enum PurchaseStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
