package com.lms.ai;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "lesson_summaries")
public class LessonSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false, unique = true)
    private Long lessonId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "key_concepts", columnDefinition = "TEXT")
    private String keyConcepts;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
