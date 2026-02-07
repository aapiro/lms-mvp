package com.lms.payments;

import com.lms.courses.CourseRepository;
import com.lms.users.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/purchases")
@RequiredArgsConstructor
public class AdminPurchaseController {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PurchaseDto>> list(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        Pageable p = PageRequest.of(page, size);
        Page<Purchase> purchases = purchaseRepository.findAll(p);
        List<PurchaseDto> dtos = purchases.getContent().stream().map(this::toDto).collect(Collectors.toList());
        Page<PurchaseDto> result = new PageImpl<>(dtos, p, purchases.getTotalElements());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PurchaseDto> get(@PathVariable Long id) {
        Optional<Purchase> opt = purchaseRepository.findById(id);
        return opt.map(p -> ResponseEntity.ok(toDto(p))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private PurchaseDto toDto(Purchase p) {
        PurchaseDto d = new PurchaseDto();
        d.setId(p.getId());
        d.setUserId(p.getUserId());
        userRepository.findById(p.getUserId()).ifPresent(u -> d.setUserEmail(u.getEmail()));
        d.setCourseId(p.getCourseId());
        courseRepository.findById(p.getCourseId()).ifPresent(c -> d.setCourseTitle(c.getTitle()));
        d.setAmount(p.getAmount());
        d.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        d.setPurchasedAt(p.getPurchasedAt());
        d.setStripePaymentId(p.getStripePaymentId());
        return d;
    }

    @Data
    public static class PurchaseDto {
        private Long id;
        private Long userId;
        private String userEmail;
        private Long courseId;
        private String courseTitle;
        private java.math.BigDecimal amount;
        private String status;
        private java.time.LocalDateTime purchasedAt;
        private String stripePaymentId;
    }
}
