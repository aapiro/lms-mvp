package com.lms.assessments;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.lms.users.User;
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
    public ResponseEntity<AssessmentDto.SubmissionResponse> startSubmission(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal User user,
            @RequestParam(value = "userId", required = false) Long userId) {
        Long effectiveUserId = (user != null && user.getId() != null) ? user.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Submission submission = assessmentService.startOrGetSubmission(assessmentId, effectiveUserId);
        AssessmentDto.SubmissionResponse response = assessmentService.getSubmissionWithGrades(submission.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{assessmentId}/submissions/submit")
    public ResponseEntity<AssessmentDto.SubmissionResponse> submitAssessment(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal User user,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestBody AssessmentDto.SubmitAssessmentRequest request) {
        Long effectiveUserId = (user != null && user.getId() != null) ? user.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Submission submission = assessmentService.submitAssessment(assessmentId, effectiveUserId, request);
        AssessmentDto.SubmissionResponse response = assessmentService.getSubmissionWithGrades(submission.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<AssessmentDto.SubmissionResponse> getSubmission(@PathVariable Long submissionId) {
        AssessmentDto.SubmissionResponse response = assessmentService.getSubmissionWithGrades(submissionId);
        return ResponseEntity.ok(response);
    }
}
