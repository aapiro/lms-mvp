package com.lms.assessments;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class AssessmentDto {

    @Data
    public static class CreateAssessmentRequest {
        private String title;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer durationMinutes;
        private Integer totalPoints;
        private List<CreateQuestionRequest> questions;
    }

    @Data
    public static class CreateQuestionRequest {
        private String questionText;
        private Question.QuestionType questionType;
        private String options;
        private String correctAnswer;
        private Integer points;
    }

    @Data
    public static class UpdateAssessmentRequest {
        private String title;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer durationMinutes;
        private Integer totalPoints;
    }

    @Data
    public static class AssessmentResponse {
        private Long id;
        private Long courseId;
        private String title;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer durationMinutes;
        private Integer totalPoints;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<QuestionResponse> questions;
    }

    @Data
    public static class QuestionResponse {
        private Long id;
        private Long assessmentId;
        private String questionText;
        private String questionType;
        private String options;
        private String correctAnswer;
        private Integer points;
    }

    @Data
    public static class SubmitAssessmentRequest {
        private List<AnswerRequest> answers;
    }

    @Data
    public static class AnswerRequest {
        private Long questionId;
        private String answer;
    }

    @Data
    public static class SubmissionResponse {
        private Long id;
        private Long assessmentId;
        private Long userId;
        private LocalDateTime submittedAt;
        private String answers;
        private String status;
        private Integer score;
        private List<GradeResponse> grades;
    }

    @Data
    public static class GradeResponse {
        private Long id;
        private Long submissionId;
        private Long questionId;
        private Integer score;
        private String feedback;
        private String gradedBy;
        private LocalDateTime gradedAt;
    }
}
