package com.lms.courses;

import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CourseDto.CourseResponse>> getAllCourses(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String enrollmentType
    ) {
        return ResponseEntity.ok(courseService.getAllCourses(user, category, tag, enrollmentType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto.CourseDetailResponse> getCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(courseService.getCourseById(id, user));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto.CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/tags")
    public ResponseEntity<List<CategoryDto.TagResponse>> getTags() {
        return ResponseEntity.ok(categoryService.getAllTags());
    }
}
