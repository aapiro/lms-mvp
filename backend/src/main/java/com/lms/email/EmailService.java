package com.lms.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@lms-platform.com}")
    private String fromAddress;

    @Value("${mail.enabled:false}")
    private boolean enabled;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendWelcome(String to, String fullName) {
        send(to, "Bienvenido a LMS Platform",
                "Hola " + fullName + ",\n\n" +
                "Tu cuenta ha sido creada exitosamente. Ya puedes explorar nuestro catálogo de cursos.\n\n" +
                "Accede aquí: " + frontendUrl + "\n\n" +
                "¡Buen aprendizaje!\nEquipo LMS Platform");
    }

    public void sendPurchaseConfirmation(String to, String courseName, String amount) {
        send(to, "Compra confirmada: " + courseName,
                "Tu compra ha sido procesada exitosamente.\n\n" +
                "Curso: " + courseName + "\n" +
                "Monto: $" + amount + "\n\n" +
                "Ya puedes acceder al contenido del curso.\n\n" +
                "Equipo LMS Platform");
    }

    public void sendPasswordReset(String to, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password/" + resetToken;
        send(to, "Restablecer contraseña",
                "Recibimos una solicitud para restablecer tu contraseña.\n\n" +
                "Haz clic en el siguiente enlace (válido por 1 hora):\n" +
                resetUrl + "\n\n" +
                "Si no solicitaste este cambio, ignora este email.\n\n" +
                "Equipo LMS Platform");
    }

    public void sendCourseCompleted(String to, String fullName, String courseName) {
        send(to, "¡Felicidades! Completaste " + courseName,
                "Hola " + fullName + ",\n\n" +
                "¡Has completado el curso \"" + courseName + "\"!\n\n" +
                "Revisa tu perfil para ver tu certificado.\n\n" +
                "¡Sigue aprendiendo!\nEquipo LMS Platform");
    }

    private void send(String to, String subject, String body) {
        if (!enabled) {
            log.info("Email disabled. Would send to={}, subject={}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to={}", to, e);
        }
    }
}
