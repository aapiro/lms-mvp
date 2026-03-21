package com.lms.users;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.progress.ProgressRepository;
import com.lms.lessons.LessonRepository;
import com.lms.courses.CourseRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    /** Devuelve el perfil completo del usuario autenticado. */
    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();

        ProfileResponse resp = buildProfile(user);
        return ResponseEntity.ok(resp);
    }

    /** Actualiza nombre, bio y/o avatarUrl del usuario autenticado. */
    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @AuthenticationPrincipal User user,
            @RequestBody ProfileUpdateRequest req) {

        if (user == null) return ResponseEntity.status(401).build();

        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFullName() != null && !req.getFullName().isBlank())
            managed.setFullName(req.getFullName());
        if (req.getBio() != null)
            managed.setBio(req.getBio());
        if (req.getAvatarUrl() != null)
            managed.setAvatarUrl(req.getAvatarUrl());

        userRepository.save(managed);
        return ResponseEntity.ok(buildProfile(managed));
    }

    /** Cambia la contraseña del usuario autenticado. */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest req) {

        if (user == null) return ResponseEntity.status(401).build();

        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), managed.getPassword())) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Contraseña actual incorrecta"));
        }

        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "La nueva contraseña debe tener al menos 6 caracteres"));
        }

        managed.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(managed);
        return ResponseEntity.ok(java.util.Map.of("message", "Contraseña actualizada"));
    }

    // ─── helpers ───────────────────────────────────────────────────

    private ProfileResponse buildProfile(User user) {
        ProfileResponse resp = new ProfileResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setBio(user.getBio());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setRole(user.getRole() != null ? user.getRole().name() : null);
        resp.setCreatedAt(user.getCreatedAt());
        resp.setLastLogin(user.getLastLogin());

        // Cursos inscritos (compras completadas + cursos gratuitos con progreso)
        List<Purchase> purchases = purchaseRepository
                .findByUserIdAndStatus(user.getId(), Purchase.PurchaseStatus.COMPLETED);

        resp.setEnrollments(purchases.stream().map(p -> {
            EnrollmentItem ei = new EnrollmentItem();
            ei.setCourseId(p.getCourseId());
            ei.setPurchasedAt(p.getPurchasedAt());
            courseRepository.findById(p.getCourseId()).ifPresent(c -> {
                ei.setCourseTitle(c.getTitle());
                ei.setThumbnailUrl(c.getThumbnailUrl());
            });

            var lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(p.getCourseId());
            var progressList = progressRepository.findByUserIdAndCourseId(user.getId(), p.getCourseId());
            long done = progressList.stream()
                    .filter(pr -> Boolean.TRUE.equals(pr.getCompleted())).count();
            int pct = lessons.isEmpty() ? 0 : (int) (done * 100 / lessons.size());
            ei.setCompletionPercentage(pct);
            ei.setCompletedLessons((int) done);
            ei.setTotalLessons(lessons.size());
            ei.setStatus(pct >= 100 ? "COMPLETED" : done > 0 ? "IN_PROGRESS" : "NOT_STARTED");
            return ei;
        }).collect(Collectors.toList()));

        // Certificados
        resp.setCertificates(certificateRepository.findByUserId(user.getId()).stream()
                .map(c -> {
                    CertificateItem ci = new CertificateItem();
                    ci.setId(c.getId());
                    ci.setCourseId(c.getCourseId());
                    ci.setIssueDate(c.getIssueDate());
                    ci.setCertificateUrl(c.getCertificateUrl());
                    courseRepository.findById(c.getCourseId())
                            .ifPresent(course -> ci.setCourseTitle(course.getTitle()));
                    return ci;
                }).collect(Collectors.toList()));

        return resp;
    }

    // ─── DTOs ──────────────────────────────────────────────────────

    @Data
    public static class ProfileResponse {
        private Long id;
        private String email;
        private String fullName;
        private String bio;
        private String avatarUrl;
        private String role;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime lastLogin;
        private List<EnrollmentItem> enrollments;
        private List<CertificateItem> certificates;
    }

    @Data
    public static class EnrollmentItem {
        private Long courseId;
        private String courseTitle;
        private String thumbnailUrl;
        private java.time.LocalDateTime purchasedAt;
        private Integer completionPercentage;
        private Integer completedLessons;
        private Integer totalLessons;
        private String status; // NOT_STARTED | IN_PROGRESS | COMPLETED
    }

    @Data
    public static class CertificateItem {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private java.time.LocalDateTime issueDate;
        private String certificateUrl;
    }

    @Data
    public static class ProfileUpdateRequest {
        private String fullName;
        private String bio;
        private String avatarUrl;
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }
}

