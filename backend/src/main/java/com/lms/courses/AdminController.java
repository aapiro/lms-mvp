package com.lms.courses;

import com.lms.lessons.LessonDto;
import com.lms.lessons.LessonService;
import com.lms.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final CourseService courseService;
    private final LessonService lessonService;
    
    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(
            @Valid @RequestBody CourseDto.CreateCourseRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(courseService.createCourse(request, user));
    }
    
    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDto.UpdateCourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }
    
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<?> createLesson(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("lessonOrder") Integer lessonOrder,
            @RequestParam(value = "durationSeconds", required = false) Integer durationSeconds,
            @RequestParam("file") MultipartFile file
    ) {
        LessonDto.CreateLessonRequest request = new LessonDto.CreateLessonRequest();
        request.setTitle(title);
        request.setLessonOrder(lessonOrder);
        request.setDurationSeconds(durationSeconds);
        
        return ResponseEntity.ok(lessonService.createLesson(courseId, request, file));
    }
    
    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
