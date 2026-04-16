import { test, expect } from '@playwright/test';

test('home shows course catalog heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Available Courses' })).toBeVisible();
});
