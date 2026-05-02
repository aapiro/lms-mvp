package com.lms.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "dev"})
@Testcontainers
class AuthCredentialsIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("lmsdb_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static GenericContainer<?> minio = new GenericContainer<>("minio/minio:latest")
            .withExposedPorts(9000)
            .withEnv("MINIO_ROOT_USER", "minioadmin")
            .withEnv("MINIO_ROOT_PASSWORD", "minioadmin123")
            .withCommand("server", "/data")
            .waitingFor(Wait.forHttp("/minio/health/live").forPort(9000));

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("minio.endpoint",
                () -> "http://" + minio.getHost() + ":" + minio.getMappedPort(9000));
        registry.add("minio.access-key", () -> "minioadmin");
        registry.add("minio.secret-key", () -> "minioadmin123");
        registry.add("minio.bucket", () -> "test-bucket");
    }

    @LocalServerPort
    int port;

    @Autowired
    RestTemplateBuilder builder;

    @Test
    void adminSeededCredentialsLogin() {
        ResponseEntity<Map> res = login("admin@lms.com", "admin123");
        assertThat(res.getStatusCode().is2xxSuccessful())
                .as("admin@lms.com / admin123 should authenticate. Body: " + res.getBody())
                .isTrue();
        assertThat(res.getBody()).containsKey("token");
        assertThat(res.getBody().get("role")).isEqualTo("ADMIN");
    }

    @Test
    void testUserSeededCredentialsLogin() {
        ResponseEntity<Map> res = login("test@example.com", "Password123");
        assertThat(res.getStatusCode().is2xxSuccessful())
                .as("test@example.com / Password123 should authenticate. Body: " + res.getBody())
                .isTrue();
        assertThat(res.getBody()).containsKey("token");
    }

    @Test
    void invalidPasswordRejected() {
        try {
            login("admin@lms.com", "wrong-password");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            assertThat(e.getStatusCode().is4xxClientError()).isTrue();
            return;
        }
        throw new AssertionError("expected 4xx for wrong password");
    }

    private ResponseEntity<Map> login(String email, String password) {
        RestTemplate rest = builder.build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
        return rest.exchange(
                "http://localhost:" + port + "/api/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );
    }
}
