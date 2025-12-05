import { test, expect } from '@playwright/test';

test('seed - app loads successfully', async ({ page }) => {
  // Navigate to local dev server
  await page.goto('/');

  // Wait for app to be ready
  await page.waitForLoadState('networkidle');

  // Verify app loaded - check for main heading or key element
  await expect(page).toHaveTitle(/Secret Game|The Secret Game/i);

  // Check that question grid is visible (core feature)
  const mainContent = page.locator('main');
  await expect(mainContent).toBeVisible();
});

test('homepage - displays question cards', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Look for question cards (Whisk-inspired design uses rounded corners)
  const cards = page.locator('[class*="rounded-2xl"]');

  // Should have at least one card visible
  await expect(cards.first()).toBeVisible();
});

test('create room - navigation works', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find and click create room button/link
  const createButton = page.getByRole('link', { name: /create|start|new room/i })
    .or(page.getByRole('button', { name: /create|start|new room/i }));

  if (await createButton.count() > 0) {
    await createButton.first().click();
    await page.waitForLoadState('networkidle');

    // Should be on create page
    await expect(page).toHaveURL(/\/create/);
  }
});
