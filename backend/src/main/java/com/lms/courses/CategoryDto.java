package com.lms.courses;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class CategoryDto {

    @Data
    public static class CategoryRequest {
        @NotBlank private String name;
        @NotBlank private String slug;
        private String description;
    }

    @Data
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String slug;
        private String description;
    }

    @Data
    public static class TagRequest {
        @NotBlank private String name;
        @NotBlank private String slug;
    }

    @Data
    public static class TagResponse {
        private Long id;
        private String name;
        private String slug;
    }
}

