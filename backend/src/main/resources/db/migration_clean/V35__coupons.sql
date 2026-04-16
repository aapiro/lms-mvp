CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed some demo coupons
INSERT INTO coupons (code, discount_percent, max_uses, expires_at, active)
VALUES
  ('BIENVENIDO20', 20, 100, NOW() + INTERVAL '90 days', true),
  ('DESCUENTO50', 50, 10, NOW() + INTERVAL '30 days', true),
  ('GRATIS100', 100, 3, NOW() + INTERVAL '7 days', true);
