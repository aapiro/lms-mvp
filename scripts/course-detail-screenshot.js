const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const url = process.argv[2] || 'http://host.docker.internal:3000/course/4';
  console.log('Opening', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/workspace/course-detail-debug.png', fullPage: true });
    console.log('Saved screenshot to /workspace/course-detail-debug.png');
  } catch (e) {
    console.error('Error:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
