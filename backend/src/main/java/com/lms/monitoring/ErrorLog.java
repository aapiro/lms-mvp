package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "error_log")
public class ErrorLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "error_type", nullable = false)
    private String errorType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column
    private String endpoint;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private int count = 1;

    @Column(name = "first_seen", nullable = false, updatable = false)
    private LocalDateTime firstSeen = LocalDateTime.now();

    @Column(name = "last_seen", nullable = false)
    private LocalDateTime lastSeen = LocalDateTime.now();
}
