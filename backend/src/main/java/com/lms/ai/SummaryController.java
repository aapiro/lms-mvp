package com.lms.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/api/lessons/{id}/summary")
    public ResponseEntity<?> getLessonSummary(@PathVariable Long id) {
        return ResponseEntity.ok(summaryService.getSummary(id));
    }
}
