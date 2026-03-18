package com.lms.assessments;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "grades")
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false)
    private Long submissionId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(nullable = false)
    private Integer score;

    @Column(length = 1000)
    private String feedback;

    @Column(name = "graded_by", nullable = false)
    private String gradedBy;

    @Column(name = "graded_at", nullable = false)
    private LocalDateTime gradedAt = LocalDateTime.now();
}
