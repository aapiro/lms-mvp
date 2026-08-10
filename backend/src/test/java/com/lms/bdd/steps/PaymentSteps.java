package com.lms.bdd.steps;

import com.lms.bdd.TestDataFactory;
import com.lms.config.AppConfigService;
import com.lms.courses.Course;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import io.cucumber.java.es.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class PaymentSteps {

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private TestDataFactory dataFactory;
    @Autowired private AppConfigService appConfigService;
    @Autowired private PurchaseRepository purchaseRepository;

    private ResponseEntity<String> lastResponse;
    private String studentToken;
    private User studentUser;
    private Course testCourse;

    @Dado("que estoy autenticado como estudiante")
    @Dado("estoy autenticado como estudiante")
    public void autenticar_estudiante() {
        studentUser = dataFactory.createStudent("student-pay@test.com", "Pass1234", "Estudiante");
        var loginRes = restTemplate.postForEntity("/api/auth/login",
                Map.of("email", "student-pay@test.com", "password", "Pass1234"), Map.class);
        studentToken = (String) loginRes.getBody().get("token");
    }

    @Dado("ya he comprado un curso")
    public void ya_comprado() {
        User admin = dataFactory.createAdmin("admin-pay@test.com", "Admin123", "Admin");
        testCourse = dataFactory.createPublishedCourse("Curso Comprado", new BigDecimal("19.99"), admin.getId());
        dataFactory.createPurchase(studentUser.getId(), testCourse.getId(), new BigDecimal("19.99"));
    }

    @Cuando("intento comprar el mismo curso")
    public void comprar_duplicado() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(studentToken);
        lastResponse = restTemplate.exchange("/api/payments/checkout/" + testCourse.getId(),
                HttpMethod.POST, new HttpEntity<>(headers), String.class);
    }

    @Entonces("recibo un error indicando que ya poseo el curso")
    public void error_ya_posee() {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(lastResponse.getBody()).contains("already");
    }

    @Dado("que la configuración {string} está en {string}")
    public void set_config(String key, String value) {
        appConfigService.set(key, value);
    }

    @Dado("existe un curso publicado con precio {double}")
    public void existe_curso_precio(double price) {
        User admin = dataFactory.createAdmin("admin-pay2@test.com", "Admin123", "Admin");
        testCourse = dataFactory.createPublishedCourse("Curso Pago", new BigDecimal(String.valueOf(price)), admin.getId());
    }

    @Cuando("inicio el checkout del curso")
    public void checkout() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(studentToken);
        lastResponse = restTemplate.exchange("/api/payments/checkout/" + testCourse.getId(),
                HttpMethod.POST, new HttpEntity<>(headers), String.class);
    }

    @Entonces("se crea una compra con estado {string}")
    public void verificar_compra(String status) {
        boolean exists = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                studentUser.getId(), testCourse.getId(),
                com.lms.payments.Purchase.PurchaseStatus.valueOf(status));
        assertThat(exists).isTrue();
    }
}
