package com.lms.lessons;

import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {
    
    private final LessonService lessonService;
    
    @GetMapping("/{id}")
    public ResponseEntity<LessonDto.LessonResponse> getLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(lessonService.getLessonWithUrl(id, user));
    }
}
