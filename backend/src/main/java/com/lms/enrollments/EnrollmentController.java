package com.lms.enrollments;

import com.lms.config.FeatureToggleService;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final FeatureToggleService featureToggleService;

    private static final Map<String, String> DISABLED = Map.of("error", "Feature deshabilitada por el administrador");

    @PostMapping("/api/courses/{courseId}/waitlist")
    public ResponseEntity<?> joinWaitlist(@PathVariable Long courseId,
                                          @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_WAITLIST))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        Waitlist entry = enrollmentService.joinWaitlist(courseId, user.getId());
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/api/courses/{courseId}/waitlist")
    public ResponseEntity<?> leaveWaitlist(@PathVariable Long courseId,
                                           @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_WAITLIST))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        enrollmentService.leaveWaitlist(courseId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/courses/{courseId}/waitlist/position")
    public ResponseEntity<?> getWaitlistPosition(@PathVariable Long courseId,
                                                  @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_WAITLIST))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        Integer position = enrollmentService.getWaitlistPosition(courseId, user.getId());
        return ResponseEntity.ok(Map.of(
                "courseId", courseId,
                "position", position != null ? position : -1,
                "onWaitlist", position != null
        ));
    }

    @GetMapping("/api/admin/courses/{courseId}/waitlist")
    public ResponseEntity<?> getWaitlistForCourse(@PathVariable Long courseId) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_WAITLIST))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(enrollmentService.getWaitlistForCourse(courseId));
    }
}
