package com.lms.config;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "app_config")
public class AppConfig {
    @Id
    @Column(name = "config_key", length = 100)
    private String key;

    @Column(name = "config_value", length = 100)
    private String value;
}
