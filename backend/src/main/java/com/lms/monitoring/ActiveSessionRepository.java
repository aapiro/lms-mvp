package com.lms.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActiveSessionRepository extends JpaRepository<ActiveSession, Long> {

    Optional<ActiveSession> findByTokenHashAndExpiredFalse(String tokenHash);

    @Query("SELECT COUNT(DISTINCT s.userId) FROM ActiveSession s WHERE s.expired = false AND s.lastSeenAt >= :since")
    int countActiveUsers(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM ActiveSession s WHERE s.expired = false AND s.lastSeenAt >= :since")
    int countActiveSessions(@Param("since") LocalDateTime since);

    @Query("SELECT s.deviceType, COUNT(s) FROM ActiveSession s WHERE s.expired = false AND s.lastSeenAt >= :since GROUP BY s.deviceType")
    List<Object[]> countByDevice(@Param("since") LocalDateTime since);

    @Modifying
    @Query("UPDATE ActiveSession s SET s.expired = true WHERE s.lastSeenAt < :cutoff AND s.expired = false")
    int expireOldSessions(@Param("cutoff") LocalDateTime cutoff);
}
