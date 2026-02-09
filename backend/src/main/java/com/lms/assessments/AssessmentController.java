package com.lms.assessments;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<Assessment> createAssessment(
            @PathVariable Long courseId,
            @RequestBody AssessmentDto.CreateAssessmentRequest request) {
        Assessment assessment = assessmentService.createAssessment(courseId, request);
        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<Assessment> updateAssessment(
            @PathVariable Long assessmentId,
            @RequestBody AssessmentDto.UpdateAssessmentRequest request) {
        Assessment assessment = assessmentService.updateAssessment(assessmentId, request);
        return ResponseEntity.ok(assessment);
    }

    @DeleteMapping("/{assessmentId}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long assessmentId) {
        assessmentService.deleteAssessment(assessmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByCourse(@PathVariable Long courseId) {
        List<Assessment> assessments = assessmentService.getAssessmentsByCourse(courseId);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<AssessmentDto.AssessmentResponse> getAssessment(@PathVariable Long assessmentId) {
        AssessmentDto.AssessmentResponse response = assessmentService.getAssessmentWithQuestions(assessmentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{assessmentId}/submissions/start")
    public ResponseEntity<Submission> startSubmission(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {
        Submission submission = assessmentService.startOrGetSubmission(assessmentId, userId);
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/{assessmentId}/submissions/submit")
    public ResponseEntity<Submission> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestParam Long userId,
            @RequestBody AssessmentDto.SubmitAssessmentRequest request) {
        Submission submission = assessmentService.submitAssessment(assessmentId, userId, request);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<AssessmentDto.SubmissionResponse> getSubmission(@PathVariable Long submissionId) {
        AssessmentDto.SubmissionResponse response = assessmentService.getSubmissionWithGrades(submissionId);
        return ResponseEntity.ok(response);
    }
}
