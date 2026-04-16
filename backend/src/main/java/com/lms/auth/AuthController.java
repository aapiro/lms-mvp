package com.lms.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody AuthDto.RefreshRequest request) {
        try {
            return ResponseEntity.ok(authService.refreshTokens(request.getRefreshToken()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
