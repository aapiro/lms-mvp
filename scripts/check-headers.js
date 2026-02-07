const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const url = process.argv[2] || 'http://host.docker.internal:3000/';
  console.log('Opening', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const headers = await page.$$eval('header', els => els.map(e => ({ outer: e.outerHTML.slice(0,300), class: e.className })));
    console.log('HEADER_COUNT=' + headers.length);
    headers.forEach((h, i) => console.log(`HEADER[${i}]=`, h));
    const path = `/workspace/home-full-debug.png`;
    await page.screenshot({ path, fullPage: true });
    console.log('Saved screenshot to', path);
  } catch (e) {
    console.error('Error:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
