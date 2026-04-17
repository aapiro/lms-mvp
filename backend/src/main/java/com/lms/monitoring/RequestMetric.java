package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "request_metrics")
public class RequestMetric {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String endpoint;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(name = "status_code", nullable = false)
    private int statusCode;

    @Column(nullable = false)
    private int count = 1;

    @Column(name = "total_duration_ms", nullable = false)
    private long totalDurationMs;

    @Column(name = "max_duration_ms", nullable = false)
    private int maxDurationMs;

    @Column(name = "min_duration_ms", nullable = false)
    private int minDurationMs;

    @Column(name = "period_start", nullable = false)
    private LocalDateTime periodStart;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
