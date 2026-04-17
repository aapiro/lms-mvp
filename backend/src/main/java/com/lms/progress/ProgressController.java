package com.lms.progress;

import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<Map<String, Integer>> markLessonCompleted(
            @PathVariable Long lessonId,
            @RequestParam Long courseId,
            @AuthenticationPrincipal User user
    ) {
        int percent = progressService.markLessonCompleted(lessonId, courseId, user);
        return ResponseEntity.ok(Map.of("progressPercentage", percent));
    }

    @DeleteMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<Map<String, Integer>> unmarkLessonCompleted(
            @PathVariable Long lessonId,
            @RequestParam Long courseId,
            @AuthenticationPrincipal User user
    ) {
        int percent = progressService.unmarkLessonCompleted(lessonId, courseId, user);
        return ResponseEntity.ok(Map.of("progressPercentage", percent));
    }

    @PutMapping("/lessons/{lessonId}/position")
    public ResponseEntity<?> savePosition(
            @PathVariable Long lessonId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal User user
    ) {
        int seconds = body.getOrDefault("positionSeconds", 0);
        progressService.savePosition(lessonId, user.getId(), seconds);
        return ResponseEntity.ok(Map.of("saved", true));
    }
}
