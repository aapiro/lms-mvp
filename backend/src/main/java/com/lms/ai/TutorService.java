package com.lms.ai;

import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.lessons.Lesson;
import com.lms.lessons.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorService {

    private final TutorConversationRepository conversationRepo;
    private final TutorMessageRepository messageRepo;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    @Value("${ai.tutor.enabled:false}")
    private boolean enabled;

    @Value("${ai.tutor.api-key:}")
    private String apiKey;

    @Value("${ai.tutor.model:claude-sonnet-4-20250514}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get or create a conversation for user+course.
     */
    @Transactional
    public TutorConversation getOrCreateConversation(Long userId, Long courseId) {
        return conversationRepo.findFirstByUserIdAndCourseIdOrderByUpdatedAtDesc(userId, courseId)
                .orElseGet(() -> {
                    TutorConversation conv = new TutorConversation();
                    conv.setUserId(userId);
                    conv.setCourseId(courseId);
                    return conversationRepo.save(conv);
                });
    }

    /**
     * Start a new conversation (resets history).
     */
    @Transactional
    public TutorConversation startNewConversation(Long userId, Long courseId) {
        TutorConversation conv = new TutorConversation();
        conv.setUserId(userId);
        conv.setCourseId(courseId);
        return conversationRepo.save(conv);
    }

    /**
     * Get message history for a conversation.
     */
    public List<TutorMessage> getHistory(Long conversationId) {
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    /**
     * Send a message and get AI response.
     */
    @Transactional
    public TutorMessage chat(Long conversationId, Long courseId, String userMessage) {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            // Save user message and return a disabled notice
            saveMessage(conversationId, "user", userMessage);
            return saveMessage(conversationId, "assistant",
                    "El tutor AI no está habilitado en este momento. Contacta al administrador.");
        }

        // Save user message
        saveMessage(conversationId, "user", userMessage);

        // Build context from course content
        String systemPrompt = buildSystemPrompt(courseId);

        // Get conversation history (last 20 messages for context window)
        List<TutorMessage> history = messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Map<String, String>> messages = new ArrayList<>();
        int start = Math.max(0, history.size() - 20);
        for (int i = start; i < history.size(); i++) {
            TutorMessage msg = history.get(i);
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        // Call Claude API
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("max_tokens", 1024);
            body.put("system", systemPrompt);
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.anthropic.com/v1/messages",
                    HttpMethod.POST, request, Map.class
            );

            String assistantContent = extractContent(response.getBody());
            return saveMessage(conversationId, "assistant", assistantContent);

        } catch (Exception e) {
            log.error("AI Tutor call failed", e);
            return saveMessage(conversationId, "assistant",
                    "Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo.");
        }
    }

    private TutorMessage saveMessage(Long conversationId, String role, String content) {
        TutorMessage msg = new TutorMessage();
        msg.setConversationId(conversationId);
        msg.setRole(role);
        msg.setContent(content);
        return messageRepo.save(msg);
    }

    private String buildSystemPrompt(Long courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return "Eres un tutor educativo. Responde en español de forma clara y pedagógica.";
        }

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        String lessonList = lessons.stream()
                .map(l -> "- " + l.getTitle() + " (" + l.getLessonType() + ")")
                .collect(Collectors.joining("\n"));

        return "Eres un tutor AI experto para el curso \"" + course.getTitle() + "\".\n\n" +
                "DESCRIPCIÓN DEL CURSO:\n" + (course.getDescription() != null ? course.getDescription() : "Sin descripción") + "\n\n" +
                "CONTENIDO DEL CURSO (lecciones):\n" + (lessonList.isEmpty() ? "Sin lecciones aún" : lessonList) + "\n\n" +
                "INSTRUCCIONES:\n" +
                "- Responde SIEMPRE en español.\n" +
                "- Usa un enfoque socrático: guía al estudiante con preguntas en vez de dar respuestas directas cuando sea apropiado.\n" +
                "- Si el estudiante pregunta algo fuera del tema del curso, redirige amablemente al contenido del curso.\n" +
                "- Cuando expliques conceptos, usa ejemplos concretos y analogías.\n" +
                "- Si el estudiante parece confundido, sugiere qué lección del curso debería revisar.\n" +
                "- Sé conciso pero completo. Usa formato markdown para claridad.\n" +
                "- Anima al estudiante y celebra su progreso.";
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        if (body == null) return "Error: respuesta vacía del servicio AI.";
        List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");
        if (content != null && !content.isEmpty()) {
            return (String) content.get(0).get("text");
        }
        return "Error: no se pudo extraer la respuesta del servicio AI.";
    }
}
