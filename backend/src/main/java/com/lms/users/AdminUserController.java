package com.lms.users;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> list = userRepository.findAll().stream().map(UserDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().build();
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
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return userRepository.findById(id).map(u -> {
            if (req.getFullName() != null) u.setFullName(req.getFullName());
            if (req.getRole() != null) u.setRole(User.Role.valueOf(req.getRole()));
            if (req.getPassword() != null && !req.getPassword().isEmpty()) {
                u.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            userRepository.save(u);
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
