package com.lms.auth;

import com.lms.monitoring.SecurityEventService;
import com.lms.users.User;
import com.lms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final SecurityEventService securityEventService;
    
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(User.Role.STUDENT);
        
        user = userRepository.save(user);
        
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        
        return buildAuthResponse(user, token);
    }
    
    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            securityEventService.logLoginFailed(request.getEmail(), null, null);
            throw new RuntimeException("Invalid credentials");
        }

        securityEventService.logLoginSuccess(user.getId(), user.getEmail(), null, null);

        // Track last login time
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        
        return buildAuthResponse(user, token);
    }
    
    @Transactional
    public AuthDto.AuthResponse refreshTokens(String refreshToken) {
        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }
            String email = jwtService.extractEmail(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
            String newRefresh = jwtService.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());
            return buildAuthResponse(user, accessToken, newRefresh);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Don't reveal if email exists
            return "If the email is registered, a reset link has been sent.";
        }
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        resetTokenRepository.save(resetToken);
        log.info("Password reset token generated for user {}: {}", email, token);
        // EmailService.sendPasswordReset(email, token) would be called here
        return "If the email is registered, a reset link has been sent.";
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user, String token) {
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());
        return buildAuthResponse(user, token, refreshToken);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        AuthDto.AuthResponse response = new AuthDto.AuthResponse();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().name());
        return response;
    }
}
