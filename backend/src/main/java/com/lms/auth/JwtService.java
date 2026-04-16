package com.lms.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration:900000}")
    private Long accessExpiration;

    private static final long REFRESH_EXPIRATION = 7 * 24 * 60 * 60 * 1000L; // 7 days
    
    /** jjwt requires at least 256 bits for HS256; short dev secrets are stretched with SHA-256. */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                keyBytes = digest.digest(keyBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-256 not available", e);
            }
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(String email, Long userId, String role) {
        return generateAccessToken(email, userId, role);
    }

    public String generateAccessToken(String email, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("type", "access");

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("type", "refresh");

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }
    
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }
    
    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }
    
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }
    
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
    
    public boolean validateToken(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    public String extractType(String token) {
        return extractClaims(token).get("type", String.class);
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(extractType(token));
    }
}
