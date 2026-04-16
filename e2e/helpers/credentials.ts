/** Seeded defaults match README / Flyway V2 (admin) and V3 (test user). */
export const e2eAdmin = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@lms.com',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'admin123',
};

export const e2eUser = {
  email: process.env.E2E_USER_EMAIL ?? 'test@example.com',
  password: process.env.E2E_USER_PASSWORD ?? 'Password123',
};
