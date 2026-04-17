package com.lms.monitoring;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionTrackingService {

    private final ActiveSessionRepository sessionRepo;

    @Transactional
    public void trackSession(Long userId, String token, String ip, String userAgent) {
        String tokenHash = hashToken(token);
        Optional<ActiveSession> existing = sessionRepo.findByTokenHashAndExpiredFalse(tokenHash);
        if (existing.isPresent()) {
            ActiveSession session = existing.get();
            session.setLastSeenAt(LocalDateTime.now());
            sessionRepo.save(session);
        } else {
            ActiveSession session = new ActiveSession();
            session.setUserId(userId);
            session.setTokenHash(tokenHash);
            session.setIpAddress(ip);
            session.setUserAgent(userAgent);
            session.setDeviceType(detectDeviceType(userAgent));
            sessionRepo.save(session);
        }
    }

    public int getActiveUserCount() {
        return sessionRepo.countActiveUsers(LocalDateTime.now().minusMinutes(15));
    }

    public int getActiveSessionCount() {
        return sessionRepo.countActiveSessions(LocalDateTime.now().minusMinutes(15));
    }

    public Map<String, Integer> getDeviceBreakdown() {
        List<Object[]> rows = sessionRepo.countByDevice(LocalDateTime.now().minusHours(24));
        Map<String, Integer> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            result.put((String) row[0], ((Number) row[1]).intValue());
        }
        return result;
    }

    @Scheduled(fixedRate = 300_000) // Every 5 minutes
    @Transactional
    public void expireOldSessions() {
        int expired = sessionRepo.expireOldSessions(LocalDateTime.now().minusMinutes(30));
        if (expired > 0) {
            log.debug("Expired {} old sessions", expired);
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.substring(0, Math.min(token.length(), 20)).getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString().substring(0, 64);
        } catch (Exception e) {
            return String.valueOf(token.hashCode());
        }
    }

    private String detectDeviceType(String ua) {
        if (ua == null) return "UNKNOWN";
        ua = ua.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) return "MOBILE";
        if (ua.contains("tablet") || ua.contains("ipad")) return "TABLET";
        return "DESKTOP";
    }
}