package com.lms.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {

    List<ErrorLog> findTop50ByOrderByLastSeenDesc();

    @Query("SELECT SUM(e.count) FROM ErrorLog e WHERE e.lastSeen >= :since")
    Long countErrorsSince(@Param("since") LocalDateTime since);

    @Query("SELECT e FROM ErrorLog e WHERE e.lastSeen >= :since ORDER BY e.count DESC")
    List<ErrorLog> getTopErrors(@Param("since") LocalDateTime since);
}
