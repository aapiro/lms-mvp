package com.lms.users;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class UserManagementDto {

    // ──────────────────────────────────────────────────────────────
    // Shared
    // ──────────────────────────────────────────────────────────────

    @Data
    public static class UserSummaryDto {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String bio;
        private String avatarUrl;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;

        public static UserSummaryDto from(User u) {
            UserSummaryDto d = new UserSummaryDto();
            d.setId(u.getId());
            d.setEmail(u.getEmail());
            d.setFullName(u.getFullName());
            d.setRole(u.getRole() != null ? u.getRole().name() : null);
            d.setBio(u.getBio());
            d.setAvatarUrl(u.getAvatarUrl());
            d.setIsActive(u.getIsActive());
            d.setCreatedAt(u.getCreatedAt());
            d.setLastLogin(u.getLastLogin());
            return d;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Students
    // ──────────────────────────────────────────────────────────────

    @Data
    public static class EnrollmentDto {
        private Long purchaseId;
        private Long courseId;
        private String courseTitle;
        private BigDecimal amount;
        private LocalDateTime purchasedAt;
        private Integer completionPercentage;
        private String status; // NOT_STARTED, ACTIVE, COMPLETED
    }

    @Data
    public static class StudentProgressDto {
        private Long courseId;
        private String courseTitle;
        private Integer completionPercentage;
        private Integer completedLessons;
        private Integer totalLessons;
        private String status;
        private LocalDateTime lastActivity;
    }

    @Data
    public static class StudentDetailDto {
        private Long id;
        private String email;
        private String fullName;
        private String bio;
        private String avatarUrl;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        private List<EnrollmentDto> enrollments;
        private List<CertificateDto> certificates;
    }

    // ──────────────────────────────────────────────────────────────
    // Certificates
    // ──────────────────────────────────────────────────────────────

    @Data
    public static class CertificateDto {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private LocalDateTime issueDate;
        private String certificateUrl;
    }

    // ──────────────────────────────────────────────────────────────
    // Instructors
    // ──────────────────────────────────────────────────────────────

    @Data
    public static class CourseMetricsDto {
        private Long id;
        private String title;
        private Integer totalEnrollments;
        private Integer activeStudents;
        private Integer completedStudents;
        private Integer avgCompletionRate;
    }

    @Data
    public static class InstructorDetailDto {
        private Long id;
        private String email;
        private String fullName;
        private String bio;
        private String avatarUrl;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        private List<CourseMetricsDto> assignedCourses;
    }

    // ──────────────────────────────────────────────────────────────
    // Request payloads
    // ──────────────────────────────────────────────────────────────

    @Data
    public static class ProfileUpdateRequest {
        private String fullName;
        private String bio;
        private String avatarUrl;
    }

    @Data
    public static class RoleChangeRequest {
        private String role; // "STUDENT" | "INSTRUCTOR" | "ADMIN"
    }

    @Data
    public static class ActiveStatusRequest {
        private boolean active;
    }
}

