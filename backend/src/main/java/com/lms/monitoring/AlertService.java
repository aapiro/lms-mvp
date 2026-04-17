package com.lms.monitoring;

import com.lms.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRuleRepository ruleRepo;
    private final AlertHistoryRepository historyRepo;
    private final RequestMetricRepository metricRepo;
    private final SecurityEventRepository securityRepo;
    private final NotificationService notificationService;

    /** Check all enabled rules every 5 minutes */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void checkAlerts() {
        List<AlertRule> rules = ruleRepo.findByEnabledTrue();
        for (AlertRule rule : rules) {
            try {
                double currentValue = getMetricValue(rule.getMetric());
                boolean triggered = evaluate(currentValue, rule.getConditionOp(), rule.getThreshold());

                if (triggered) {
                    AlertHistory alert = new AlertHistory();
                    alert.setRuleId(rule.getId());
                    alert.setRuleName(rule.getName());
                    alert.setMetricValue(currentValue);
                    alert.setThreshold(rule.getThreshold());
                    alert.setMessage(String.format("%s: valor actual %.1f (umbral: %.1f)",
                            rule.getName(), currentValue, rule.getThreshold()));
                    historyRepo.save(alert);

                    if (rule.isNotifyAdmin()) {
                        // Notify all admins (user ID 1 as fallback)
                        notificationService.notify(1L, "ALERT",
                                "Alerta: " + rule.getName(),
                                alert.getMessage(),
                                "/admin");
                    }

                    log.warn("ALERT triggered: {} - value={} threshold={}", rule.getName(), currentValue, rule.getThreshold());
                }
            } catch (Exception e) {
                log.error("Error checking alert rule {}: {}", rule.getName(), e.getMessage());
            }
        }
    }

    private double getMetricValue(String metric) {
        LocalDateTime last1h = LocalDateTime.now().minusHours(1);

        return switch (metric) {
            case "error_rate_percent" -> {
                Long total = metricRepo.getTotalRequests(last1h);
                Long errors = metricRepo.getErrorCount(last1h);
                yield (total != null && total > 0) ? ((double)(errors != null ? errors : 0) / total * 100) : 0;
            }
            case "avg_response_ms" -> {
                List<Object[]> stats = metricRepo.getEndpointStats(last1h);
                long totalMs = 0, totalReqs = 0;
                for (Object[] row : stats) {
                    totalMs += ((Number) row[3]).longValue();
                    totalReqs += ((Number) row[2]).longValue();
                }
                yield totalReqs > 0 ? (double) totalMs / totalReqs : 0;
            }
            case "heap_usage_percent" -> {
                MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
                yield (double) mem.getHeapMemoryUsage().getUsed() / mem.getHeapMemoryUsage().getMax() * 100;
            }
            case "failed_logins_1h" -> {
                Long failed = securityRepo.countRateLimited(last1h);
                yield failed != null ? failed.doubleValue() : 0;
            }
            default -> 0;
        };
    }

    private boolean evaluate(double value, String condition, double threshold) {
        return switch (condition) {
            case "GREATER_THAN" -> value > threshold;
            case "LESS_THAN" -> value < threshold;
            default -> false;
        };
    }

    // ── API methods ─────────────────────────────────
    public List<AlertRule> getRules() {
        return ruleRepo.findAll();
    }

    public AlertRule saveRule(AlertRule rule) {
        return ruleRepo.save(rule);
    }

    public void deleteRule(Long id) {
        ruleRepo.deleteById(id);
    }

    public List<AlertHistory> getRecentAlerts() {
        return historyRepo.findTop50ByOrderByTriggeredAtDesc();
    }

    public List<AlertHistory> getUnacknowledgedAlerts() {
        return historyRepo.findByAcknowledgedFalseOrderByTriggeredAtDesc();
    }

    @Transactional
    public void acknowledge(Long alertId) {
        historyRepo.findById(alertId).ifPresent(a -> {
            a.setAcknowledged(true);
            historyRepo.save(a);
        });
    }
}
