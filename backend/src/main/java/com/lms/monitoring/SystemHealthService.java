package com.lms.monitoring;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemHealthService {

    private final DataSource dataSource;
    private final RequestMetricRepository metricRepo;
    private final SecurityEventRepository securityRepo;
    private final ActiveSessionRepository sessionRepo;
    private final ErrorLogRepository errorRepo;

    @Value("${minio.endpoint:}")
    private String minioEndpoint;

    public Map<String, Object> getFullSystemHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("timestamp", LocalDateTime.now());
        health.put("jvm", getJvmMetrics());
        health.put("database", getDatabaseHealth());
        health.put("services", getServiceDependencies());
        health.put("uptime", getUptime());
        return health;
    }

    public Map<String, Object> getJvmMetrics() {
        Runtime runtime = Runtime.getRuntime();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

        Map<String, Object> jvm = new LinkedHashMap<>();
        jvm.put("heapUsedMb", memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024));
        jvm.put("heapMaxMb", memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024));
        jvm.put("heapUsagePercent", Math.round(
                (double) memoryBean.getHeapMemoryUsage().getUsed() / memoryBean.getHeapMemoryUsage().getMax() * 100));
        jvm.put("nonHeapUsedMb", memoryBean.getNonHeapMemoryUsage().getUsed() / (1024 * 1024));
        jvm.put("availableProcessors", runtime.availableProcessors());
        jvm.put("threadCount", ManagementFactory.getThreadMXBean().getThreadCount());
        jvm.put("peakThreadCount", ManagementFactory.getThreadMXBean().getPeakThreadCount());
        jvm.put("freeMemoryMb", runtime.freeMemory() / (1024 * 1024));
        return jvm;
    }

    public Map<String, Object> getDatabaseHealth() {
        Map<String, Object> db = new LinkedHashMap<>();
        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            db.put("status", "UP");
            db.put("responseTimeMs", System.currentTimeMillis() - start);
        } catch (Exception e) {
            db.put("status", "DOWN");
            db.put("error", e.getMessage());
            db.put("responseTimeMs", System.currentTimeMillis() - start);
        }
        return db;
    }

    public Map<String, Object> getServiceDependencies() {
        Map<String, Object> services = new LinkedHashMap<>();

        // PostgreSQL
        services.put("postgresql", getDatabaseHealth().get("status"));

        // MinIO
        try {
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection)
                    new java.net.URL(minioEndpoint + "/minio/health/live").openConnection();
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            services.put("minio", conn.getResponseCode() == 200 ? "UP" : "DOWN");
        } catch (Exception e) {
            services.put("minio", "DOWN");
        }

        return services;
    }

    public Map<String, Object> getUptime() {
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        long uptimeMs = runtimeBean.getUptime();
        Duration duration = Duration.ofMillis(uptimeMs);

        Map<String, Object> uptime = new LinkedHashMap<>();
        uptime.put("days", duration.toDays());
        uptime.put("hours", duration.toHours() % 24);
        uptime.put("minutes", duration.toMinutes() % 60);
        uptime.put("startTime", new Date(runtimeBean.getStartTime()));
        return uptime;
    }

    public Map<String, Object> getPerformanceOverview() {
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        LocalDateTime last1h = LocalDateTime.now().minusHours(1);

        Map<String, Object> perf = new LinkedHashMap<>();

        Long totalReqs24h = metricRepo.getTotalRequests(last24h);
        Long errors24h = metricRepo.getErrorCount(last24h);
        perf.put("totalRequests24h", totalReqs24h != null ? totalReqs24h : 0);
        perf.put("errors24h", errors24h != null ? errors24h : 0);
        perf.put("errorRate24h", totalReqs24h != null && totalReqs24h > 0
                ? Math.round((double) (errors24h != null ? errors24h : 0) / totalReqs24h * 10000) / 100.0 : 0);

        // Top endpoints by request count
        List<Object[]> endpointStats = metricRepo.getEndpointStats(last1h);
        List<Map<String, Object>> endpoints = new ArrayList<>();
        for (Object[] row : endpointStats) {
            Map<String, Object> ep = new LinkedHashMap<>();
            ep.put("endpoint", row[0]);
            ep.put("method", row[1]);
            ep.put("requests", ((Number) row[2]).longValue());
            long totalMs = ((Number) row[3]).longValue();
            long count = ((Number) row[2]).longValue();
            ep.put("avgMs", count > 0 ? totalMs / count : 0);
            ep.put("maxMs", ((Number) row[4]).intValue());
            endpoints.add(ep);
        }
        perf.put("endpoints", endpoints);

        return perf;
    }

    public Map<String, Object> getSecurityOverview() {
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);

        Map<String, Object> security = new LinkedHashMap<>();

        List<Object[]> eventCounts = securityRepo.countByType(last24h);
        Map<String, Long> byType = new LinkedHashMap<>();
        for (Object[] row : eventCounts) {
            byType.put((String) row[0], ((Number) row[1]).longValue());
        }
        security.put("events24h", byType);

        Long rateLimited = securityRepo.countRateLimited(last24h);
        security.put("rateLimited24h", rateLimited != null ? rateLimited : 0);

        List<Object[]> topIps = securityRepo.getTopFailedLoginIps(last24h,
                org.springframework.data.domain.PageRequest.of(0, 5));
        List<Map<String, Object>> failedIps = new ArrayList<>();
        for (Object[] row : topIps) {
            failedIps.add(Map.of("ip", row[0], "attempts", ((Number) row[1]).longValue()));
        }
        security.put("topFailedLoginIps", failedIps);

        return security;
    }

    public Map<String, Object> getSessionOverview() {
        Map<String, Object> sessions = new LinkedHashMap<>();
        sessions.put("activeUsers", sessionRepo.countActiveUsers(LocalDateTime.now().minusMinutes(15)));
        sessions.put("activeSessions", sessionRepo.countActiveSessions(LocalDateTime.now().minusMinutes(15)));

        List<Object[]> devices = sessionRepo.countByDevice(LocalDateTime.now().minusHours(24));
        Map<String, Integer> deviceMap = new LinkedHashMap<>();
        for (Object[] row : devices) {
            deviceMap.put(row[0] != null ? (String) row[0] : "UNKNOWN", ((Number) row[1]).intValue());
        }
        sessions.put("deviceBreakdown", deviceMap);

        return sessions;
    }
}
