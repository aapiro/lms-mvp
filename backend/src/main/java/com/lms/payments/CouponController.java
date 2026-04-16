package com.lms.payments;

import com.lms.users.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    @PostMapping("/api/coupons/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, String> body,
                                            @AuthenticationPrincipal User user) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Código requerido"));
        }
        var coupon = couponRepository.findByCodeAndActiveTrue(code.toUpperCase().trim());
        if (coupon.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cupón no válido"));
        }
        Coupon c = coupon.get();
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cupón expirado"));
        }
        if (c.getMaxUses() != null && c.getCurrentUses() >= c.getMaxUses()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cupón agotado"));
        }
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", c.getCode(),
                "discountPercent", c.getDiscountPercent()
        ));
    }

    // Admin CRUD
    @GetMapping("/api/admin/coupons")
    public ResponseEntity<?> listCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
