package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alert_rules")
public class AlertRule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String metric; // error_rate_percent, avg_response_ms, heap_usage_percent, failed_logins_1h

    @Column(name = "condition", nullable = false, length = 20)
    private String conditionOp; // GREATER_THAN, LESS_THAN

    @Column(nullable = false)
    private double threshold;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "notify_admin", nullable = false)
    private boolean notifyAdmin = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
