package com.lms.courses;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CourseDto {
    
    @Data
    public static class CreateCourseRequest {
        @NotBlank
        private String title;
        
        private String description;
        
        @NotNull
        @PositiveOrZero
        private BigDecimal price;
    }
    
    @Data
    public static class UpdateCourseRequest {
        private String title;
        private String description;
        private BigDecimal price;
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
    }
    
    @Data
    public static class LessonInfo {
        private Long id;
        private String title;
        private String lessonType;
        private Integer durationSeconds;
        private boolean completed;
    }
}
