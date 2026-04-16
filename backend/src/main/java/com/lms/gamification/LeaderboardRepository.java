package com.lms.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LeaderboardRepository extends JpaRepository<LeaderboardEntry, Long> {
    List<LeaderboardEntry> findByPeriodOrderByTotalXpDesc(String period);
    Optional<LeaderboardEntry> findByUserIdAndPeriod(Long userId, String period);
}
