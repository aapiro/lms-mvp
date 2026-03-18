package com.lms.assessments;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "question_text", nullable = false, length = 2000)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(length = 2000)
    private String options; // JSON string for multiple choice options

    @Column(name = "correct_answer", length = 1000)
    private String correctAnswer; // For multiple choice: index, for open: null or expected answer

    @Column(nullable = false)
    private Integer points;

    public enum QuestionType {
        MULTIPLE_CHOICE, OPEN_ENDED
    }
}
