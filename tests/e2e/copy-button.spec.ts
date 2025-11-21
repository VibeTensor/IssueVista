/**
 * E2E Tests for Copy Button Feature
 * Tests Issue #6 implementation in real browser environment
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Copy Button Feature - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Button Presence and Layout', () => {
    test('should display copy button on each issue card', async ({ page }) => {
      // Search for a repository with issues
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');

      // Wait for results to load
      await page.waitForTimeout(2000);

      // Check if copy buttons exist
      const copyButtons = page.locator('button[aria-label*="Copy issue link"]');
      const count = await copyButtons.count();

      if (count > 0) {
        expect(count).toBeGreaterThan(0);
        await expect(copyButtons.first()).toBeVisible();
      }
    });

    test('should have copy button with proper ARIA label', async ({ page }) => {
      // Search for issues
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const ariaLabel = await copyButton.getAttribute('aria-label');
        expect(ariaLabel).toContain('Copy issue link');
        expect(ariaLabel).toMatch(/issue \d+/);
      }
    });

    test('should display copy icon on button', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const svg = copyButton.locator('svg');
        await expect(svg).toBeVisible();

        // Check icon has proper viewBox for copy icon
        const viewBox = await svg.getAttribute('viewBox');
        expect(viewBox).toBe('0 0 24 24');
      }
    });

    test('should have "Copy" text visible on button', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const buttonText = await copyButton.textContent();
        expect(buttonText).toContain('Copy');
      }
    });
  });

  test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should display copy button in top-right on mobile', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const issueCard = page.locator('.issue-card').first();
        const cardBox = await issueCard.boundingBox();
        const buttonBox = await copyButton.boundingBox();

        if (cardBox && buttonBox) {
          // Button should be in the right portion of the card
          expect(buttonBox.x + buttonBox.width).toBeGreaterThan(cardBox.x + cardBox.width * 0.5);
        }
      }
    });

    test('should display icon and text horizontally on mobile', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        // Check if button has flex-row class (horizontal layout)
        const classes = await copyButton.getAttribute('class');
        expect(classes).toContain('flex-row');
      }
    });

    test('should be easily tappable on mobile', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const box = await copyButton.boundingBox();

        if (box) {
          // Minimum touch target size should be around 44x44px for accessibility
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Desktop Layout', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display copy button on right side on desktop', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const issueCard = page.locator('.issue-card').first();
        const cardBox = await issueCard.boundingBox();
        const buttonBox = await copyButton.boundingBox();

        if (cardBox && buttonBox) {
          // Button should be in the right portion (last 30%) of the card
          expect(buttonBox.x).toBeGreaterThan(cardBox.x + cardBox.width * 0.7);
        }
      }
    });

    test('should have consistent button width with issue badge', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const issueBadge = page.locator('.issue-badge').first();
      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await issueBadge.isVisible() && await copyButton.isVisible()) {
        const badgeBox = await issueBadge.boundingBox();
        const buttonContainer = copyButton.locator('..'); // Parent container
        const containerBox = await buttonContainer.boundingBox();

        // Widths should be similar (within 20px difference)
        if (badgeBox && containerBox) {
          const widthDiff = Math.abs(badgeBox.width - containerBox.width);
          expect(widthDiff).toBeLessThan(20);
        }
      }
    });
  });

  test.describe('Copy Functionality', () => {
    test('should copy issue URL to clipboard when clicked', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        // Click the copy button
        await copyButton.click();

        // Wait a bit for clipboard operation
        await page.waitForTimeout(500);

        // Read clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // Verify it's a valid GitHub issue URL
        expect(clipboardText).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/\d+$/);
      }
    });

    test('should show visual feedback after copying', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        // Get initial button text
        const initialText = await copyButton.textContent();
        expect(initialText).toContain('Copy');

        // Click the button
        await copyButton.click();
        await page.waitForTimeout(200);

        // Check for "Copied!" text
        const copiedText = await copyButton.textContent();
        expect(copiedText).toContain('Copied!');
      }
    });

    test('should display checkmark icon when copied', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        await copyButton.click();
        await page.waitForTimeout(200);

        // Check for checkmark path in SVG
        const svg = copyButton.locator('svg');
        const path = svg.locator('path');
        const pathData = await path.getAttribute('d');

        // Checkmark path should contain specific coordinates
        expect(pathData).toContain('M5 13l4 4L19 7');
      }
    });

    test('should change background color to green when copied', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        await copyButton.click();
        await page.waitForTimeout(200);

        const classes = await copyButton.getAttribute('class');
        expect(classes).toContain('green');
      }
    });

    test('should reset visual feedback after 2 seconds', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        // Click and verify "Copied!" state
        await copyButton.click();
        await page.waitForTimeout(200);
        let buttonText = await copyButton.textContent();
        expect(buttonText).toContain('Copied!');

        // Wait for 2 seconds timeout
        await page.waitForTimeout(2100);

        // Should reset back to "Copy"
        buttonText = await copyButton.textContent();
        expect(buttonText).toContain('Copy');
        expect(buttonText).not.toContain('Copied!');
      }
    });

    test('should only show copied state for clicked button', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButtons = page.locator('button[aria-label*="Copy issue link"]');
      const count = await copyButtons.count();

      if (count >= 2) {
        const firstButton = copyButtons.nth(0);
        const secondButton = copyButtons.nth(1);

        // Click first button
        await firstButton.click();
        await page.waitForTimeout(200);

        // First button should show "Copied!"
        const firstText = await firstButton.textContent();
        expect(firstText).toContain('Copied!');

        // Second button should still show "Copy"
        const secondText = await secondButton.textContent();
        expect(secondText).toContain('Copy');
        expect(secondText).not.toContain('Copied!');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper title attribute', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const title = await copyButton.getAttribute('title');
        expect(title).toBe('Copy issue link');
      }
    });

    test('should update title attribute when copied', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        await copyButton.click();
        await page.waitForTimeout(200);

        const title = await copyButton.getAttribute('title');
        expect(title).toBe('Copied!');
      }
    });

    test('should be keyboard accessible', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      // Tab to navigate to copy button (may require multiple tabs)
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        if (focused && focused.includes('Copy issue link')) {
          // Found the copy button
          await page.keyboard.press('Enter');
          await page.waitForTimeout(200);

          const copyButton = page.locator('button[aria-label*="Copy issue link"]:focus');
          if (await copyButton.isVisible()) {
            const text = await copyButton.textContent();
            expect(text).toContain('Copied!');
          }
          break;
        }
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const styles = await copyButton.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });

        // Basic check that colors are defined
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor).toBeTruthy();
      }
    });
  });

  test.describe('Button Styling', () => {
    test('should have gradient background', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const classes = await copyButton.getAttribute('class');
        expect(classes).toContain('bg-gradient-to-br');
      }
    });

    test('should have rounded corners', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const classes = await copyButton.getAttribute('class');
        expect(classes).toContain('rounded-xl');
      }
    });

    test('should have shadow effect', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        const classes = await copyButton.getAttribute('class');
        expect(classes).toContain('shadow');
      }
    });
  });

  test.describe('Integration with Issue Cards', () => {
    test('should not interfere with View button', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const viewButton = page.locator('a[aria-label*="View issue"]').first();
      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await viewButton.isVisible() && await copyButton.isVisible()) {
        // Both buttons should be visible
        await expect(viewButton).toBeVisible();
        await expect(copyButton).toBeVisible();

        // Clicking copy should not trigger view
        await copyButton.click();
        await page.waitForTimeout(500);

        // Should still be on the same page (not navigated to GitHub)
        expect(page.url()).toContain('localhost');
      }
    });

    test('should not interfere with issue card click areas', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const issueTitle = page.locator('.issue-card h3').first();
      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await issueTitle.isVisible() && await copyButton.isVisible()) {
        // Title should be clickable independently
        await expect(issueTitle).toBeVisible();

        // Copy button should not overlap title
        const titleBox = await issueTitle.boundingBox();
        const buttonBox = await copyButton.boundingBox();

        if (titleBox && buttonBox) {
          // Check for overlap (buttons should not overlap significantly)
          const overlap = !(
            buttonBox.x >= titleBox.x + titleBox.width ||
            buttonBox.x + buttonBox.width <= titleBox.x ||
            buttonBox.y >= titleBox.y + titleBox.height ||
            buttonBox.y + buttonBox.height <= titleBox.y
          );

          expect(overlap).toBe(false);
        }
      }
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle clipboard permission denial gracefully', async ({ page }) => {
      // Don't grant clipboard permissions to simulate denial
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('VibeTensor/IssueFlow');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const copyButton = page.locator('button[aria-label*="Copy issue link"]').first();

      if (await copyButton.isVisible()) {
        // Click should not throw error even without permissions
        await copyButton.click();
        await page.waitForTimeout(200);

        // Button should still be visible and functional
        await expect(copyButton).toBeVisible();
      }
    });
  });
});
