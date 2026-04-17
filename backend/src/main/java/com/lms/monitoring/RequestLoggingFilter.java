package com.lms.monitoring;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final RequestMetricRepository metricRepo;
    private final ErrorLogRepository errorLogRepo;

    // In-memory aggregation buffer (flush to DB periodically)
    private final ConcurrentHashMap<String, MetricBucket> buffer = new ConcurrentHashMap<>();
    private final AtomicLong lastFlush = new AtomicLong(System.currentTimeMillis());
    private static final long FLUSH_INTERVAL_MS = 60_000; // 1 minute

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Skip actuator and static resources
        String path = request.getRequestURI();
        if (path.startsWith("/actuator") || path.contains(".")) {
            chain.doFilter(request, response);
            return;
        }

        // Correlation ID
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }
        response.setHeader("X-Correlation-Id", correlationId);

        long startTime = System.currentTimeMillis();

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            String method = request.getMethod();

            // Normalize endpoint (replace IDs with {id})
            String endpoint = normalizeEndpoint(path);

            // Log to console (structured)
            log.info("[{}] {} {} {} {}ms", correlationId, method, path, status, duration);

            // Aggregate in buffer
            String key = endpoint + "|" + method + "|" + status;
            buffer.compute(key, (k, bucket) -> {
                if (bucket == null) bucket = new MetricBucket(endpoint, method, status);
                bucket.add(duration);
                return bucket;
            });

            // Track errors
            if (status >= 500) {
                trackError(endpoint, status, duration);
            }

            // Periodic flush
            if (System.currentTimeMillis() - lastFlush.get() > FLUSH_INTERVAL_MS) {
                flushMetrics();
            }
        }
    }

    private void trackError(String endpoint, int status, long duration) {
        try {
            ErrorLog err = new ErrorLog();
            err.setErrorType("HTTP_" + status);
            err.setMessage("Server error on " + endpoint);
            err.setEndpoint(endpoint);
            errorLogRepo.save(err);
        } catch (Exception e) {
            // Don't fail the request for monitoring errors
        }
    }

    private synchronized void flushMetrics() {
        if (System.currentTimeMillis() - lastFlush.get() < FLUSH_INTERVAL_MS) return;

        LocalDateTime periodStart = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
        buffer.forEach((key, bucket) -> {
            try {
                RequestMetric metric = new RequestMetric();
                metric.setEndpoint(bucket.endpoint);
                metric.setMethod(bucket.method);
                metric.setStatusCode(bucket.statusCode);
                metric.setCount(bucket.count);
                metric.setTotalDurationMs(bucket.totalMs);
                metric.setMaxDurationMs((int) bucket.maxMs);
                metric.setMinDurationMs((int) bucket.minMs);
                metric.setPeriodStart(periodStart);
                metricRepo.save(metric);
            } catch (Exception e) {
                log.warn("Failed to flush metric: {}", key);
            }
        });
        buffer.clear();
        lastFlush.set(System.currentTimeMillis());
    }

    private String normalizeEndpoint(String path) {
        return path.replaceAll("/\\d+", "/{id}");
    }

    private static class MetricBucket {
        final String endpoint;
        final String method;
        final int statusCode;
        int count = 0;
        long totalMs = 0;
        long maxMs = 0;
        long minMs = Long.MAX_VALUE;

        MetricBucket(String endpoint, String method, int statusCode) {
            this.endpoint = endpoint;
            this.method = method;
            this.statusCode = statusCode;
        }

        void add(long durationMs) {
            count++;
            totalMs += durationMs;
            if (durationMs > maxMs) maxMs = durationMs;
            if (durationMs < minMs) minMs = durationMs;
        }
    }
}
