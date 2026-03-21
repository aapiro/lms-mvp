package com.lms.courses;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "course_prerequisites")
public class CoursePrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "prerequisite_course_id", nullable = false)
    private Long prerequisiteCourseId;
}

