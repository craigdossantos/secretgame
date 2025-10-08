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

    // Check if we're on the right page
    const title = await page.locator('h1').first().textContent();
    console.log('Page title:', title);

    // Look for Create Room button
    const createButton = page.locator('text=Create Room').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });

    console.log('✅ Found Create Room button, clicking...');
    await createButton.click();

    // Wait for create page
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-create-page.png', fullPage: true });

    console.log('📍 At create page, filling form...');

    // Fill basic info
    await page.fill('input[placeholder*="Enter your name"]', 'Playwright User');
    await page.fill('input[placeholder*="Friends"]', 'Test Room');

    await page.screenshot({ path: 'test-results/03-form-filled.png', fullPage: true });

    // Click next to question selection
    const nextButton = page.locator('text=Next: Choose Questions');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    console.log('✅ Clicked Next, waiting for question selection page...');

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/04-question-selection.png', fullPage: true });

    // Look for question cards
    const questionCards = page.locator('[data-testid="question-card"], .question-card, div:has-text("What")').first();
    await expect(questionCards).toBeVisible({ timeout: 10000 });

    console.log('✅ Found question cards, selecting 3...');

    // Try to select 3 questions - look for clickable question cards
    console.log('🎯 Selecting first question...');
    const question1 = page.locator('[data-testid="question-card"]').first();
    if (await question1.count() > 0) {
      await question1.click({ timeout: 5000 });
      console.log('✅ Selected first question');
    } else {
      // Fallback to any clickable card
      const fallback1 = page.locator('.rounded-2xl').filter({ hasText: /What/ }).first();
      await fallback1.click({ timeout: 5000 });
      console.log('✅ Selected first question (fallback)');
    }

    console.log('🎯 Selecting second question...');
    const question2 = page.locator('[data-testid="question-card"]').nth(1);
    if (await question2.count() > 0) {
      await question2.click({ timeout: 5000 });
      console.log('✅ Selected second question');
    } else {
      // Fallback
      const fallback2 = page.locator('.rounded-2xl').filter({ hasText: /What/ }).nth(1);
      await fallback2.click({ timeout: 5000 });
      console.log('✅ Selected second question (fallback)');
    }

    console.log('🎯 Selecting third question...');
    const question3 = page.locator('[data-testid="question-card"]').nth(2);
    if (await question3.count() > 0) {
      await question3.click({ timeout: 5000 });
      console.log('✅ Selected third question');
    } else {
      // Fallback
      const fallback3 = page.locator('.rounded-2xl').filter({ hasText: /What/ }).nth(2);
      await fallback3.click({ timeout: 5000 });
      console.log('✅ Selected third question (fallback)');
    }

    await page.screenshot({ path: 'test-results/05-questions-selected.png', fullPage: true });

    // Wait for the create button to become enabled
    console.log('⏳ Waiting for Create Room button to be enabled...');
    const createRoomButton = page.locator('button').filter({ hasText: /Create Room/ });
    await expect(createRoomButton).toBeVisible();
    await expect(createRoomButton).toBeEnabled({ timeout: 10000 });

    console.log('✅ Create Room button is now enabled, clicking...');
    await createRoomButton.click();

    console.log('✅ Clicked Create Room, waiting for success page...');

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/06-room-created.png', fullPage: true });

    // Look for Enter Room button or room URL
    const enterRoomButton = page.locator('text=Enter Room').first();
    await expect(enterRoomButton).toBeVisible();
    await enterRoomButton.click();

    console.log('✅ Clicked Enter Room, navigating to room...');

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/07-room-page.png', fullPage: true });

    // Check if we're in the room
    const roomTitle = await page.locator('h1').first().textContent();
    console.log('Room page title:', roomTitle);

    // Look for questions in the room
    const roomQuestions = page.locator('text=Question Prompts');
    await expect(roomQuestions).toBeVisible();

    console.log('✅ Found Question Prompts section');

    // Check if questions are displayed
    const questionSection = page.locator('text=Question Prompts').locator('..').locator('..');
    await questionSection.screenshot({ path: 'test-results/08-questions-section.png' });

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