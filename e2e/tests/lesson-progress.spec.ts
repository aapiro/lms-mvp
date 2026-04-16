import { test, expect } from '@playwright/test';
import { loginViaApi } from '../helpers/auth';
import { e2eUser } from '../helpers/credentials';
import { API_URL } from '../helpers/env';
import { getFirstLessonForE2E, SAMPLE_COURSE_TITLE } from '../helpers/courses';

test('purchased user can complete lesson or sees completed state', async ({
  page,
  request,
}) => {
  const { lessonId, courseTitle } = await getFirstLessonForE2E(request, API_URL);
  test.skip(
    courseTitle !== SAMPLE_COURSE_TITLE,
    'Seeded purchase is for Sample Course; skip if that course is missing'
  );

  await loginViaApi(page, API_URL, e2eUser);

  await page.goto(`/lesson/${lessonId}`);
  await expect(page.locator('.lesson-actions')).toBeVisible({ timeout: 30000 });

  const actionButton = page.locator('.lesson-actions button').first();
  await expect(actionButton).toBeVisible();
  const label = (await actionButton.textContent())?.trim() ?? '';

  if (label === 'Mark as Completed') {
    await actionButton.click();
    await expect(
      page.locator('.lesson-actions button').filter({ hasText: 'Unmark' })
    ).toBeVisible({ timeout: 20000 });
  } else {
    await expect(actionButton).toHaveText(/Unmark/);
  }
});
