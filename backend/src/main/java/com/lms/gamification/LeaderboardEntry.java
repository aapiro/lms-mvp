package com.lms.gamification;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leaderboard_cache")
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "total_xp", nullable = false)
    private long totalXp = 0;

    @Column(nullable = false)
    private int level = 1;

    @Column
    private Integer rank;

    @Column(nullable = false, length = 20)
    private String period = "all_time";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
