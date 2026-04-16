package com.lms.config;

import com.lms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * On {@code dev} profile (e.g. docker-compose.override), re-encodes README demo passwords with
 * the app's {@link PasswordEncoder} so login matches E2E even if Postgres had stale hashes.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDemoPasswordsInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDemoPasswordsInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        boolean any = false;
        if (resetIfPresent("admin@lms.com", "admin123")) any = true;
        if (resetIfPresent("test@example.com", "Password123")) any = true;
        if (any) {
            log.info("Dev profile: synced BCrypt passwords for seeded demo users (README / E2E).");
        }
    }

    private boolean resetIfPresent(String email, String plainPassword) {
        return userRepository
                .findByEmail(email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(plainPassword));
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }
}
