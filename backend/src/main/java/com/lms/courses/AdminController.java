package com.lms.courses;

import com.lms.lessons.LessonDto;
import com.lms.lessons.LessonService;
import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import com.lms.users.UserManagementDto;
import com.lms.users.UserManagementService;
import com.lms.config.AuditService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CourseService courseService;
    private final LessonService lessonService;
    private final AuditService auditService;
    private final ModuleService moduleService;
    private final CategoryService categoryService;
    private final PurchaseRepository purchaseRepository;
    private final UserManagementService userManagementService;

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
            @RequestParam(value = "moduleId", required = false) Long moduleId,
            @RequestParam(value = "releaseAfterDays", required = false) Integer releaseAfterDays,
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        LessonDto.CreateLessonRequest request = new LessonDto.CreateLessonRequest();
        request.setTitle(title);
        request.setLessonOrder(lessonOrder);
        request.setDurationSeconds(durationSeconds);
        request.setModuleId(moduleId);
        request.setReleaseAfterDays(releaseAfterDays);
        if (availableFrom != null && !availableFrom.isBlank()) {
            request.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom));
        }

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

    @PutMapping("/lessons/{id}")
    public ResponseEntity<?> updateLesson(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "lessonOrder", required = false) Integer lessonOrder,
            @RequestParam(value = "durationSeconds", required = false) Integer durationSeconds,
            @RequestParam(value = "moduleId", required = false) Long moduleId,
            @RequestParam(value = "releaseAfterDays", required = false) Integer releaseAfterDays,
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        LessonDto.UpdateLessonRequest request = new LessonDto.UpdateLessonRequest();
        request.setTitle(title);
        request.setLessonOrder(lessonOrder);
        request.setDurationSeconds(durationSeconds);
        request.setModuleId(moduleId);
        request.setReleaseAfterDays(releaseAfterDays);
        if (availableFrom != null && !availableFrom.isBlank()) {
            request.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom));
        }

        Object lesson = lessonService.updateLesson(id, request, file);
        try {
            auditService.log(user != null ? user.getId() : null, "UPDATE_LESSON", "lesson", String.valueOf(((com.lms.lessons.Lesson)lesson).getId()), "{\"title\":\"" + (title != null ? title : "unchanged") + "\"}");
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.ok(lesson);
    }

    // ── Course Status ────────────────────────────────────────────────

    @PutMapping("/courses/{id}/status")
    public ResponseEntity<Course> changeCourseStatus(
            @PathVariable Long id,
            @RequestBody CourseDto.StatusRequest req,
            @AuthenticationPrincipal User user) {
        Course c = courseService.changeStatus(id, req.getStatus());
        try { auditService.log(user != null ? user.getId() : null, "CHANGE_COURSE_STATUS", "course", String.valueOf(id), "{\"status\":\"" + req.getStatus() + "\"}"); } catch (Exception ignored) {}
        return ResponseEntity.ok(c);
    }

    // ── Modules ──────────────────────────────────────────────────────

    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<List<ModuleDto.ModuleResponse>> getModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(moduleService.getModulesByCourse(courseId));
    }

    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<Module> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody ModuleDto.CreateModuleRequest req,
            @AuthenticationPrincipal User user) {
        Module m = moduleService.createModule(courseId, req);
        try { auditService.log(user != null ? user.getId() : null, "CREATE_MODULE", "module", String.valueOf(m.getId()), null); } catch (Exception ignored) {}
        return ResponseEntity.ok(m);
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<Module> updateModule(
            @PathVariable Long moduleId,
            @RequestBody ModuleDto.UpdateModuleRequest req,
            @AuthenticationPrincipal User user) {
        Module m = moduleService.updateModule(moduleId, req);
        try { auditService.log(user != null ? user.getId() : null, "UPDATE_MODULE", "module", String.valueOf(moduleId), null); } catch (Exception ignored) {}
        return ResponseEntity.ok(m);
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long moduleId, @AuthenticationPrincipal User user) {
        moduleService.deleteModule(moduleId);
        try { auditService.log(user != null ? user.getId() : null, "DELETE_MODULE", "module", String.valueOf(moduleId), null); } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/lessons/{lessonId}/module")
    public ResponseEntity<Void> assignLessonModule(
            @PathVariable Long lessonId,
            @RequestBody ModuleDto.AssignLessonRequest req) {
        moduleService.assignLessonToModule(lessonId, req.getModuleId());
        return ResponseEntity.ok().build();
    }

    // ── Prerequisites ────────────────────────────────────────────────

    @GetMapping("/courses/{id}/prerequisites")
    public ResponseEntity<List<CourseDto.PrerequisiteInfo>> getPrerequisites(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getPrerequisites(id));
    }

    @PostMapping("/courses/{id}/prerequisites")
    public ResponseEntity<Void> addPrerequisite(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        courseService.addPrerequisite(id, body.get("prerequisiteCourseId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{id}/prerequisites/{prereqId}")
    public ResponseEntity<Void> removePrerequisite(@PathVariable Long id, @PathVariable Long prereqId) {
        courseService.removePrerequisite(id, prereqId);
        return ResponseEntity.noContent().build();
    }

    // ── Categories ───────────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto.CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto.CategoryResponse> createCategory(@Valid @RequestBody CategoryDto.CategoryRequest req) {
        return ResponseEntity.ok(categoryService.createCategory(req));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto.CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryDto.CategoryRequest req) {
        return ResponseEntity.ok(categoryService.updateCategory(id, req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{id}/categories")
    public ResponseEntity<Void> addCourseCategory(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        courseService.addCategoryToCourse(id, body.get("categoryId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{id}/categories/{categoryId}")
    public ResponseEntity<Void> removeCourseCategory(@PathVariable Long id, @PathVariable Long categoryId) {
        courseService.removeCategoryFromCourse(id, categoryId);
        return ResponseEntity.noContent().build();
    }

    // ── Tags ─────────────────────────────────────────────────────────

    @GetMapping("/tags")
    public ResponseEntity<List<CategoryDto.TagResponse>> getTags() {
        return ResponseEntity.ok(categoryService.getAllTags());
    }

    @PostMapping("/tags")
    public ResponseEntity<CategoryDto.TagResponse> createTag(@Valid @RequestBody CategoryDto.TagRequest req) {
        return ResponseEntity.ok(categoryService.createTag(req));
    }

    @PutMapping("/tags/{id}")
    public ResponseEntity<CategoryDto.TagResponse> updateTag(@PathVariable Long id, @RequestBody CategoryDto.TagRequest req) {
        return ResponseEntity.ok(categoryService.updateTag(id, req));
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        categoryService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{id}/tags")
    public ResponseEntity<Void> addCourseTag(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        courseService.addTagToCourse(id, body.get("tagId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{id}/tags/{tagId}")
    public ResponseEntity<Void> removeCourseTag(@PathVariable Long id, @PathVariable Long tagId) {
        courseService.removeTagFromCourse(id, tagId);
        return ResponseEntity.noContent().build();
    }

    // ── Course Students ──────────────────────────────────────────────

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<UserManagementDto.CourseStudentDto>> getCourseStudents(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(userManagementService.getCourseStudents(courseId));
    }

    // ── Manual Enrollment (INVITE_ONLY) ──────────────────────────────

    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<Void> enrollUser(
            @PathVariable Long courseId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal User admin) {
        Long userId = body.get("userId");
        courseService.checkAndEnforceCapacity(courseId);
        Purchase p = new Purchase();
        p.setCourseId(courseId);
        p.setUserId(userId);
        p.setAmount(java.math.BigDecimal.ZERO);
        p.setStatus(Purchase.PurchaseStatus.COMPLETED);
        p.setPurchasedAt(LocalDateTime.now());
        purchaseRepository.save(p);
        try { auditService.log(admin != null ? admin.getId() : null, "MANUAL_ENROLL", "purchase", String.valueOf(courseId), "{\"userId\":" + userId + "}"); } catch (Exception ignored) {}
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{courseId}/enroll/{userId}")
    public ResponseEntity<Void> unenrollUser(
            @PathVariable Long courseId,
            @PathVariable Long userId,
            @AuthenticationPrincipal User admin) {
        purchaseRepository.findByUserIdAndCourseId(userId, courseId)
                .ifPresent(p -> purchaseRepository.delete(p));
        try { auditService.log(admin != null ? admin.getId() : null, "MANUAL_UNENROLL", "purchase", String.valueOf(courseId), "{\"userId\":" + userId + "}"); } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ──────────────────────────────────────────────────────

}



