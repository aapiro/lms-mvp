package com.lms.ai;

import com.lms.config.FeatureToggleService;
import com.lms.users.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;
    private final FeatureToggleService featureToggleService;

    private static final Map<String, String> DISABLED = Map.of("error", "Feature deshabilitada por el administrador");

    @GetMapping("/courses/{courseId}/conversation")
    public ResponseEntity<?> getConversation(@PathVariable Long courseId,
                                             @AuthenticationPrincipal User user) {
        if (!featureToggleService.isAiTutorEnabled())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        TutorConversation conv = tutorService.getOrCreateConversation(user.getId(), courseId);
        return ResponseEntity.ok(Map.of(
                "conversationId", conv.getId(),
                "courseId", conv.getCourseId(),
                "messages", tutorService.getHistory(conv.getId())
        ));
    }

    @PostMapping("/courses/{courseId}/conversation/new")
    public ResponseEntity<?> newConversation(@PathVariable Long courseId,
                                             @AuthenticationPrincipal User user) {
        if (!featureToggleService.isAiTutorEnabled())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        TutorConversation conv = tutorService.startNewConversation(user.getId(), courseId);
        return ResponseEntity.ok(Map.of(
                "conversationId", conv.getId(),
                "courseId", conv.getCourseId(),
                "messages", tutorService.getHistory(conv.getId())
        ));
    }

    @PostMapping("/conversations/{conversationId}/message")
    public ResponseEntity<?> sendMessage(@PathVariable Long conversationId,
                                         @RequestBody ChatRequest request,
                                         @AuthenticationPrincipal User user) {
        if (!featureToggleService.isAiTutorEnabled())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DISABLED);
        TutorMessage response = tutorService.chat(conversationId, request.getCourseId(), request.getMessage());
        return ResponseEntity.ok(Map.of(
                "message", response,
                "history", tutorService.getHistory(conversationId)
        ));
    }

    @Data
    static class ChatRequest {
        private String message;
        private Long courseId;
    }
}
