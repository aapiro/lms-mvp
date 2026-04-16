import { test, expect } from '@playwright/test';
import { e2eUser } from '../helpers/credentials';

test('login via UI with seeded user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(e2eUser.email);
  await page.getByLabel('Password').fill(e2eUser.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Available Courses' })).toBeVisible();
});
