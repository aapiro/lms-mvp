package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "active_sessions")
public class ActiveSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "device_type", length = 20)
    private String deviceType; // DESKTOP, MOBILE, TABLET

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean expired = false;
}