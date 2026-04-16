package com.lms.notifications;

import com.lms.config.FeatureToggleService;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final FeatureToggleService featureToggleService;

    private static final Map<String, String> DISABLED = Map.of("error", "Feature deshabilitada por el administrador");

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_NOTIFICATIONS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_NOTIFICATIONS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_NOTIFICATIONS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_NOTIFICATIONS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        int updated = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}
