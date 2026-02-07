package com.lms.payments;

import com.lms.config.AppConfigService;
import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.users.User;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final CourseRepository courseRepository;
    private final PurchaseRepository purchaseRepository;
    private final AppConfigService appConfigService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;
    
    @Value("${frontend.url}")
    private String frontendUrl;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
    
    public String createCheckoutSession(Long courseId, User user) throws StripeException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Verificar si ya compró el curso
        boolean alreadyPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                user.getId(), courseId, Purchase.PurchaseStatus.COMPLETED);
        
        if (alreadyPurchased) {
            throw new RuntimeException("You already own this course");
        }
        
        // If dev payments mode is enabled, bypass Stripe and create a local purchase and return a fake URL
        String devPayments = appConfigService.get("dev_payments", "false");
        if (Boolean.parseBoolean(devPayments)) {
            Purchase p = new Purchase();
            p.setUserId(user.getId());
            p.setCourseId(courseId);
            p.setAmount(course.getPrice());
            p.setStatus(Purchase.PurchaseStatus.COMPLETED);
            purchaseRepository.save(p);
            log.info("Dev payment: created fake purchase id={} for user={} course={}", p.getId(), user.getId(), courseId);
            // Return a local URL to indicate success
            return frontendUrl + "/course/" + courseId + "?payment=dev_success";
        }

        // Crear sesión de Stripe Checkout
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/course/" + courseId + "?payment=success")
                .setCancelUrl(frontendUrl + "/course/" + courseId + "?payment=cancelled")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(course.getPrice().multiply(new java.math.BigDecimal(100)).longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(course.getTitle())
                                                                .setDescription(course.getDescription())
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("courseId", courseId.toString())
                .putMetadata("userId", user.getId().toString())
                .build();
        
        Session session = Session.create(params);
        
        return session.getUrl();
    }
    
    @Transactional
    public void handleSuccessfulPayment(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);
        
        Long courseId = Long.parseLong(session.getMetadata().get("courseId"));
        Long userId = Long.parseLong(session.getMetadata().get("userId"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Crear registro de compra
        Purchase purchase = new Purchase();
        purchase.setUserId(userId);
        purchase.setCourseId(courseId);
        purchase.setAmount(course.getPrice());
        purchase.setStripePaymentId(session.getPaymentIntent());
        purchase.setStatus(Purchase.PurchaseStatus.COMPLETED);
        
        purchaseRepository.save(purchase);
        
        log.info("Purchase completed: User {} bought Course {}", userId, courseId);
    }
}
