package com.lms.gamification;

import com.lms.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserXpRepository xpRepo;
    private final UserBadgeRepository badgeRepo;
    private final UserStreakRepository streakRepo;
    private final LeaderboardRepository leaderboardRepo;
    private final NotificationService notificationService;

    // ── XP Constants ────────────────────────────────
    public static final int XP_LESSON_COMPLETE = 25;
    public static final int XP_ASSESSMENT_PASS = 50;
    public static final int XP_COURSE_COMPLETE = 200;
    public static final int XP_REVIEW_WRITTEN = 15;
    public static final int XP_DAILY_LOGIN = 5;
    public static final int XP_STREAK_BONUS_7 = 50;
    public static final int XP_STREAK_BONUS_30 = 200;

    // ── XP per level (cumulative thresholds) ────────
    public static int calculateLevel(long totalXp) {
        if (totalXp < 100) return 1;
        if (totalXp < 300) return 2;
        if (totalXp < 600) return 3;
        if (totalXp < 1000) return 4;
        if (totalXp < 1500) return 5;
        if (totalXp < 2500) return 6;
        if (totalXp < 4000) return 7;
        if (totalXp < 6000) return 8;
        if (totalXp < 9000) return 9;
        return 10;
    }

    public static long xpForNextLevel(int currentLevel) {
        int[] thresholds = {0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000};
        if (currentLevel >= 10) return 9000;
        return thresholds[currentLevel];
    }

    // ── Award XP ────────────────────────────────────
    @Transactional
    public UserXp awardXp(Long userId, int amount, String reason, String sourceType, Long sourceId) {
        // Prevent duplicate XP for the same source
        if (sourceType != null && sourceId != null) {
            if (xpRepo.existsByUserIdAndSourceTypeAndSourceId(userId, sourceType, sourceId)) {
                return null; // Already awarded
            }
        }

        UserXp xp = new UserXp();
        xp.setUserId(userId);
        xp.setAmount(amount);
        xp.setReason(reason);
        xp.setSourceType(sourceType);
        xp.setSourceId(sourceId);
        xp = xpRepo.save(xp);

        // Update leaderboard
        updateLeaderboard(userId);

        // Check for level-up badges
        checkLevelBadges(userId);

        return xp;
    }

    // ── Convenience methods for common XP events ────
    @Transactional
    public void onLessonCompleted(Long userId, Long lessonId) {
        awardXp(userId, XP_LESSON_COMPLETE, "Lección completada", "LESSON_COMPLETE", lessonId);
        updateStreak(userId);
        checkBadges(userId);
    }

    @Transactional
    public void onAssessmentPassed(Long userId, Long assessmentId) {
        awardXp(userId, XP_ASSESSMENT_PASS, "Evaluación aprobada", "ASSESSMENT_PASS", assessmentId);
        checkBadges(userId);
    }

    @Transactional
    public void onCourseCompleted(Long userId, Long courseId) {
        awardXp(userId, XP_COURSE_COMPLETE, "Curso completado", "COURSE_COMPLETE", courseId);
        checkBadges(userId);
    }

    @Transactional
    public void onReviewWritten(Long userId, Long reviewId) {
        awardXp(userId, XP_REVIEW_WRITTEN, "Reseña escrita", "REVIEW", reviewId);
    }

    @Transactional
    public void onDailyLogin(Long userId) {
        // Only once per day
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long todayXp = xpRepo.getXpSince(userId, todayStart);
        if (todayXp == 0) { // First activity today
            awardXp(userId, XP_DAILY_LOGIN, "Acceso diario", "LOGIN", null);
        }
        updateStreak(userId);
    }

    // ── Streaks ─────────────────────────────────────
    @Transactional
    public UserStreak updateStreak(Long userId) {
        UserStreak streak = streakRepo.findByUserId(userId).orElseGet(() -> {
            UserStreak s = new UserStreak();
            s.setUserId(userId);
            return s;
        });

        LocalDate today = LocalDate.now();
        LocalDate lastActivity = streak.getLastActivityDate();

        if (lastActivity == null || lastActivity.isBefore(today.minusDays(1))) {
            // Streak broken or first activity
            streak.setCurrentStreak(1);
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        }
        // If lastActivity == today, streak already counted

        streak.setLastActivityDate(today);
        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }
        streak.setUpdatedAt(LocalDateTime.now());
        streak = streakRepo.save(streak);

        // Streak bonuses
        if (streak.getCurrentStreak() == 7) {
            awardXp(userId, XP_STREAK_BONUS_7, "Racha de 7 días", "STREAK", 7L);
            awardBadge(userId, "streak_7", "Constante", "7 días consecutivos de actividad", "🔥");
        }
        if (streak.getCurrentStreak() == 30) {
            awardXp(userId, XP_STREAK_BONUS_30, "Racha de 30 días", "STREAK", 30L);
            awardBadge(userId, "streak_30", "Imparable", "30 días consecutivos de actividad", "💎");
        }

        return streak;
    }

    // ── Badges ──────────────────────────────────────
    @Transactional
    public UserBadge awardBadge(Long userId, String badgeKey, String name, String description, String icon) {
        if (badgeRepo.existsByUserIdAndBadgeKey(userId, badgeKey)) {
            return null; // Already has badge
        }
        UserBadge badge = new UserBadge();
        badge.setUserId(userId);
        badge.setBadgeKey(badgeKey);
        badge.setBadgeName(name);
        badge.setBadgeDescription(description);
        badge.setBadgeIcon(icon);
        badge = badgeRepo.save(badge);

        // Notify user
        try {
            notificationService.notify(userId, "BADGE_EARNED",
                    icon + " ¡Nuevo logro desbloqueado!",
                    "Has ganado el logro \"" + name + "\": " + description,
                    "/profile");
        } catch (Exception e) {
            log.warn("Failed to notify badge", e);
        }

        return badge;
    }

    private void checkBadges(Long userId) {
        long totalXp = xpRepo.getTotalXp(userId);
        List<UserBadge> badges = badgeRepo.findByUserIdOrderByEarnedAtDesc(userId);
        Set<String> earned = badges.stream().map(UserBadge::getBadgeKey).collect(Collectors.toSet());

        // XP milestones
        if (totalXp >= 100 && !earned.contains("xp_100"))
            awardBadge(userId, "xp_100", "Primeros pasos", "Alcanzaste 100 XP", "⭐");
        if (totalXp >= 500 && !earned.contains("xp_500"))
            awardBadge(userId, "xp_500", "Estudiante dedicado", "Alcanzaste 500 XP", "🌟");
        if (totalXp >= 1000 && !earned.contains("xp_1000"))
            awardBadge(userId, "xp_1000", "Mil puntos", "Alcanzaste 1,000 XP", "🏆");
        if (totalXp >= 5000 && !earned.contains("xp_5000"))
            awardBadge(userId, "xp_5000", "Leyenda", "Alcanzaste 5,000 XP", "👑");
    }

    private void checkLevelBadges(Long userId) {
        long totalXp = xpRepo.getTotalXp(userId);
        int level = calculateLevel(totalXp);
        String key = "level_" + level;
        if (level >= 5 && !badgeRepo.existsByUserIdAndBadgeKey(userId, key)) {
            awardBadge(userId, key, "Nivel " + level, "Alcanzaste el nivel " + level, "🎓");
        }
    }

    // ── Leaderboard ─────────────────────────────────
    @Transactional
    public void updateLeaderboard(Long userId) {
        long totalXp = xpRepo.getTotalXp(userId);
        int level = calculateLevel(totalXp);

        LeaderboardEntry entry = leaderboardRepo.findByUserIdAndPeriod(userId, "all_time")
                .orElseGet(() -> {
                    LeaderboardEntry e = new LeaderboardEntry();
                    e.setUserId(userId);
                    e.setPeriod("all_time");
                    return e;
                });
        entry.setTotalXp(totalXp);
        entry.setLevel(level);
        entry.setUpdatedAt(LocalDateTime.now());
        leaderboardRepo.save(entry);

        // Weekly
        LocalDateTime weekStart = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1).atStartOfDay();
        long weeklyXp = xpRepo.getXpSince(userId, weekStart);
        LeaderboardEntry weekly = leaderboardRepo.findByUserIdAndPeriod(userId, "weekly")
                .orElseGet(() -> {
                    LeaderboardEntry e = new LeaderboardEntry();
                    e.setUserId(userId);
                    e.setPeriod("weekly");
                    return e;
                });
        weekly.setTotalXp(weeklyXp);
        weekly.setLevel(level);
        weekly.setUpdatedAt(LocalDateTime.now());
        leaderboardRepo.save(weekly);
    }

    // ── Read methods ────────────────────────────────
    public Map<String, Object> getUserStats(Long userId) {
        long totalXp = xpRepo.getTotalXp(userId);
        int level = calculateLevel(totalXp);
        long nextLevelXp = xpForNextLevel(level);
        UserStreak streak = streakRepo.findByUserId(userId).orElse(null);
        List<UserBadge> badges = badgeRepo.findByUserIdOrderByEarnedAtDesc(userId);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalXp", totalXp);
        stats.put("level", level);
        stats.put("nextLevelXp", nextLevelXp);
        stats.put("currentStreak", streak != null ? streak.getCurrentStreak() : 0);
        stats.put("longestStreak", streak != null ? streak.getLongestStreak() : 0);
        stats.put("badges", badges);
        stats.put("badgeCount", badges.size());
        return stats;
    }

    public List<Map<String, Object>> getLeaderboard(String period, int limit) {
        List<LeaderboardEntry> entries = leaderboardRepo.findByPeriodOrderByTotalXpDesc(period);
        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (LeaderboardEntry e : entries) {
            if (rank > limit) break;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rank", rank);
            row.put("userId", e.getUserId());
            row.put("totalXp", e.getTotalXp());
            row.put("level", e.getLevel());
            result.add(row);
            rank++;
        }
        return result;
    }

    public List<UserXp> getRecentXp(Long userId, int limit) {
        List<UserXp> all = xpRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return all.stream().limit(limit).collect(Collectors.toList());
    }
}
