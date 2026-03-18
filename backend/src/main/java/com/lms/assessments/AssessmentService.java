package com.lms.assessments;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final GradeRepository gradeRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Assessment createAssessment(Long courseId, AssessmentDto.CreateAssessmentRequest request) {
        Assessment assessment = new Assessment();
        assessment.setCourseId(courseId);
        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setStartDate(request.getStartDate());
        assessment.setEndDate(request.getEndDate());
        assessment.setDurationMinutes(request.getDurationMinutes());
        assessment.setTotalPoints(request.getTotalPoints());

        Assessment savedAssessment = assessmentRepository.save(assessment);

        // Create questions
        for (AssessmentDto.CreateQuestionRequest q : request.getQuestions()) {
            Question question = new Question();
            question.setAssessmentId(savedAssessment.getId());
            question.setQuestionText(q.getQuestionText());
            question.setQuestionType(q.getQuestionType());
            question.setOptions(q.getOptions());
            question.setCorrectAnswer(q.getCorrectAnswer());
            question.setPoints(q.getPoints());
            questionRepository.save(question);
        }

        return savedAssessment;
    }

    @Transactional
    public Assessment updateAssessment(Long assessmentId, AssessmentDto.UpdateAssessmentRequest request) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        if (request.getTitle() != null) assessment.setTitle(request.getTitle());
        if (request.getDescription() != null) assessment.setDescription(request.getDescription());
        if (request.getStartDate() != null) assessment.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) assessment.setEndDate(request.getEndDate());
        if (request.getDurationMinutes() != null) assessment.setDurationMinutes(request.getDurationMinutes());
        if (request.getTotalPoints() != null) assessment.setTotalPoints(request.getTotalPoints());

        return assessmentRepository.save(assessment);
    }

    @Transactional
    public void deleteAssessment(Long assessmentId) {
        assessmentRepository.deleteById(assessmentId);
    }

    public List<Assessment> getAssessmentsByCourse(Long courseId) {
        return assessmentRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public AssessmentDto.AssessmentResponse getAssessmentWithQuestions(Long assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        List<Question> questions = questionRepository.findByAssessmentIdOrderByIdAsc(assessmentId);

        AssessmentDto.AssessmentResponse response = new AssessmentDto.AssessmentResponse();
        response.setId(assessment.getId());
        response.setCourseId(assessment.getCourseId());
        response.setTitle(assessment.getTitle());
        response.setDescription(assessment.getDescription());
        response.setStartDate(assessment.getStartDate());
        response.setEndDate(assessment.getEndDate());
        response.setDurationMinutes(assessment.getDurationMinutes());
        response.setTotalPoints(assessment.getTotalPoints());
        response.setCreatedAt(assessment.getCreatedAt());
        response.setUpdatedAt(assessment.getUpdatedAt());

        List<AssessmentDto.QuestionResponse> questionResponses = questions.stream().map(q -> {
            AssessmentDto.QuestionResponse qr = new AssessmentDto.QuestionResponse();
            qr.setId(q.getId());
            qr.setAssessmentId(q.getAssessmentId());
            qr.setQuestionText(q.getQuestionText());
            qr.setQuestionType(q.getQuestionType().name());
            qr.setOptions(q.getOptions());
            qr.setCorrectAnswer(q.getCorrectAnswer());
            qr.setPoints(q.getPoints());
            return qr;
        }).collect(Collectors.toList());

        response.setQuestions(questionResponses);
        return response;
    }

    @Transactional
    public Submission startOrGetSubmission(Long assessmentId, Long userId) {
        log.info("startOrGetSubmission called: assessmentId={}, userId={}", assessmentId, userId);
        return submissionRepository.findByAssessmentIdAndUserId(assessmentId, userId)
                .orElseGet(() -> {
                    Submission submission = new Submission();
                    submission.setAssessmentId(assessmentId);
                    submission.setUserId(userId);
                    submission.setStatus(Submission.SubmissionStatus.IN_PROGRESS);
                    Submission saved = submissionRepository.save(submission);
                    log.info("Created submission id={} for assessmentId={} userId={}", saved.getId(), assessmentId, userId);
                    return saved;
                });
    }

    @Transactional
    public Submission submitAssessment(Long assessmentId, Long userId, AssessmentDto.SubmitAssessmentRequest request) {
        log.info("submitAssessment called: assessmentId={}, userId={}, answersCount={}", assessmentId, userId, request != null && request.getAnswers() != null ? request.getAnswers().size() : 0);
        Submission submission = submissionRepository.findByAssessmentIdAndUserId(assessmentId, userId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != Submission.SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Assessment already submitted");
        }

        // Save answers as JSON
        try {
            String answersJson = objectMapper.writeValueAsString(request.getAnswers());
            submission.setAnswers(answersJson);
        } catch (Exception e) {
            throw new RuntimeException("Error saving answers");
        }

        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(Submission.SubmissionStatus.SUBMITTED);

        // Auto-grade multiple choice questions
        autoGradeSubmission(submission);

        Submission saved = submissionRepository.save(submission);
        log.info("Submission submitted id={} score={}", saved.getId(), saved.getScore());
        return saved;
    }

    private void autoGradeSubmission(Submission submission) {
        List<Question> questions = questionRepository.findByAssessmentIdOrderByIdAsc(submission.getAssessmentId());

        try {
            List<AssessmentDto.AnswerRequest> answers = objectMapper.readValue(submission.getAnswers(),
                    new TypeReference<List<AssessmentDto.AnswerRequest>>() {});

            Map<Long, String> answerMap = answers.stream()
                    .collect(Collectors.toMap(AssessmentDto.AnswerRequest::getQuestionId, AssessmentDto.AnswerRequest::getAnswer));

            int totalScore = 0;

            for (Question question : questions) {
                String userAnswer = answerMap.get(question.getId());
                if (userAnswer == null) continue;

                Grade grade = new Grade();
                grade.setSubmissionId(submission.getId());
                grade.setQuestionId(question.getId());

                if (question.getQuestionType() == Question.QuestionType.MULTIPLE_CHOICE) {
                    // Check if answer matches correct answer
                    if (question.getCorrectAnswer() != null && question.getCorrectAnswer().equals(userAnswer)) {
                        grade.setScore(question.getPoints());
                        grade.setFeedback("Correct!");
                    } else {
                        grade.setScore(0);
                        grade.setFeedback("Incorrect.");
                    }
                    grade.setGradedBy("SYSTEM");
                } else {
                    // Open-ended: use AI for grading
                    grade.setScore(0); // Placeholder, will be updated by AI
                    grade.setFeedback("Pending AI evaluation...");
                    grade.setGradedBy("AI");
                    // In a real implementation, call AI service here
                }

                gradeRepository.save(grade);
                totalScore += grade.getScore();
            }

            submission.setScore(totalScore);
            submission.setStatus(Submission.SubmissionStatus.GRADED);

        } catch (Exception e) {
            throw new RuntimeException("Error processing submission");
        }
    }

    public AssessmentDto.SubmissionResponse getSubmissionWithGrades(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<Grade> grades = gradeRepository.findBySubmissionId(submissionId);

        AssessmentDto.SubmissionResponse response = new AssessmentDto.SubmissionResponse();
        response.setId(submission.getId());
        response.setAssessmentId(submission.getAssessmentId());
        response.setUserId(submission.getUserId());
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setAnswers(submission.getAnswers());
        response.setStatus(submission.getStatus().name());
        response.setScore(submission.getScore());

        List<AssessmentDto.GradeResponse> gradeResponses = grades.stream().map(g -> {
            AssessmentDto.GradeResponse gr = new AssessmentDto.GradeResponse();
            gr.setId(g.getId());
            gr.setSubmissionId(g.getSubmissionId());
            gr.setQuestionId(g.getQuestionId());
            gr.setScore(g.getScore());
            gr.setFeedback(g.getFeedback());
            gr.setGradedBy(g.getGradedBy());
            gr.setGradedAt(g.getGradedAt());
            return gr;
        }).collect(Collectors.toList());

        response.setGrades(gradeResponses);
        return response;
    }

    // Placeholder for AI grading
    public void gradeOpenEndedWithAI(Long gradeId, String questionText, String userAnswer) {
        // In a real implementation, call OpenAI or similar API
        // For now, simulate AI grading
        Grade grade = gradeRepository.findById(gradeId).orElseThrow();
        grade.setScore(5); // Example score
        grade.setFeedback("Good answer, but could be more detailed.");
        gradeRepository.save(grade);
    }
}
