package com.lms.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public Notification notify(Long userId, String type, String title, String message, String resourceUrl) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setResourceUrl(resourceUrl);
        return repository.save(n);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return repository.findTop50ByUserIdOrderByCreatedAtDesc(userId);
    }

    public int getUnreadCount(Long userId) {
        return repository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        repository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                repository.save(n);
            }
        });
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return repository.markAllAsRead(userId);
    }
}
