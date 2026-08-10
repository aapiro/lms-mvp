import type { Page } from '@playwright/test';

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/$/, '');
}

export async function loginViaApi(
  page: Page,
  apiUrl: string,
  credentials: { email: string; password: string }
): Promise<void> {
  const base = normalizeApiUrl(apiUrl);
  const loginUrl = `${base}/auth/login`;
  const res = await page.request.post(loginUrl, {
    data: credentials,
  });
  if (!res.ok()) {
    const text = await res.text();
    throw new Error(
      `Login failed ${res.status()}: ${text}\n` +
        `URL: ${loginUrl}\n` +
        `Check PLAYWRIGHT_API_URL, DB seeds (README: Tests E2E), and E2E_ADMIN_* / E2E_USER_* if overridden.`
    );
  }
  const body = (await res.json()) as {
    token: string;
    userId?: number;
    email?: string;
    fullName?: string;
    role?: string;
  };
  const { token, ...userData } = body;
  if (!token) throw new Error('Login response missing token');

  // localStorage is not accessible on about:blank (opaque origin) — use the app origin
  await page.goto('/');
  await page.evaluate(
    ({ token: t, userData: u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    },
    { token, userData }
  );
  await page.goto('/');
}
