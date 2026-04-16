package com.lms.assessments;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiGradingService {

    @Value("${ai.grading.enabled:false}")
    private boolean enabled;

    @Value("${ai.grading.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    public static class AiGradeResult {
        private final int score;
        private final String feedback;
    }

    public AiGradeResult gradeOpenEnded(String questionText, String studentAnswer, int maxPoints) {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            return new AiGradeResult(0, "Calificación automática no disponible. Pendiente de revisión manual.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            String systemPrompt = "You are a teaching assistant grading student answers. " +
                    "Evaluate the answer against the question. Be fair and constructive. " +
                    "Return ONLY valid JSON: {\"score\": <0 to " + maxPoints + ">, \"feedback\": \"<brief feedback in Spanish>\"}";

            String userMessage = "Question: " + questionText +
                    "\nStudent answer: " + studentAnswer +
                    "\nMax points: " + maxPoints;

            Map<String, Object> body = Map.of(
                    "model", "claude-haiku-4-5-20251001",
                    "max_tokens", 300,
                    "system", systemPrompt,
                    "messages", List.of(Map.of("role", "user", "content", userMessage))
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.anthropic.com/v1/messages",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            if (response.getBody() != null) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
                if (content != null && !content.isEmpty()) {
                    String text = (String) content.get(0).get("text");
                    // Parse JSON from response
                    text = text.trim();
                    if (text.contains("{")) {
                        text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
                    }
                    // Simple JSON extraction
                    int score = extractInt(text, "score", 0);
                    String feedback = extractString(text, "feedback", "Evaluación completada.");
                    score = Math.max(0, Math.min(score, maxPoints));
                    return new AiGradeResult(score, feedback);
                }
            }
        } catch (Exception e) {
            log.error("AI grading failed", e);
        }

        return new AiGradeResult(0, "Error en calificación automática. Pendiente de revisión manual.");
    }

    private int extractInt(String json, String key, int defaultVal) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*(\\d+)";
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
            if (m.find()) return Integer.parseInt(m.group(1));
        } catch (Exception e) { /* ignore */ }
        return defaultVal;
    }

    private String extractString(String json, String key, String defaultVal) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
            if (m.find()) return m.group(1);
        } catch (Exception e) { /* ignore */ }
        return defaultVal;
    }
}
