package com.lms.gamification;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_badges")
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "badge_key", nullable = false, length = 100)
    private String badgeKey;

    @Column(name = "badge_name", nullable = false)
    private String badgeName;

    @Column(name = "badge_description", columnDefinition = "TEXT")
    private String badgeDescription;

    @Column(name = "badge_icon", length = 10)
    private String badgeIcon;

    @Column(name = "earned_at", nullable = false, updatable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();
}
