package com.lms.courses;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CourseDto {

    @Data
    public static class CreateCourseRequest {
        @NotBlank
        private String title;
        private String description;
        @NotNull @PositiveOrZero
        private BigDecimal price;
        private Course.CourseStatus status = Course.CourseStatus.PUBLISHED;
        private Course.EnrollmentType enrollmentType = Course.EnrollmentType.OPEN;
        private Integer capacityLimit;
        private String certificateTemplate;
        private List<Long> categoryIds = new ArrayList<>();
        private List<Long> tagIds = new ArrayList<>();
        private List<Long> prerequisiteCourseIds = new ArrayList<>();
    }

    @Data
    public static class UpdateCourseRequest {
        private String title;
        private String description;
        private BigDecimal price;
        private Course.CourseStatus status;
        private Course.EnrollmentType enrollmentType;
        private Integer capacityLimit;
        private String certificateTemplate;
        private List<Long> categoryIds;
        private List<Long> tagIds;
        private List<Long> prerequisiteCourseIds;
    }

    @Data
    public static class StatusRequest {
        private Course.CourseStatus status;
    }

    @Data
    public static class CourseResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String thumbnailUrl;
        private Long createdBy;
        private LocalDateTime createdAt;
        private int lessonCount;
        private boolean purchased;
        private Integer progressPercentage;
        private String status;
        private String enrollmentType;
        private Integer capacityLimit;
        private int enrolledCount;
        private List<String> categories = new ArrayList<>();
        private List<String> tags = new ArrayList<>();
    }

    @Data
    public static class CourseDetailResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String thumbnailUrl;
        private Long createdBy;
        private LocalDateTime createdAt;
        private List<LessonInfo> lessons;
        private boolean purchased;
        private Integer progressPercentage;
        private String status;
        private String enrollmentType;
        private Integer capacityLimit;
        private int enrolledCount;
        private String certificateTemplate;
        private boolean prerequisitesMet = true;
        private List<ModuleInfo> modules = new ArrayList<>();
        private List<PrerequisiteInfo> prerequisites = new ArrayList<>();
        private List<String> categories = new ArrayList<>();
        private List<String> tags = new ArrayList<>();
    }

    @Data
    public static class LessonInfo {
        private Long id;
        private String title;
        private String lessonType;
        private Integer durationSeconds;
        private boolean completed;
        private Long moduleId;
        private Integer releaseAfterDays;
        private LocalDateTime availableFrom;
        private boolean available = true;
    }

    @Data
    public static class ModuleInfo {
        private Long id;
        private String title;
        private String description;
        private int moduleOrder;
        private List<LessonInfo> lessons = new ArrayList<>();
    }

    @Data
    public static class PrerequisiteInfo {
        private Long courseId;
        private String courseTitle;
        private boolean completed;
    }
}
