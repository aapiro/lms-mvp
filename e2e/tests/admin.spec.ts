import { test, expect } from '@playwright/test';
import { loginViaApi } from '../helpers/auth';
import { e2eAdmin } from '../helpers/credentials';
import { API_URL } from '../helpers/env';

test('admin route loads for seeded admin after API login', async ({ page }) => {
  await loginViaApi(page, API_URL, e2eAdmin);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
});
