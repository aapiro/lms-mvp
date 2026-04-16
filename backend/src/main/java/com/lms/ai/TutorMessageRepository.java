package com.lms.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TutorMessageRepository extends JpaRepository<TutorMessage, Long> {
    List<TutorMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    int countByConversationId(Long conversationId);
}
