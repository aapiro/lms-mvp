package com.lms.lessons;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

public class LessonDto {
    
    @Data
    public static class CreateLessonRequest {
        @NotBlank
        private String title;
        
        @NotNull
        private Integer lessonOrder;
        
        private Integer durationSeconds;
        private Long moduleId;
        private Integer releaseAfterDays;
        private LocalDateTime availableFrom;
    }
    
    @Data
    public static class LessonResponse {
        private Long id;
        private Long courseId;
        private String title;
        private Integer lessonOrder;
        private String lessonType;
        private Integer durationSeconds;
        private String fileUrl; // Presigned URL
        private Boolean completed = false;
        private boolean available = true;
        private Long moduleId;
        private Integer releaseAfterDays;
        private LocalDateTime availableFrom;
    }

    @Data
    public static class UpdateLessonRequest {
        private String title;

        private Integer lessonOrder;

        private Integer durationSeconds;
        private Long moduleId;
        private Integer releaseAfterDays;
        private LocalDateTime availableFrom;
    }
}
