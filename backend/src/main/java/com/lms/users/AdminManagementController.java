package com.lms.users;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/management")
@RequiredArgsConstructor
public class AdminManagementController {

    private final UserManagementService service;

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Void> changeRole(
            @PathVariable Long id,
            @RequestBody UserManagementDto.RoleChangeRequest request,
            @AuthenticationPrincipal User actor) {
        service.changeUserRole(id, request.getRole(), actor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/active")
    public ResponseEntity<Void> setActive(
            @PathVariable Long id,
            @RequestBody UserManagementDto.ActiveStatusRequest request,
            @AuthenticationPrincipal User actor) {
        service.setUserActive(id, request.isActive(), actor);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/certificates/{userId}/{courseId}")
    public ResponseEntity<UserManagementDto.CertificateDto> issueCertificate(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(service.issueCertificate(userId, courseId, actor));
    }
}

