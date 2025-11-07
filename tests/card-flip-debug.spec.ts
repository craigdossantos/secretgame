import { test, expect } from '@playwright/test';

test.describe('Card Flip Position Debug', () => {
  test('measure card position before and after flip', async ({ page }) => {
    // Navigate to the room page
    await page.goto('http://localhost:3003/rooms/5JI3ES');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the first question card
    const card = page.locator('[data-testid="question-card"]').first();
    await card.waitFor({ state: 'visible' });

    // Get initial position and dimensions
    const initialBox = await card.boundingBox();
    console.log('Initial card position:', initialBox);

    // Get the outer motion.div (perspective container)
    const outerContainer = card.locator('xpath=..');
    const outerBox = await outerContainer.boundingBox();
    console.log('Outer container position:', outerBox);

    // Get all computed styles before flip
    const beforeStyles = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="question-card"]');
      if (!card) return null;

      const outerDiv = card.closest('.perspective-1000');
      const innerDiv = card.querySelector('.preserve-3d');

      const outerStyle = window.getComputedStyle(outerDiv as Element);
      const innerStyle = window.getComputedStyle(innerDiv as Element);
      const cardStyle = window.getComputedStyle(card);

      return {
        outer: {
          transform: outerStyle.transform,
          position: outerStyle.position,
          top: outerStyle.top,
          left: outerStyle.left,
          height: outerStyle.height,
          marginTop: outerStyle.marginTop,
          marginBottom: outerStyle.marginBottom
        },
        inner: {
          transform: innerStyle.transform,
          position: innerStyle.position,
          transformStyle: innerStyle.transformStyle
        },
        card: {
          position: cardStyle.position,
          top: cardStyle.top,
          left: cardStyle.left
        }
      };
    });

    console.log('Before flip styles:', JSON.stringify(beforeStyles, null, 2));

    // Click to flip the card
    await card.click();

    // Wait for flip animation to complete
    await page.waitForTimeout(700); // 600ms animation + buffer

    // Get position after flip
    const afterBox = await card.boundingBox();
    console.log('After flip position:', afterBox);

    const outerBoxAfter = await outerContainer.boundingBox();
    console.log('Outer container after flip:', outerBoxAfter);

    // Get all computed styles after flip
    const afterStyles = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="question-card"]');
      if (!card) return null;

      const outerDiv = card.closest('.perspective-1000');
      const innerDiv = card.querySelector('.preserve-3d');

      const outerStyle = window.getComputedStyle(outerDiv as Element);
      const innerStyle = window.getComputedStyle(innerDiv as Element);
      const cardStyle = window.getComputedStyle(card);

      return {
        outer: {
          transform: outerStyle.transform,
          position: outerStyle.position,
          top: outerStyle.top,
          left: outerStyle.left,
          height: outerStyle.height,
          marginTop: outerStyle.marginTop,
          marginBottom: outerStyle.marginBottom
        },
        inner: {
          transform: innerStyle.transform,
          position: innerStyle.position,
          transformStyle: innerStyle.transformStyle
        },
        card: {
          position: cardStyle.position,
          top: cardStyle.top,
          left: cardStyle.left
        }
      };
    });

    console.log('After flip styles:', JSON.stringify(afterStyles, null, 2));

    // Calculate Y position change
    if (initialBox && afterBox) {
      const yDifference = afterBox.y - initialBox.y;
      console.log('Y position change:', yDifference, 'px');

      if (Math.abs(yDifference) > 5) {
        console.error(`⚠️  CARD MOVED! Y position changed by ${yDifference}px`);
      } else {
        console.log('✅ Card stayed in place (Y position change within 5px tolerance)');
      }
    }

    // Take screenshots
    await page.screenshot({ path: 'tests/screenshots/card-after-flip.png' });
  });
});
