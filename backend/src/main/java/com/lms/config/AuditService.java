package com.lms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    @Autowired
    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public AuditLog log(Long actorId, String action, String targetType, String targetId, String payload) {
        AuditLog a = new AuditLog();
        a.setActorId(actorId);
        a.setAction(action);
        a.setTargetType(targetType);
        a.setTargetId(targetId);
        a.setPayload(payload);
        return repository.save(a);
    }

    public Page<AuditLog> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<AuditLog> listByActor(Long actorId, Pageable pageable) {
        return repository.findByActorId(actorId, pageable);
    }
}
