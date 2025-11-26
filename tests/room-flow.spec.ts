import { test, expect } from '@playwright/test';

test.describe('Room Creation and Navigation Flow', () => {
  test('should create room with questions and display them', async ({ page }) => {
    console.log('🚀 Starting room creation test...');

    // Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });

    console.log('📍 At homepage, looking for Create Room button...');

    // Look for Create Room button
    const createButton = page.locator('button:has-text("Create Room")');
    await expect(createButton).toBeVisible({ timeout: 10000 });

    // Listen for console errors and warnings
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`Page ${msg.type().toUpperCase()}: ${msg.text()}`);
      }
    });

    console.log('✅ Found Create Room button, clicking...');
    await createButton.click();

    // Wait for redirection to room page
    console.log('⏳ Waiting for redirection to room...');
    await page.waitForURL(/\/rooms\//, { timeout: 15000 });

    // Wait for setup page content
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-setup-page.png', fullPage: true });

    console.log('📍 At setup page...');
    console.log('Current URL:', page.url());

    // Check if we're on the setup page
    await expect(page.locator('h1')).toContainText('Setup Your Room');

    // Select some questions
    console.log('🎯 Selecting questions...');

    // Click on the first 3 suggested questions
    // The structure is a div with onClick handler, so we look for the text content or class
    console.log('⏳ Waiting for questions to load...');
    await page.waitForSelector('[data-testid="suggested-question"]', { timeout: 10000 });

    const questionItems = page.locator('[data-testid="suggested-question"]');
    const count = await questionItems.count();
    console.log(`Found ${count} suggested questions`);

    if (count > 0) {
      await questionItems.nth(0).click();
      console.log('✅ Selected first question');

      if (count > 1) {
        await questionItems.nth(1).click();
        console.log('✅ Selected second question');
      }
    }

    await page.screenshot({ path: 'test-results/03-questions-selected.png', fullPage: true });

    // Look for Start Playing button
    const startButton = page.locator('button:has-text("Start Playing")');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    console.log('✅ Start Playing button is enabled, clicking...');
    await startButton.click();

    // Wait for room page reload
    console.log('⏳ Waiting for page reload...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/04-room-page.png', fullPage: true });

    console.log('📍 At room page...');

    // Check if we're in the room
    const roomTitle = await page.locator('h1').first().textContent();
    console.log('Room page title:', roomTitle);

    // Check for empty state or questions
    const noQuestions = page.locator('text=No Questions Yet');
    const questionsHeader = page.locator('text=Answer Questions to Share Secrets');

    if (await noQuestions.isVisible()) {
      console.log('❌ Found "No Questions Yet" state. Questions were not saved or loaded.');
    } else if (await questionsHeader.isVisible()) {
      console.log('✅ Found Question Prompts section');
    } else {
      console.log('❓ Found neither questions nor empty state. Page content might be loading or different.');
    }

    // Expect questions to be visible
    await expect(questionsHeader).toBeVisible({ timeout: 10000 });

    console.log('✅ Found Question Prompts section');

    // Check if questions are displayed
    const questionCards = page.locator('[data-testid="question-card"]');
    const cardCount = await questionCards.count();
    console.log(`Found ${cardCount} question cards`);
    expect(cardCount).toBeGreaterThan(0);

    // Final verification
    const url = page.url();
    console.log('Final URL:', url);

    if (url.includes('/rooms/')) {
      console.log('🎉 Successfully navigated to room!');
    } else {
      console.log('❌ Not in a room URL');
    }
  });
});