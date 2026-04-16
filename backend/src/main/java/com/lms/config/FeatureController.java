package com.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureToggleService featureToggleService;

    @GetMapping
    public ResponseEntity<Map<String, Boolean>> getFeatures() {
        return ResponseEntity.ok(featureToggleService.getAllFeatures());
    }
}
