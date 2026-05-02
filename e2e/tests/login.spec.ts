import { test, expect } from '@playwright/test';
import { e2eAdmin, e2eUser } from '../helpers/credentials';

test.describe('Login flow (frontend ↔ backend integration)', () => {
  test('admin seeded credentials authenticate and reach dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(e2eAdmin.email);
    await page.getByLabel('Password').fill(e2eAdmin.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token, 'JWT token persisted to localStorage').toBeTruthy();
  });

  test('user seeded credentials authenticate and see catalog', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(e2eUser.email);
    await page.getByLabel('Password').fill(e2eUser.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { name: 'Available Courses' })
    ).toBeVisible();
  });

  test('invalid password shows error and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(e2eAdmin.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeFalsy();
  });
});
