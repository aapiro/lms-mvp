package com.lms.bdd.steps;

import com.lms.bdd.TestDataFactory;
import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.lessons.Lesson;
import com.lms.lessons.LessonRepository;
import com.lms.users.User;
import io.cucumber.java.es.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class CourseSteps {

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private TestDataFactory dataFactory;
    @Autowired private CourseRepository courseRepository;
    @Autowired private LessonRepository lessonRepository;

    private ResponseEntity<String> lastResponse;
    private String adminToken;
    private User adminUser;
    private Course testCourse;

    @Dado("que existen cursos con estados {string} y {string}")
    public void cursos_con_estados(String status1, String status2) {
        adminUser = dataFactory.createAdmin("admin-course@test.com", "Admin123", "Admin");
        dataFactory.createCourse("Curso Published", BigDecimal.TEN, Course.CourseStatus.valueOf(status1), adminUser.getId());
        dataFactory.createCourse("Curso Draft", BigDecimal.TEN, Course.CourseStatus.valueOf(status2), adminUser.getId());
    }

    @Cuando("consulto el catálogo de cursos sin autenticación")
    public void consultar_catalogo() {
        lastResponse = restTemplate.getForEntity("/api/courses", String.class);
    }

    @Entonces("solo veo los cursos con estado {string}")
    public void verificar_solo_estado(String status) {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lastResponse.getBody()).contains("Curso Published");
        assertThat(lastResponse.getBody()).doesNotContain("Curso Draft");
    }

    @Dado("que estoy autenticado como admin")
    public void autenticar_admin() {
        adminUser = dataFactory.createAdmin("admin-step@test.com", "Admin123", "Admin");
        var loginRes = restTemplate.postForEntity("/api/auth/login",
                Map.of("email", "admin-step@test.com", "password", "Admin123"), Map.class);
        adminToken = (String) loginRes.getBody().get("token");
    }

    @Cuando("creo un curso con título {string} y precio {double}")
    public void crear_curso(String title, double price) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        var body = Map.of("title", title, "description", "Desc", "price", price);
        lastResponse = restTemplate.exchange("/api/admin/courses", HttpMethod.POST,
                new HttpEntity<>(body, headers), String.class);
    }

    @Entonces("el curso se crea exitosamente")
    public void curso_creado() {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Y("el curso aparece en la lista de cursos")
    public void curso_en_lista() {
        assertThat(lastResponse.getBody()).contains("Nuevo Curso");
    }

    @Dado("existe un curso en estado {string}")
    public void existe_curso_estado(String status) {
        if (adminUser == null) adminUser = dataFactory.createAdmin("admin-c2@test.com", "Admin123", "Admin");
        testCourse = dataFactory.createCourse("Curso " + status, BigDecimal.TEN,
                Course.CourseStatus.valueOf(status), adminUser.getId());
    }

    @Cuando("cambio el estado del curso a {string}")
    public void cambiar_estado(String status) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        lastResponse = restTemplate.exchange("/api/admin/courses/" + testCourse.getId() + "/status",
                HttpMethod.PUT, new HttpEntity<>(Map.of("status", status), headers), String.class);
    }

    @Entonces("el curso tiene estado {string}")
    public void verificar_estado(String status) {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Course updated = courseRepository.findById(testCourse.getId()).orElseThrow();
        assertThat(updated.getStatus().name()).isEqualTo(status);
    }

    @Dado("que existe un curso publicado con lecciones")
    public void curso_con_lecciones() {
        if (adminUser == null) adminUser = dataFactory.createAdmin("admin-c3@test.com", "Admin123", "Admin");
        testCourse = dataFactory.createPublishedCourse("Curso con Lecciones", BigDecimal.ZERO, adminUser.getId());
        Lesson lesson = new Lesson();
        lesson.setCourseId(testCourse.getId());
        lesson.setTitle("Lección 1");
        lesson.setLessonOrder(1);
        lesson.setLessonType("VIDEO");
        lesson.setFileKey("test/file.mp4");
        lessonRepository.save(lesson);
    }

    @Cuando("consulto el detalle del curso")
    public void consultar_detalle() {
        lastResponse = restTemplate.getForEntity("/api/courses/" + testCourse.getId(), String.class);
    }

    @Entonces("veo el título, descripción y lecciones del curso")
    public void verificar_detalle() {
        assertThat(lastResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lastResponse.getBody()).contains("Curso con Lecciones");
        assertThat(lastResponse.getBody()).contains("Lección 1");
    }
}
