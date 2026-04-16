import type { APIRequestContext } from '@playwright/test';

export const SAMPLE_COURSE_TITLE = 'Sample Course';

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/$/, '');
}

/**
 * Resolves the first lesson of "Sample Course" if present, otherwise the first lesson
 * of the first course returned by the API (published list for anonymous users).
 */
export async function getFirstLessonForE2E(
  request: APIRequestContext,
  apiUrl: string
): Promise<{ courseId: number; lessonId: number; courseTitle: string }> {
  const base = normalizeApiUrl(apiUrl);
  const listRes = await request.get(`${base}/courses`);
  if (!listRes.ok()) {
    throw new Error(`GET /courses failed: ${listRes.status()} ${await listRes.text()}`);
  }
  const courses = (await listRes.json()) as { id: number; title: string }[];
  const course =
    courses.find((c) => c.title === SAMPLE_COURSE_TITLE) ?? courses[0];
  if (!course) throw new Error('No courses returned from API');

  const detailRes = await request.get(`${base}/courses/${course.id}`);
  if (!detailRes.ok()) {
    throw new Error(`GET /courses/${course.id} failed: ${detailRes.status()}`);
  }
  const detail = (await detailRes.json()) as {
    lessons?: { id: number }[];
  };
  const first = detail.lessons?.[0];
  if (!first?.id) throw new Error(`No lessons on course ${course.id} (${course.title})`);

  return { courseId: course.id, lessonId: first.id, courseTitle: course.title };
}
