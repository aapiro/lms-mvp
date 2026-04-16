package com.lms.gamification;

import com.lms.users.User;
import com.lms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    /** Current user's stats (XP, level, streak, badges) */
    @GetMapping("/stats")
    public ResponseEntity<?> getMyStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(gamificationService.getUserStats(user.getId()));
    }

    /** Any user's stats (public for leaderboard profile) */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getUserStats(userId));
    }

    /** Current user's recent XP activity */
    @GetMapping("/xp/recent")
    public ResponseEntity<?> getRecentXp(@AuthenticationPrincipal User user,
                                         @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(gamificationService.getRecentXp(user.getId(), limit));
    }

    /** Leaderboard */
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(defaultValue = "all_time") String period,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> entries = gamificationService.getLeaderboard(period, limit);
        // Enrich with user names
        for (Map<String, Object> entry : entries) {
            Long userId = (Long) entry.get("userId");
            userRepository.findById(userId).ifPresent(u -> {
                entry.put("fullName", u.getFullName());
                entry.put("avatarUrl", u.getAvatarUrl());
            });
        }
        return ResponseEntity.ok(entries);
    }

    /** Record daily login (called by frontend on app load) */
    @PostMapping("/daily-login")
    public ResponseEntity<?> dailyLogin(@AuthenticationPrincipal User user) {
        gamificationService.onDailyLogin(user.getId());
        return ResponseEntity.ok(gamificationService.getUserStats(user.getId()));
    }
}
