const { chromium } = require('playwright');
const fetch = require('node-fetch');

(async () => {
  // Obtain token via API
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.token;
  if (!token) { console.error('No token'); process.exit(2); }

  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'], headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Set localStorage token and user data
  await page.goto('about:blank');
  await page.evaluate((t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, token, { email: 'test@example.com', fullName: 'Test User', userId: 3, role: 'USER' });

  // Open lesson page
  await page.goto('http://host.docker.internal:3000/lesson/22', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check button text initially
  const initialBtn = await page.$eval('.lesson-actions button', b => b.textContent.trim());
  console.log('Initial button text:', initialBtn);

  // If it's 'Mark as Completed', click it
  if (initialBtn === 'Mark as Completed') {
    await page.click('.lesson-actions button');
    await page.waitForTimeout(1200);
  }

  // Now wait and check button text
  await page.waitForTimeout(1000);
  const afterBtn = await page.$eval('.lesson-actions button', b => b.textContent.trim());
  console.log('After click button text:', afterBtn);

  // Navigate away to home and come back
  await page.goto('http://host.docker.internal:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.goto('http://host.docker.internal:3000/lesson/22', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const finalBtn = await page.$eval('.lesson-actions button', b => b.textContent.trim());
  console.log('Final button text after navigate away and back:', finalBtn);

  await page.screenshot({ path: 'lesson-flow-debug.png', fullPage: true });
  console.log('Saved lesson-flow-debug.png');

  await browser.close();
})();
