package com.lms.monitoring;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alert_history")
public class AlertHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "metric_value", nullable = false)
    private double metricValue;

    @Column(nullable = false)
    private double threshold;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private boolean acknowledged = false;

    @Column(name = "triggered_at", nullable = false, updatable = false)
    private LocalDateTime triggeredAt = LocalDateTime.now();
}
