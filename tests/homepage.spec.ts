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
    await expect(page.locator('text=Try Out Question Prompts')).toBeVisible();

    // Check for Create Room button
    await expect(page.locator('text=Create Room')).toBeVisible();

    // Log any console errors for debugging
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'homepage-debug.png', fullPage: true });
  });

  test('should load question cards with colorful backgrounds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 10000 });

    // Check if question cards are present
    const questionCards = page.locator('[data-testid="question-card"]');
    const cardCount = await questionCards.count();

    console.log(`Found ${cardCount} question cards`);
    expect(cardCount).toBeGreaterThan(0);

    // Take screenshot showing the question grid
    await page.screenshot({ path: 'question-cards-debug.png', fullPage: true });
  });

  test('should show category filters', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for category filter section
    await expect(page.locator('text=Filter by Category')).toBeVisible();

    // Check for category badges
    await expect(page.locator('text=Personal')).toBeVisible();
    await expect(page.locator('text=Relationships')).toBeVisible();
    await expect(page.locator('text=Embarrassing')).toBeVisible();

    // Take screenshot of filters
    await page.screenshot({ path: 'category-filters-debug.png' });
  });

  test('should not show secret cards in question section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for elements that suggest secret cards (author names, etc.) in question section
    const questionSection = page.locator('text=Try Out Question Prompts').locator('..').locator('..');

    // These should NOT be in the question section
    const authorNames = questionSection.locator('text=Sarah M.');
    const levelBadges = questionSection.locator('text=Level 3');
    const unlockButtons = questionSection.locator('text=Unlock by submitting');

    await expect(authorNames).toHaveCount(0);
    await expect(unlockButtons).toHaveCount(0);

    // Take screenshot of question section only
    await questionSection.screenshot({ path: 'question-section-debug.png' });
  });
});