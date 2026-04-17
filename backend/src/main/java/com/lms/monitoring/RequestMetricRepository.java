package com.lms.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface RequestMetricRepository extends JpaRepository<RequestMetric, Long> {

    @Query("SELECT r FROM RequestMetric r WHERE r.periodStart >= :since ORDER BY r.periodStart DESC")
    List<RequestMetric> findSince(@Param("since") LocalDateTime since);

    @Query("SELECT r.endpoint, r.method, " +
           "SUM(r.count) as totalRequests, " +
           "SUM(r.totalDurationMs) as totalMs, " +
           "MAX(r.maxDurationMs) as maxMs " +
           "FROM RequestMetric r WHERE r.periodStart >= :since " +
           "GROUP BY r.endpoint, r.method ORDER BY SUM(r.count) DESC")
    List<Object[]> getEndpointStats(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(r.count) FROM RequestMetric r WHERE r.periodStart >= :since")
    Long getTotalRequests(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(r.count) FROM RequestMetric r WHERE r.periodStart >= :since AND r.statusCode >= 500")
    Long getErrorCount(@Param("since") LocalDateTime since);
}