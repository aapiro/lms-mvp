package com.lms.assessments;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(length = 10000)
    private String answers; // JSON string

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.IN_PROGRESS;

    @Column
    private Integer score;

    public enum SubmissionStatus {
        IN_PROGRESS, SUBMITTED, GRADED
    }
}
