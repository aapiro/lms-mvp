package com.lms.bdd.steps;

import com.lms.bdd.TestDataFactory;
import com.lms.users.User;
import io.cucumber.java.es.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class AuthSteps {

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private TestDataFactory dataFactory;
    @LocalServerPort private int port;

    private ResponseEntity<String> lastResponse;

    @Dado("que el sistema está disponible")
    public void sistema_disponible() {
        // Spring Boot Test guarantees this
    }

    @Dado("que existe un usuario con email {string}")
    public void existe_usuario(String email) {
        dataFactory.createStudent(email, "Password123", "Test User");
    }

    @Dado("que existe un usuario con email {string} y contraseña {string}")
    public void existe_usuario_con_password(String email, String password) {
        dataFactory.createStudent(email, password, "Test User");
    }

    @Cuando("me registro con email {string}, contraseña {string} y nombre {string}")
    public void registro(String email, String password, String nombre) {
        var body = Map.of("email", email, "password", password, "fullName", nombre);
        lastResponse = restTemplate.postForEntity("/api/auth/register", body, String.class);
    }

    @Cuando("inicio sesión con email {string} y contraseña {string}")
    public void login(String email, String password) {
        var body = Map.of("email", email, "password", password);
        lastResponse = restTemplate.postForEntity("/api/auth/login", body, String.class);
    }

    @Cuando("accedo a {string} sin token de autenticación")
    public void acceso_sin_token(String path) {
        lastResponse = restTemplate.getForEntity(path, String.class);
    }

    @Entonces("recibo un token JWT válido")
    public void verificar_jwt() {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lastResponse.getBody()).contains("token");
    }

    @Entonces("mi rol es {string}")
    public void verificar_rol(String role) {
        assertThat(lastResponse.getBody()).contains(role);
    }

    @Entonces("recibo un error {int}")
    public void verificar_error(int status) {
        assertThat(lastResponse.getStatusCode().value()).isEqualTo(status);
    }
}
