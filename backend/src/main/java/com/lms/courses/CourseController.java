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
    
    @GetMapping
    public ResponseEntity<List<CourseDto.CourseResponse>> getAllCourses(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(courseService.getAllCourses(user));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDto.CourseDetailResponse> getCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(courseService.getCourseById(id, user));
    }
}
