package com.lms.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class SeededPasswordHashTest {

    private static final String ADMIN_HASH_V27 =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    private static final String TEST_USER_HASH_V27 =
            "$2a$10$CwTycUXWue0Thq9StjUM0uJ8m7l8wZp8n0q8jY6K/5jF9i8u1QeKG";

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void v27AdminHashShouldMatchAdmin123() {
        assertThat(encoder.matches("admin123", ADMIN_HASH_V27))
                .as("V27 admin hash must match plaintext 'admin123' (README/docker default profile)")
                .isTrue();
    }

    @Test
    void v27TestUserHashShouldMatchPassword123() {
        assertThat(encoder.matches("Password123", TEST_USER_HASH_V27))
                .as("V27 test user hash must match plaintext 'Password123'")
                .isTrue();
    }
}
