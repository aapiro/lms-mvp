// Usage: node playwright-screenshot.js <lessonId> <outputPrefix>
// Example: node playwright-screenshot.js 22 lesson-22

const { chromium } = require('playwright');

(async () => {
  const lessonId = process.argv[2];
  const outPrefix = process.argv[3] || `lesson-${lessonId}`;

  if (!lessonId) {
    console.error('Usage: node playwright-screenshot.js <lessonId> <outputPrefix>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const lessonUrl = `http://host.docker.internal:3000/lesson/${lessonId}`;
  console.log('Opening', lessonUrl);

  try {
    await page.goto(lessonUrl, { waitUntil: 'networkidle' });

    // Wait for either Plyr or native video element
    await Promise.race([
      page.waitForSelector('.plyr__video-wrapper, .video-container video', { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(2000)
    ]);

    // Give player time to initialize
    await page.waitForTimeout(1000);

    // Full page screenshot
    const fullPath = `${outPrefix}-full.png`;
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log('Saved full page screenshot to', fullPath);

    // Try to screenshot the video element if present
    const videoHandle = await page.$('.video-container video, .plyr__video-wrapper video');
    if (videoHandle) {
      const box = await videoHandle.boundingBox();
      if (box) {
        const clipPath = `${outPrefix}-player.png`;
        await page.screenshot({ path: clipPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, box.width), height: Math.max(1, box.height) } });
        console.log('Saved player screenshot to', clipPath);
      } else {
        console.warn('Could not get bounding box of video element');
      }
    } else {
      console.warn('Video element not found on page');
    }

    // Optionally try to click play (not required for screenshot)
    try {
      const playButton = await page.$('.plyr__control--overlaid, button[aria-label="Play"]');
      if (playButton) {
        await playButton.click();
        await page.waitForTimeout(1000);
        const playingPath = `${outPrefix}-playing.png`;
        await page.screenshot({ path: playingPath, fullPage: false });
        console.log('Saved playing screenshot to', playingPath);
      }
    } catch (e) {
      /* ignore */
    }

  } catch (err) {
    console.error('Error during capture:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
