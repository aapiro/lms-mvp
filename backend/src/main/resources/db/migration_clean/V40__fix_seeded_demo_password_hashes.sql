-- V27 seeded hashes were invalid (copied placeholder hashes that do not match
-- any plaintext). Replace with real BCrypt hashes for the README/E2E demo
-- credentials: admin@lms.com/admin123 and test@example.com/Password123.

UPDATE users
SET password = '$2a$10$BZdrKJqeLeSwvHPfxk5Zr.W9riOH.mwoeAidxL45GzIpy7F1u3tH6', updated_at = NOW()
WHERE email = 'admin@lms.com';

UPDATE users
SET password = '$2a$10$80e9Z9nF9uVM2MJbl5UF0u1XJCDSmaBoT.VpBb5M9Qnp4I/uSw3h2', updated_at = NOW()
WHERE email = 'test@example.com';
