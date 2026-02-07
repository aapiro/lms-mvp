-- Cambiar payload de JSONB a TEXT para evitar problemas de mapeo simple
ALTER TABLE audit_log ALTER COLUMN payload TYPE TEXT USING payload::text;
