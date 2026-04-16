package com.lms.config;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dev")
@RequiredArgsConstructor
public class DevAdminController {
    private final AppConfigService appConfigService;
    private final FeatureToggleService featureToggleService;

    private static final String KEY_MAINTENANCE = "maintenance_mode";
    private static final String KEY_DEV_PAYMENTS = "dev_payments";

    @GetMapping
    public ResponseEntity<DevConfigDto> get() {
        DevConfigDto dto = new DevConfigDto();
        dto.setMaintenance(Boolean.parseBoolean(appConfigService.get(KEY_MAINTENANCE, "false")));
        dto.setDevPayments(Boolean.parseBoolean(appConfigService.get(KEY_DEV_PAYMENTS, "false")));
        // Feature flags
        dto.setAiTutor(featureToggleService.isEnabled(FeatureToggleService.KEY_AI_TUTOR));
        dto.setGamification(featureToggleService.isEnabled(FeatureToggleService.KEY_GAMIFICATION));
        dto.setNotifications(featureToggleService.isEnabled(FeatureToggleService.KEY_NOTIFICATIONS));
        dto.setReviews(featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS));
        dto.setGlobalSearch(featureToggleService.isEnabled(FeatureToggleService.KEY_GLOBAL_SEARCH));
        dto.setWaitlist(featureToggleService.isEnabled(FeatureToggleService.KEY_WAITLIST));
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<DevConfigDto> set(@RequestBody DevConfigDto dto) {
        appConfigService.set(KEY_MAINTENANCE, Boolean.toString(dto.isMaintenance()));
        appConfigService.set(KEY_DEV_PAYMENTS, Boolean.toString(dto.isDevPayments()));
        // Feature flags
        featureToggleService.setEnabled(FeatureToggleService.KEY_AI_TUTOR, dto.isAiTutor());
        featureToggleService.setEnabled(FeatureToggleService.KEY_GAMIFICATION, dto.isGamification());
        featureToggleService.setEnabled(FeatureToggleService.KEY_NOTIFICATIONS, dto.isNotifications());
        featureToggleService.setEnabled(FeatureToggleService.KEY_REVIEWS, dto.isReviews());
        featureToggleService.setEnabled(FeatureToggleService.KEY_GLOBAL_SEARCH, dto.isGlobalSearch());
        featureToggleService.setEnabled(FeatureToggleService.KEY_WAITLIST, dto.isWaitlist());
        return get();
    }

    @Data
    public static class DevConfigDto {
        private boolean maintenance;
        private boolean devPayments;
        // Feature flags
        private boolean aiTutor;
        private boolean gamification;
        private boolean notifications;
        private boolean reviews;
        private boolean globalSearch;
        private boolean waitlist;
    }
}
