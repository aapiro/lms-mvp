package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "security_events")
public class SecurityEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // LOGIN_SUCCESS, LOGIN_FAILED, RATE_LIMITED, SUSPICIOUS, PASSWORD_RESET, ROLE_CHANGED

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 255)
    private String email;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, length = 20)
    private String severity = "INFO"; // INFO, WARN, CRITICAL

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
