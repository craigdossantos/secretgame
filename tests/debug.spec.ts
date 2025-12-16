import { test } from '@playwright/test';

test('Debug Home Page', async ({ page }) => {
    page.on('console', msg => console.log(`Console: ${msg.text()}`));
    page.on('pageerror', exception => console.log(`Page Error: ${exception}`));
    await page.goto('/');
    await page.waitForTimeout(2000);
    const title = await page.title();
    console.log(`Title: ${title}`);
});
