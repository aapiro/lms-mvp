package com.lms.monitoring;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityEventService {

    private final SecurityEventRepository repository;

    public void logLoginSuccess(Long userId, String email, String ip, String userAgent) {
        save("LOGIN_SUCCESS", ip, userId, email, userAgent, null, "INFO");
    }

    public void logLoginFailed(String email, String ip, String userAgent) {
        save("LOGIN_FAILED", ip, null, email, userAgent, "Invalid credentials", "WARN");
        log.warn("Failed login attempt for email={} from IP={}", email, ip);
    }

    public void logRateLimited(String ip, String path) {
        save("RATE_LIMITED", ip, null, null, null, "Rate limited on " + path, "WARN");
        log.warn("Rate limited IP={} on path={}", ip, path);
    }

    public void logPasswordReset(Long userId, String email, String ip) {
        save("PASSWORD_RESET", ip, userId, email, null, null, "INFO");
    }

    public void logRoleChanged(Long actorId, Long targetUserId, String newRole) {
        save("ROLE_CHANGED", null, actorId, null, null,
                "User " + targetUserId + " role changed to " + newRole, "WARN");
    }

    public void logSuspicious(String ip, String reason) {
        save("SUSPICIOUS", ip, null, null, null, reason, "CRITICAL");
        log.error("SUSPICIOUS ACTIVITY from IP={}: {}", ip, reason);
    }

    public void logUserDeactivated(Long actorId, Long targetUserId) {
        save("USER_DEACTIVATED", null, actorId, null, null,
                "User " + targetUserId + " deactivated", "WARN");
    }

    private void save(String type, String ip, Long userId, String email, String userAgent, String details, String severity) {
        try {
            SecurityEvent event = new SecurityEvent();
            event.setEventType(type);
            event.setIpAddress(ip);
            event.setUserId(userId);
            event.setEmail(email);
            event.setUserAgent(userAgent);
            event.setDetails(details);
            event.setSeverity(severity);
            repository.save(event);
        } catch (Exception e) {
            log.error("Failed to save security event: {}", type, e);
        }
    }
}
