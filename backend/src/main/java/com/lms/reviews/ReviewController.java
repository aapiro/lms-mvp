package com.lms.reviews;

import com.lms.config.FeatureToggleService;
import com.lms.users.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final FeatureToggleService featureToggleService;

    private static final Map<String, String> DISABLED = Map.of("error", "Feature deshabilitada por el administrador");

    @GetMapping("/api/courses/{courseId}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long courseId) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(reviewService.getReviewsForCourse(courseId));
    }

    @GetMapping("/api/courses/{courseId}/rating")
    public ResponseEntity<?> getRating(@PathVariable Long courseId) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        return ResponseEntity.ok(reviewService.getCourseRating(courseId));
    }

    @PostMapping("/api/courses/{courseId}/reviews")
    public ResponseEntity<?> createReview(@PathVariable Long courseId,
                                          @RequestBody CreateReviewRequest req,
                                          @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        try {
            Review review = reviewService.createReview(user.getId(), courseId, req.getRating(), req.getComment());
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/courses/{courseId}/reviews")
    public ResponseEntity<?> updateReview(@PathVariable Long courseId,
                                          @RequestBody CreateReviewRequest req,
                                          @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        try {
            Review review = reviewService.updateReview(user.getId(), courseId, req.getRating(), req.getComment());
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (!featureToggleService.isEnabled(FeatureToggleService.KEY_REVIEWS))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        try {
            reviewService.deleteReview(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/reviews/{id}")
    public ResponseEntity<?> adminDeleteReview(@PathVariable Long id) {
        reviewService.adminDeleteReview(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @Data
    static class CreateReviewRequest {
        private int rating;
        private String comment;
    }
}
