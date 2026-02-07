package com.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppConfigService {
    private final AppConfigRepository repo;

    @Transactional(readOnly = true)
    public String get(String key, String defaultValue) {
        return repo.findById(key).map(AppConfig::getValue).orElse(defaultValue);
    }

    @Transactional
    public void set(String key, String value) {
        AppConfig c = new AppConfig();
        c.setKey(key);
        c.setValue(value);
        repo.save(c);
    }

    @Transactional
    public void delete(String key) {
        repo.deleteById(key);
    }
}
