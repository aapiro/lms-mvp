-- ═══════════════════════════════════════════════════
-- Monitoring & Observability Tables
-- ═══════════════════════════════════════════════════

-- Request metrics (aggregated per minute per endpoint)
CREATE TABLE request_metrics (
    id BIGSERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    total_duration_ms BIGINT NOT NULL DEFAULT 0,
    max_duration_ms INTEGER NOT NULL DEFAULT 0,
    min_duration_ms INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_req_metrics_period ON request_metrics(period_start DESC);
CREATE INDEX idx_req_metrics_endpoint ON request_metrics(endpoint, period_start DESC);

-- Security events (login attempts, rate limits, suspicious activity)
CREATE TABLE security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_id BIGINT,
    email VARCHAR(255),
    user_agent VARCHAR(500),
    details TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_ip ON security_events(ip_address, created_at DESC);

-- Active sessions tracking
CREATE TABLE active_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    device_type VARCHAR(20),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expired BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_sessions_user ON active_sessions(user_id, expired);
CREATE INDEX idx_sessions_active ON active_sessions(expired, last_seen_at DESC);

-- Error tracking (aggregated)
CREATE TABLE error_log (
    id BIGSERIAL PRIMARY KEY,
    error_type VARCHAR(255) NOT NULL,
    message TEXT,
    stack_trace TEXT,
    endpoint VARCHAR(255),
    user_id BIGINT,
    count INTEGER NOT NULL DEFAULT 1,
    first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_error_log_type ON error_log(error_type, last_seen DESC);
