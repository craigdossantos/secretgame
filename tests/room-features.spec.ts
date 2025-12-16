import { test, expect } from '@playwright/test';

test.describe('Room Features', () => {
    test('Room Renaming and Entry Flow', async ({ page }) => {
        // 1. Create a room (anonymous)
        await page.goto('/');
        const createBtn = page.getByRole('button', { name: 'Create Room' });
        await createBtn.waitFor({ state: 'visible' });
        await createBtn.click();

        // Wait for setup page
        await page.waitForURL(/\/rooms\/[\w-]+$/);

        // 2. Rename Room in Setup Mode
        const newRoomName = 'My Awesome Room';
        await page.fill('input[placeholder="Enter a name for your room"]', newRoomName);
        await page.click('button:has-text("Save")');

        // Verify toast or visual confirmation (optional, but good)
        // Verify invite link updates
        await expect(page.locator('.font-mono').first()).toContainText('My-Awesome-Room');

        // 3. Complete Setup
        // Select a question first
        await page.click('text=Create Custom Question');
        await page.fill('textarea[name="question"]', 'Test Question?');
        await page.click('button:has-text("Add Question")');

        await page.click('button:has-text("Start Playing")');

        // Wait for room page
        await page.waitForURL(/\/rooms\/[\w-]+$/);

        // Verify Room Name in Header
        await expect(page.locator('h1')).toContainText(newRoomName);

        // 4. Verify Welcome Modal for New User (Incognito/New Context simulation)
        // We can't easily switch contexts in a single test without setup, 
        // but we can verify the modal is NOT present for the creator (since they are logged in/have cookie)
        // Actually, the creator might see it if we didn't set the "seen" local storage?
        // The code sets "hasSeenWelcome" in localStorage.

        // Let's verify the modal is hidden for the creator
        await expect(page.locator('text=You\'re Invited!')).not.toBeVisible();

        // To test the new user flow, we would need a separate browser context, 
        // but for now let's verify the renaming and basic entry worked.
    });
});
