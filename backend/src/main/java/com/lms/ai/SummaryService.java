package com.lms.ai;

import com.lms.lessons.Lesson;
import com.lms.lessons.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {

    private final LessonSummaryRepository summaryRepo;
    private final LessonRepository lessonRepository;

    @Value("${ai.tutor.enabled:false}")
    private boolean aiEnabled;

    @Value("${ai.tutor.api-key:}")
    private String apiKey;

    @Value("${ai.tutor.model:claude-sonnet-4-20250514}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, String> getSummary(Long lessonId) {
        // Check cache
        Optional<LessonSummary> cached = summaryRepo.findByLessonId(lessonId);
        if (cached.isPresent()) {
            Map<String, String> result = new LinkedHashMap<>();
            result.put("summary", cached.get().getSummary());
            result.put("keyConcepts", cached.get().getKeyConcepts());
            return result;
        }

        // Generate with AI
        if (!aiEnabled || apiKey == null || apiKey.isBlank()) {
            return Map.of("summary", "Resúmenes AI no disponibles. Contacta al administrador.", "keyConcepts", "");
        }

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return Map.of("summary", "Lección no encontrada.", "keyConcepts", "");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            String prompt = "Resume la siguiente lección de un curso online. Devuelve:\n" +
                    "1. Un resumen en 3-5 bullet points\n" +
                    "2. Los conceptos clave (separados por coma)\n\n" +
                    "Título de la lección: " + lesson.getTitle() + "\n" +
                    "Tipo: " + lesson.getLessonType() + "\n" +
                    "Duración: " + (lesson.getDurationSeconds() != null ? lesson.getDurationSeconds() / 60 + " minutos" : "N/A") + "\n\n" +
                    "Formato de respuesta:\nRESUMEN:\n- bullet 1\n- bullet 2\n\nCONCEPTOS CLAVE: concepto1, concepto2, concepto3";

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 500,
                    "messages", List.of(Map.of("role", "user", "content", prompt))
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.anthropic.com/v1/messages",
                    HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            String text = extractContent(response.getBody());

            String summary = text;
            String concepts = "";
            if (text.contains("CONCEPTOS CLAVE:")) {
                summary = text.substring(0, text.indexOf("CONCEPTOS CLAVE:")).replace("RESUMEN:", "").trim();
                concepts = text.substring(text.indexOf("CONCEPTOS CLAVE:") + 16).trim();
            }

            // Cache it
            LessonSummary ls = new LessonSummary();
            ls.setLessonId(lessonId);
            ls.setSummary(summary);
            ls.setKeyConcepts(concepts);
            summaryRepo.save(ls);

            return Map.of("summary", summary, "keyConcepts", concepts);
        } catch (Exception e) {
            log.error("Failed to generate summary for lesson {}", lessonId, e);
            return Map.of("summary", "Error generando resumen. Intenta de nuevo.", "keyConcepts", "");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        if (body == null) return "";
        List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");
        if (content != null && !content.isEmpty()) return (String) content.get(0).get("text");
        return "";
    }
}
