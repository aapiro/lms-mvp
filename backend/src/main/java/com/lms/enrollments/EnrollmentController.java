package com.lms.enrollments;

import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/api/courses/{courseId}/waitlist")
    public ResponseEntity<Waitlist> joinWaitlist(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        Waitlist entry = enrollmentService.joinWaitlist(courseId, user.getId());
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/api/courses/{courseId}/waitlist")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        enrollmentService.leaveWaitlist(courseId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/courses/{courseId}/waitlist/position")
    public ResponseEntity<Map<String, Object>> getWaitlistPosition(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        Integer position = enrollmentService.getWaitlistPosition(courseId, user.getId());
        return ResponseEntity.ok(Map.of(
                "courseId", courseId,
                "position", position != null ? position : -1,
                "onWaitlist", position != null
        ));
    }

    @GetMapping("/api/admin/courses/{courseId}/waitlist")
    public ResponseEntity<List<Waitlist>> getWaitlistForCourse(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(enrollmentService.getWaitlistForCourse(courseId));
    }
}
