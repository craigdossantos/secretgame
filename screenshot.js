/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'homepage-updated.png', fullPage: true });
  await browser.close();
})();