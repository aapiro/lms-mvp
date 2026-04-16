package com.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class FeatureToggleService {

    private final AppConfigService appConfigService;

    @Value("${ai.tutor.enabled:false}")
    private boolean aiTutorEnvEnabled;

    public static final String KEY_AI_TUTOR = "feature_ai_tutor";
    public static final String KEY_GAMIFICATION = "feature_gamification";
    public static final String KEY_NOTIFICATIONS = "feature_notifications";
    public static final String KEY_REVIEWS = "feature_reviews";
    public static final String KEY_GLOBAL_SEARCH = "feature_global_search";
    public static final String KEY_WAITLIST = "feature_waitlist";

    public FeatureToggleService(AppConfigService appConfigService) {
        this.appConfigService = appConfigService;
    }

    public boolean isEnabled(String featureKey) {
        String val = appConfigService.get(featureKey, "true");
        return Boolean.parseBoolean(val);
    }

    /** AI tutor: admin toggle AND env var must both be true. */
    public boolean isAiTutorEnabled() {
        return isEnabled(KEY_AI_TUTOR) && aiTutorEnvEnabled;
    }

    public Map<String, Boolean> getAllFeatures() {
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("aiTutor", isAiTutorEnabled());
        features.put("gamification", isEnabled(KEY_GAMIFICATION));
        features.put("notifications", isEnabled(KEY_NOTIFICATIONS));
        features.put("reviews", isEnabled(KEY_REVIEWS));
        features.put("globalSearch", isEnabled(KEY_GLOBAL_SEARCH));
        features.put("waitlist", isEnabled(KEY_WAITLIST));
        return features;
    }

    public void setEnabled(String featureKey, boolean enabled) {
        appConfigService.set(featureKey, Boolean.toString(enabled));
    }
}
