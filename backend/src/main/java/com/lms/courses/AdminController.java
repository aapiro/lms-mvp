package com.lms.courses;

import com.lms.lessons.LessonDto;
import com.lms.lessons.LessonService;
import com.lms.users.User;
import com.lms.config.AuditService;
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
    private final AuditService auditService;

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(
            @Valid @RequestBody CourseDto.CreateCourseRequest request,
            @AuthenticationPrincipal User user
    ) {
        Course created = courseService.createCourse(request, user);
        try {
            auditService.log(user != null ? user.getId() : null, "CREATE_COURSE", "course", String.valueOf(created.getId()), "{\"title\":\"" + created.getTitle() + "\"}");
        } catch (Exception e) {
            // don't break the main flow on audit errors
        }
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDto.UpdateCourseRequest request,
            @AuthenticationPrincipal User user
    ) {
        Course updated = courseService.updateCourse(id, request);
        try {
            auditService.log(user != null ? user.getId() : null, "UPDATE_COURSE", "course", String.valueOf(updated.getId()), "{\"title\":\"" + updated.getTitle() + "\"}");
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, @AuthenticationPrincipal User user) {
        courseService.deleteCourse(id);
        try {
            auditService.log(user != null ? user.getId() : null, "DELETE_COURSE", "course", String.valueOf(id), null);
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<?> createLesson(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("lessonOrder") Integer lessonOrder,
            @RequestParam(value = "durationSeconds", required = false) Integer durationSeconds,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        LessonDto.CreateLessonRequest request = new LessonDto.CreateLessonRequest();
        request.setTitle(title);
        request.setLessonOrder(lessonOrder);
        request.setDurationSeconds(durationSeconds);
        
        Object lesson = lessonService.createLesson(courseId, request, file);
        try {
            auditService.log(user != null ? user.getId() : null, "CREATE_LESSON", "lesson", String.valueOf(((com.lms.lessons.Lesson)lesson).getId()), "{\"title\":\"" + request.getTitle() + "\"}");
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.ok(lesson);
    }
    
    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id, @AuthenticationPrincipal User user) {
        lessonService.deleteLesson(id);
        try {
            auditService.log(user != null ? user.getId() : null, "DELETE_LESSON", "lesson", String.valueOf(id), null);
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.noContent().build();
    }
}
