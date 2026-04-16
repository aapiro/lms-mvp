package com.lms.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TutorConversationRepository extends JpaRepository<TutorConversation, Long> {
    Optional<TutorConversation> findFirstByUserIdAndCourseIdOrderByUpdatedAtDesc(Long userId, Long courseId);
    List<TutorConversation> findByUserIdAndCourseIdOrderByUpdatedAtDesc(Long userId, Long courseId);
}
