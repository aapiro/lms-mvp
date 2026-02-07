-- table for application-wide config
CREATE TABLE IF NOT EXISTS app_config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value VARCHAR(100)
);

-- insert defaults
INSERT INTO app_config (config_key, config_value) VALUES ('maintenance_mode', 'false') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO app_config (config_key, config_value) VALUES ('dev_payments', 'false') ON CONFLICT (config_key) DO NOTHING;
