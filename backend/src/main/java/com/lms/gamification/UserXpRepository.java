package com.lms.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface UserXpRepository extends JpaRepository<UserXp, Long> {

    List<UserXp> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(x.amount), 0) FROM UserXp x WHERE x.userId = :userId")
    long getTotalXp(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(x.amount), 0) FROM UserXp x WHERE x.userId = :userId AND x.createdAt >= :since")
    long getXpSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    boolean existsByUserIdAndSourceTypeAndSourceId(Long userId, String sourceType, Long sourceId);
}
