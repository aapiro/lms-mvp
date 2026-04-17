package com.lms.monitoring;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final SystemHealthService healthService;
    private final SecurityEventService securityEventService;
    private final SessionTrackingService sessionService;
    private final SecurityEventRepository securityEventRepo;
    private final ErrorLogRepository errorLogRepo;

    /** Full system health: JVM, DB, services, uptime */
    @GetMapping("/health")
    public ResponseEntity<?> getSystemHealth() {
        return ResponseEntity.ok(healthService.getFullSystemHealth());
    }

    /** JVM metrics only */
    @GetMapping("/jvm")
    public ResponseEntity<?> getJvmMetrics() {
        return ResponseEntity.ok(healthService.getJvmMetrics());
    }

    /** API performance: requests, errors, endpoint stats */
    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance() {
        return ResponseEntity.ok(healthService.getPerformanceOverview());
    }

    /** Security overview: events, rate limits, failed logins */
    @GetMapping("/security")
    public ResponseEntity<?> getSecurityOverview() {
        return ResponseEntity.ok(healthService.getSecurityOverview());
    }

    /** Active sessions: users online, devices */
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessionOverview() {
        return ResponseEntity.ok(healthService.getSessionOverview());
    }

    /** Recent security events (paginated) */
    @GetMapping("/security/events")
    public ResponseEntity<?> getSecurityEvents(
            @RequestParam(defaultValue = "24") int hours,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(
                securityEventRepo.findRecent(LocalDateTime.now().minusHours(hours))
                        .stream().limit(limit).toList());
    }

    /** Recent errors */
    @GetMapping("/errors")
    public ResponseEntity<?> getRecentErrors() {
        return ResponseEntity.ok(errorLogRepo.findTop50ByOrderByLastSeenDesc());
    }

    /** Complete monitoring dashboard (single call) */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getMonitoringDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("system", healthService.getFullSystemHealth());
        dashboard.put("performance", healthService.getPerformanceOverview());
        dashboard.put("security", healthService.getSecurityOverview());
        dashboard.put("sessions", healthService.getSessionOverview());
        dashboard.put("recentErrors", errorLogRepo.findTop50ByOrderByLastSeenDesc().stream().limit(10).toList());
        return ResponseEntity.ok(dashboard);
    }
}