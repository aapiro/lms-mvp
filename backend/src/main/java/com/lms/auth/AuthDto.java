package com.lms.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {
    
    @Data
    public static class RegisterRequest {
        @NotBlank
        @Email
        private String email;
        
        @NotBlank
        @Size(min = 6)
        private String password;
        
        @NotBlank
        private String fullName;
    }
    
    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;
        
        @NotBlank
        private String password;
    }
    
    @Data
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
    }
}
