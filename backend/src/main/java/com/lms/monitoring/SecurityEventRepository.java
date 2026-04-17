package com.lms.monitoring;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {

    List<SecurityEvent> findByEventTypeOrderByCreatedAtDesc(String eventType, Pageable pageable);

    @Query("SELECT s FROM SecurityEvent s WHERE s.createdAt >= :since ORDER BY s.createdAt DESC")
    List<SecurityEvent> findRecent(@Param("since") LocalDateTime since);

    @Query("SELECT s.eventType, COUNT(s) FROM SecurityEvent s WHERE s.createdAt >= :since GROUP BY s.eventType")
    List<Object[]> countByType(@Param("since") LocalDateTime since);

    @Query("SELECT s.ipAddress, COUNT(s) FROM SecurityEvent s WHERE s.eventType = 'LOGIN_FAILED' AND s.createdAt >= :since GROUP BY s.ipAddress ORDER BY COUNT(s) DESC")
    List<Object[]> getTopFailedLoginIps(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(s) FROM SecurityEvent s WHERE s.eventType = 'RATE_LIMITED' AND s.createdAt >= :since")
    Long countRateLimited(@Param("since") LocalDateTime since);
}
