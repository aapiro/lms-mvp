package com.lms.payments;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Compatibility check for the stripe-java 33 upgrade against stripe-mock
 * (Stripe's official mock server, which validates request shapes against the
 * current OpenAPI spec). Builds the same SessionCreateParams shape as
 * PaymentService.createCheckoutSession. Does NOT talk to real Stripe — the
 * real test-mode flow still needs account keys (see TODO.md).
 */
class StripeSessionCompatTest {

    static GenericContainer<?> stripeMock = new GenericContainer<>("stripe/stripe-mock:latest")
            .withExposedPorts(12111)
            .waitingFor(Wait.forListeningPort());

    @BeforeAll
    static void setUp() {
        stripeMock.start();
        Stripe.overrideApiBase("http://" + stripeMock.getHost() + ":" + stripeMock.getMappedPort(12111));
        Stripe.apiKey = "sk_test_stripemock"; // stripe-mock accepts any test-style key
    }

    @AfterAll
    static void tearDown() {
        // overrideApiBase is JVM-global state; restore it so other tests in
        // the same run never hit the stopped mock by accident
        Stripe.overrideApiBase(Stripe.LIVE_API_BASE);
        stripeMock.stop();
    }

    @Test
    void checkoutSessionParamsSerializeAndParseWithSdk33() throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/course/1?payment=success")
                .setCancelUrl("http://localhost:3000/course/1?payment=cancelled")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(1999L)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Curso Test")
                                                                .setDescription("Descripción")
                                                                .build())
                                                .build())
                                .setQuantity(1L)
                                .build())
                .putMetadata("courseId", "1")
                .putMetadata("userId", "2")
                .build();

        Session created = Session.create(params);
        assertThat(created.getId()).isNotBlank();

        Session retrieved = Session.retrieve(created.getId());
        assertThat(retrieved.getId()).isNotBlank();
        assertThat(retrieved.getObject()).isEqualTo("checkout.session");
    }
}
