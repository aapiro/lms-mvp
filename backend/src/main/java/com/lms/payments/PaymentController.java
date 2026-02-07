package com.lms.payments;

import com.lms.users.User;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;
    
    @PostMapping("/checkout/{courseId}")
    public ResponseEntity<Map<String, String>> createCheckout(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        try {
            String url = paymentService.createCheckoutSession(courseId, user);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new RuntimeException("Session not found"));
                
                paymentService.handleSuccessfulPayment(session.getId());
            }
            
            return ResponseEntity.ok("Success");
            
        } catch (SignatureVerificationException e) {
            log.error("Invalid signature", e);
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook error", e);
            return ResponseEntity.internalServerError().body("Webhook error");
        }
    }
}
