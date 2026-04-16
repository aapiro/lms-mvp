async function waitForOk(
  url: string,
  label: string,
  timeoutMs: number
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return;
      lastErr = new Error(`${label} HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} not reachable within ${timeoutMs}ms: ${url}. Last error: ${lastErr}`);
}

async function assertSeededAdminLogin(apiUrl: string): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@lms.com';
  const password = process.env.E2E_ADMIN_PASSWORD ?? 'admin123';
  const loginUrl = `${apiUrl}/auth/login`;
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `E2E global-setup: admin login failed ${res.status}: ${text}\n` +
        `URL: ${loginUrl}\n` +
        `Check PLAYWRIGHT_API_URL, restart backend (dev profile re-syncs demo passwords), Flyway V27, docker volumes, E2E_ADMIN_*. See README: Tests E2E.`
    );
  }
  let body: { token?: string };
  try {
    body = JSON.parse(text) as { token?: string };
  } catch {
    throw new Error(`E2E global-setup: login response is not JSON: ${text.slice(0, 200)}`);
  }
  if (!body.token) {
    throw new Error(`E2E global-setup: login OK but no token: ${text.slice(0, 200)}`);
  }
}

export default async function globalSetup(): Promise<void> {
  const apiUrl = (process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');
  const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const timeoutMs = Number(process.env.PLAYWRIGHT_READY_TIMEOUT_MS ?? 120000);

  await waitForOk(`${apiUrl}/courses`, 'API', timeoutMs);
  await assertSeededAdminLogin(apiUrl);
  await waitForOk(baseURL, 'Frontend', timeoutMs);
}
