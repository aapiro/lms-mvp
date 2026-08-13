package com.lms.payments;

import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.users.User;
import com.lms.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Full checkout flow against stripe-mock: create session through the real
 * controller/service stack, then deliver a signature-valid
 * checkout.session.completed webhook and assert the purchase is recorded.
 * No real Stripe account involved (see TODO.md for the manual live check).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PaymentWebhookFlowTest {

    private static final String WEBHOOK_SECRET = "whsec_test_secret_for_flow";

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine")
            .withDatabaseName("lmsdb_test")
            .withUsername("test")
            .withPassword("test");

    static GenericContainer<?> minio = new GenericContainer<>("minio/minio:latest")
            .withExposedPorts(9000)
            .withEnv("MINIO_ROOT_USER", "minioadmin")
            .withEnv("MINIO_ROOT_PASSWORD", "minioadmin123")
            .withCommand("server", "/data")
            .waitingFor(Wait.forHttp("/minio/health/live").forPort(9000));

    static GenericContainer<?> stripeMock = new GenericContainer<>("stripe/stripe-mock:latest")
            .withExposedPorts(12111)
            .waitingFor(Wait.forListeningPort());

    static {
        postgres.start();
        minio.start();
        stripeMock.start();
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("minio.endpoint",
                () -> "http://" + minio.getHost() + ":" + minio.getMappedPort(9000));
        registry.add("minio.access-key", () -> "minioadmin");
        registry.add("minio.secret-key", () -> "minioadmin123");
        registry.add("minio.bucket", () -> "test-bucket");
        registry.add("stripe.api-base",
                () -> "http://" + stripeMock.getHost() + ":" + stripeMock.getMappedPort(12111));
        registry.add("stripe.webhook-secret", () -> WEBHOOK_SECRET);
        // stripe-mock only accepts sk_test_<alphanumeric> keys
        registry.add("stripe.secret-key", () -> "sk_test_stripemockflow123");
    }

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User student;
    private Course course;

    @BeforeEach
    void setUp() {
        purchaseRepository.deleteAll();
        userRepository.findByEmail("flow-student@test.com").ifPresent(u -> userRepository.delete(u));

        student = new User();
        student.setEmail("flow-student@test.com");
        student.setPassword(passwordEncoder.encode("Pass1234"));
        student.setFullName("Flow Student");
        student.setRole(User.Role.STUDENT);
        student = userRepository.save(student);

        course = new Course();
        course.setTitle("Curso Stripe Flow");
        course.setDescription("Desc");
        course.setPrice(new BigDecimal("19.99"));
        course.setStatus(Course.CourseStatus.PUBLISHED);
        course.setCreatedBy(student.getId());
        course = courseRepository.save(course);
    }

    @Test
    void checkoutSessionIsCreatedAgainstStripeMock() {
        var loginRes = restTemplate.postForEntity("/api/auth/login",
                Map.of("email", "flow-student@test.com", "password", "Pass1234"), Map.class);
        String token = (String) loginRes.getBody().get("token");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> res = restTemplate.postForEntity(
                "/api/payments/checkout/" + course.getId(), new HttpEntity<>(headers), Map.class);

        assertThat(res.getStatusCode().value())
                .withFailMessage("checkout failed: %s", res.getBody())
                .isEqualTo(200);
        assertThat(res.getBody()).containsKey("url");
    }

    @Test
    void signedCompletedWebhookRecordsPurchase() throws Exception {
        String payload = eventPayload(course.getId(), student.getId());
        ResponseEntity<String> res = postWebhook(payload, signatureHeader(payload, WEBHOOK_SECRET));

        assertThat(res.getStatusCode().value()).isEqualTo(200);
        assertThat(purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                student.getId(), course.getId(), Purchase.PurchaseStatus.COMPLETED)).isTrue();
    }

    @Test
    void webhookWithBadSignatureIsRejected() throws Exception {
        String payload = eventPayload(course.getId(), student.getId());
        ResponseEntity<String> res = postWebhook(payload, signatureHeader(payload, "whsec_wrong"));

        assertThat(res.getStatusCode().value()).isEqualTo(400);
        assertThat(purchaseRepository.count()).isZero();
    }

    private ResponseEntity<String> postWebhook(String payload, String sigHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Stripe-Signature", sigHeader);
        return restTemplate.postForEntity("/api/payments/webhook",
                new HttpEntity<>(payload, headers), String.class);
    }

    /**
     * checkout.session.completed event as Stripe would POST it. The event's
     * api_version must match the SDK's pinned version or
     * EventDataObjectDeserializer.getObject() returns empty.
     */
    private static String eventPayload(Long courseId, Long userId) {
        return """
                {
                  "id": "evt_test_flow_1",
                  "object": "event",
                  "api_version": "%s",
                  "type": "checkout.session.completed",
                  "data": {
                    "object": {
                      "id": "cs_test_flow_1",
                      "object": "checkout.session",
                      "payment_intent": "pi_test_flow_1",
                      "metadata": { "courseId": "%d", "userId": "%d" }
                    }
                  }
                }
                """.formatted(com.stripe.Stripe.API_VERSION, courseId, userId);
    }

    /** Stripe-Signature header: t=<ts>,v1=HMAC_SHA256(secret, "<ts>.<payload>") */
    private static String signatureHeader(String payload, String secret) throws Exception {
        long ts = System.currentTimeMillis() / 1000;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] sig = mac.doFinal((ts + "." + payload).getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : sig) hex.append(String.format("%02x", b));
        return "t=" + ts + ",v1=" + hex;
    }
}
