package com.lms.lessons;

import com.lms.storage.StorageService;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {
    
    private final LessonService lessonService;
    private final StorageService storageService;

    @GetMapping("/{id}")
    public ResponseEntity<LessonDto.LessonResponse> getLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(lessonService.getLessonWithUrl(id, user));
    }

    // New streaming endpoint: proxies the file through the backend with Range support
    @GetMapping("/{id}/stream")
    public void streamLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // Validate access (will throw if not allowed)
        lessonService.getLessonWithUrl(id, user);

        // Get the raw file key from DB and stream via StorageService
        String realFileKey = lessonService.getFileKey(id);
        storageService.streamFileToResponse(realFileKey, request, response);
    }
}
