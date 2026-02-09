-- V10__promote_ci_admin.sql
-- Promueve al usuario creado por registro de CI a rol ADMIN para permitir testing del panel de administración.
-- Idempotente: sólo actualiza si el usuario existe y no tiene rol ADMIN.

UPDATE users
SET role = 'ADMIN', updated_at = NOW()
WHERE email IN ('ci-admin@example.com','admin@lms.com')
  AND (role IS NULL OR role <> 'ADMIN');

