package com.lms.courses;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

public class ModuleDto {

    @Data
    public static class CreateModuleRequest {
        @NotBlank
        private String title;
        private String description;
        @NotNull
        private Integer moduleOrder;
    }

    @Data
    public static class UpdateModuleRequest {
        private String title;
        private String description;
        private Integer moduleOrder;
    }

    @Data
    public static class AssignLessonRequest {
        private Long moduleId; // null = remove from module
    }

    @Data
    public static class ModuleResponse {
        private Long id;
        private Long courseId;
        private String title;
        private String description;
        private int moduleOrder;
        private List<CourseDto.LessonInfo> lessons = new ArrayList<>();
    }
}

