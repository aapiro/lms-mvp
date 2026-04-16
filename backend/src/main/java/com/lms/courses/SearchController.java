package com.lms.courses;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<?> search(@RequestParam(defaultValue = "") String q) {
        if (q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        List<Course> courses = courseRepository.searchPublished(q.trim(), PageRequest.of(0, 20));
        List<Map<String, Object>> results = courses.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("title", c.getTitle());
            m.put("description", c.getDescription() != null && c.getDescription().length() > 120
                    ? c.getDescription().substring(0, 120) + "..." : c.getDescription());
            m.put("type", "COURSE");
            m.put("price", c.getPrice());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }
}
