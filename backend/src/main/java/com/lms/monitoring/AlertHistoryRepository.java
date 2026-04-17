package com.lms.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
    List<AlertHistory> findTop50ByOrderByTriggeredAtDesc();
    List<AlertHistory> findByAcknowledgedFalseOrderByTriggeredAtDesc();
}
