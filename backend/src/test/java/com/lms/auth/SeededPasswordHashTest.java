package com.lms.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class SeededPasswordHashTest {

    private static final String ADMIN_HASH_V40 =
            "$2a$10$BZdrKJqeLeSwvHPfxk5Zr.W9riOH.mwoeAidxL45GzIpy7F1u3tH6";
    private static final String TEST_USER_HASH_V40 =
            "$2a$10$80e9Z9nF9uVM2MJbl5UF0u1XJCDSmaBoT.VpBb5M9Qnp4I/uSw3h2";

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void v40AdminHashShouldMatchAdmin123() {
        assertThat(encoder.matches("admin123", ADMIN_HASH_V40))
                .as("V40 admin hash must match plaintext 'admin123' (README/docker default profile)")
                .isTrue();
    }

    @Test
    void v40TestUserHashShouldMatchPassword123() {
        assertThat(encoder.matches("Password123", TEST_USER_HASH_V40))
                .as("V40 test user hash must match plaintext 'Password123'")
                .isTrue();
    }
}
