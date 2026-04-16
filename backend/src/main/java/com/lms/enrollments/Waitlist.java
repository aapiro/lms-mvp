package com.lms.enrollments;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "waitlist")
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public enum WaitlistStatus {
        WAITING, NOTIFIED, ENROLLED, EXPIRED, CANCELLED
    }
}
