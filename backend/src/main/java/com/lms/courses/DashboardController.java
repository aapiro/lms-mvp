package com.lms.courses;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PurchaseRepository purchaseRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal User user) {
        // Courses in progress
        List<Purchase> purchases = purchaseRepository.findByUserIdAndStatus(
                user.getId(), Purchase.PurchaseStatus.COMPLETED);

        List<Map<String, Object>> enrolledCourses = new ArrayList<>();
        for (Purchase p : purchases) {
            courseRepository.findById(p.getCourseId()).ifPresent(course -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("courseId", course.getId());
                entry.put("title", course.getTitle());
                entry.put("description", course.getDescription());
                entry.put("purchasedAt", p.getPurchasedAt());
                enrolledCourses.add(entry);
            });
        }

        // Suggested courses (published, not purchased)
        Set<Long> ownedIds = purchases.stream().map(Purchase::getCourseId).collect(Collectors.toSet());
        List<Course> published = courseRepository.findByStatus(Course.CourseStatus.PUBLISHED);
        List<Map<String, Object>> suggestions = published.stream()
                .filter(c -> !ownedIds.contains(c.getId()))
                .limit(4)
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("title", c.getTitle());
                    m.put("price", c.getPrice());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("enrolledCourses", enrolledCourses);
        dashboard.put("suggestions", suggestions);
        dashboard.put("totalEnrolled", enrolledCourses.size());

        return ResponseEntity.ok(dashboard);
    }
}
