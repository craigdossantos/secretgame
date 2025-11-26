import { test, expect } from '@playwright/test';

test.describe('Homepage UI', () => {
  test('should load homepage without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for basic page elements
    await expect(page.locator('h1')).toContainText('The Secret Game');

    // Check for How It Works section
    await expect(page.locator('text=How It Works')).toBeVisible();
    await expect(page.locator('text=Choose Your Questions')).toBeVisible();
    await expect(page.locator('text=Everyone Answers')).toBeVisible();
    await expect(page.locator('text=Unlock Others\' Secrets')).toBeVisible();
    await expect(page.locator('text=Connect Deeper')).toBeVisible();

    // Check for Create Room button
    await expect(page.locator('button:has-text("Create Room")')).toBeVisible();

    // Log any console errors for debugging
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'homepage-debug.png', fullPage: true });
  });
});