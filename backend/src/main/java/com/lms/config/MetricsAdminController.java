package com.lms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/metrics")
public class MetricsAdminController {

    private final MetricsService metricsService;

    @Autowired
    public MetricsAdminController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, Object> data = metricsService.getSummary();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/sales-timeseries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> salesTimeseries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "day") String interval
    ) {
        if (from.isAfter(to)) {
            LocalDate tmp = from; from = to; to = tmp;
        }
        List<Map<String, Object>> series = metricsService.getSalesTimeSeries(from, to, interval);
        return ResponseEntity.ok(series);
    }
}
