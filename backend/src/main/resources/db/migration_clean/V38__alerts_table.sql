CREATE TABLE alert_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_admin BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE alert_history (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT REFERENCES alert_rules(id),
    rule_name VARCHAR(255) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    message TEXT,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alert_history_time ON alert_history(triggered_at DESC);

-- Seed default alert rules
INSERT INTO alert_rules (name, metric, condition, threshold) VALUES
  ('Error rate alto', 'error_rate_percent', 'GREATER_THAN', 5.0),
  ('Tiempo respuesta lento', 'avg_response_ms', 'GREATER_THAN', 2000),
  ('Memoria heap alta', 'heap_usage_percent', 'GREATER_THAN', 85),
  ('Logins fallidos excesivos', 'failed_logins_1h', 'GREATER_THAN', 20);
