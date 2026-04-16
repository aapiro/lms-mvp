package com.lms.gamification;

import com.lms.config.FeatureToggleService;
import com.lms.users.User;
import com.lms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final FeatureToggleService featureToggleService;

    private static final Map<String, String> DISABLED = Map.of("error", "Feature deshabilitada por el administrador");

    @GetMapping("/stats")
    public ResponseEntity<?> getMyStats(@AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(gamificationService.getUserStats(user.getId()));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(gamificationService.getUserStats(userId));
    }

    @GetMapping("/xp/recent")
    public ResponseEntity<?> getRecentXp(@AuthenticationPrincipal User user,
                                         @RequestParam(defaultValue = "20") int limit) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(gamificationService.getRecentXp(user.getId(), limit));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(defaultValue = "all_time") String period,
            @RequestParam(defaultValue = "20") int limit) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
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

    @PostMapping("/daily-login")
    public ResponseEntity<?> dailyLogin(@AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        gamificationService.onDailyLogin(user.getId());
        return ResponseEntity.ok(gamificationService.getUserStats(user.getId()));
    }
}
