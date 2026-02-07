package com.lms.users;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> list = userRepository.findAll().stream().map(UserDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            Map<String, String> body = new HashMap<>();
            body.put("error", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }

        User u = new User();
        u.setEmail(req.getEmail());
        u.setFullName(req.getFullName());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRole(req.getRole() == null ? User.Role.USER : User.Role.valueOf(req.getRole()));

        u = userRepository.save(u);
        return ResponseEntity.ok(UserDto.fromEntity(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return userRepository.findById(id).map(u -> {
            log.info("Received update for user id={} : payload email='{}', fullName='{}', role='{}'", id, req.getEmail(), req.getFullName(), req.getRole());
            log.info("Current user email='{}', fullName='{}'", u.getEmail(), u.getFullName());
            // Update email if provided and different
            if (req.getEmail() != null && !req.getEmail().isEmpty() && !req.getEmail().equals(u.getEmail())) {
                // check if another user already has this email
                var existing = userRepository.findByEmail(req.getEmail());
                if (existing.isPresent() && !existing.get().getId().equals(u.getId())) {
                    log.warn("Attempt to update user id={} to email {} but it already exists on id={}", id, req.getEmail(), existing.get().getId());
                    Map<String, String> body = new HashMap<>();
                    body.put("error", "Email already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
                }
                // safe to set (either no existing or same user)
                u.setEmail(req.getEmail());
            }
            if (req.getFullName() != null) u.setFullName(req.getFullName());
            if (req.getRole() != null) u.setRole(User.Role.valueOf(req.getRole()));
            if (req.getPassword() != null && !req.getPassword().isEmpty()) {
                u.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            userRepository.save(u);
            log.info("Saved user id={} email='{}' fullName='{}'", u.getId(), u.getEmail(), u.getFullName());
            return ResponseEntity.ok(UserDto.fromEntity(u));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(UserDto.fromEntity(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Data
    public static class CreateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private String role; // "USER" or "ADMIN"
    }

    @Data
    public static class UpdateUserRequest {
        private String fullName;
        private String password;
        private String role;
        private String email;
    }

    @Data
    public static class UserDto {
        private Long id;
        private String email;
        private String fullName;
        private String role;

        static UserDto fromEntity(User u) {
            UserDto d = new UserDto();
            d.setId(u.getId());
            d.setEmail(u.getEmail());
            d.setFullName(u.getFullName());
            d.setRole(u.getRole() != null ? u.getRole().name() : null);
            return d;
        }
    }
}
