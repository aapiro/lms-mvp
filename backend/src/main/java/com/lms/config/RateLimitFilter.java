package com.lms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.lms.monitoring.SecurityEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private SecurityEventService securityEventService;

    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final int REGISTER_MAX_ATTEMPTS = 3;
    private static final long WINDOW_MS = 60_000; // 1 minute
    private static final long CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<Long>> requestLog = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        int maxAttempts = resolveMaxAttempts(method, path);
        if (maxAttempts == 0) {
            filterChain.doFilter(request, response);
            return;
        }

        cleanupIfNeeded();

        String ip = resolveClientIp(request);
        String key = ip + ":" + path;
        long now = System.currentTimeMillis();

        CopyOnWriteArrayList<Long> timestamps = requestLog.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());

        // Remove expired entries for this key
        timestamps.removeIf(ts -> now - ts > WINDOW_MS);

        if (timestamps.size() >= maxAttempts) {
            if (securityEventService != null) {
                securityEventService.logRateLimited(ip, path);
            }
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                    Map.of("error", "Too many requests. Please try again later."));
            return;
        }

        timestamps.add(now);
        filterChain.doFilter(request, response);
    }

    private int resolveMaxAttempts(String method, String path) {
        if (!"POST".equalsIgnoreCase(method)) {
            return 0;
        }
        if ("/api/auth/login".equals(path)) {
            return LOGIN_MAX_ATTEMPTS;
        }
        if ("/api/auth/register".equals(path)) {
            return REGISTER_MAX_ATTEMPTS;
        }
        return 0;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
            return;
        }
        lastCleanup = now;
        requestLog.entrySet().removeIf(entry -> {
            entry.getValue().removeIf(ts -> now - ts > WINDOW_MS);
            return entry.getValue().isEmpty();
        });
    }
}
