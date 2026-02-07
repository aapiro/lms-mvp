package com.lms.config;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dev")
@RequiredArgsConstructor
public class DevAdminController {
    private final AppConfigService appConfigService;

    private static final String KEY_MAINTENANCE = "maintenance_mode";
    private static final String KEY_DEV_PAYMENTS = "dev_payments";

    @GetMapping
    public ResponseEntity<DevConfigDto> get() {
        String maintenance = appConfigService.get(KEY_MAINTENANCE, "false");
        String devPayments = appConfigService.get(KEY_DEV_PAYMENTS, "false");
        DevConfigDto dto = new DevConfigDto();
        dto.setMaintenance(Boolean.parseBoolean(maintenance));
        dto.setDevPayments(Boolean.parseBoolean(devPayments));
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<DevConfigDto> set(@RequestBody DevConfigDto dto) {
        appConfigService.set(KEY_MAINTENANCE, Boolean.toString(dto.isMaintenance()));
        appConfigService.set(KEY_DEV_PAYMENTS, Boolean.toString(dto.isDevPayments()));
        return get();
    }

    @Data
    public static class DevConfigDto {
        private boolean maintenance;
        private boolean devPayments;
    }
}
