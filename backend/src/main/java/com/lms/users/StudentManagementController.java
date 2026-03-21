package com.lms.users;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class StudentManagementController {

    private final UserManagementService service;

    @GetMapping
    public ResponseEntity<Page<UserManagementDto.UserSummaryDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.listStudents(search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserManagementDto.StudentDetailDto> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStudentDetail(id));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<List<UserManagementDto.StudentProgressDto>> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStudentProgress(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserManagementDto.UserSummaryDto> updateProfile(
            @PathVariable Long id,
            @RequestBody UserManagementDto.ProfileUpdateRequest request,
            @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(service.updateProfile(id, request, actor));
    }
}

