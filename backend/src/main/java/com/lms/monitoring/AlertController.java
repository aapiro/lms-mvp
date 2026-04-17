package com.lms.monitoring;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/rules")
    public ResponseEntity<?> getRules() {
        return ResponseEntity.ok(alertService.getRules());
    }

    @PostMapping("/rules")
    public ResponseEntity<?> createRule(@RequestBody AlertRule rule) {
        return ResponseEntity.ok(alertService.saveRule(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<?> updateRule(@PathVariable Long id, @RequestBody AlertRule rule) {
        rule.setId(id);
        return ResponseEntity.ok(alertService.saveRule(rule));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        alertService.deleteRule(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(alertService.getRecentAlerts());
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<?> getUnacknowledged() {
        return ResponseEntity.ok(alertService.getUnacknowledgedAlerts());
    }

    @PutMapping("/history/{id}/acknowledge")
    public ResponseEntity<?> acknowledge(@PathVariable Long id) {
        alertService.acknowledge(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** Manual trigger for testing */
    @PostMapping("/check")
    public ResponseEntity<?> manualCheck() {
        alertService.checkAlerts();
        return ResponseEntity.ok(Map.of("checked", true));
    }
}
