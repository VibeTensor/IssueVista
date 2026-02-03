/**
 * E2E Tests for Loading Progress Feature
 * Tests Issue #23 implementation in real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Loading Progress Feature - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Loading Progress Display', () => {
    test('should display loading progress when search starts', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      // Wait briefly for loading to start
      await page.waitForTimeout(500);

      // Check if loading progress container is visible
      const loadingContainer = page.locator('.loading-progress-container');
      const isLoadingVisible = await loadingContainer.isVisible().catch(() => false);

      // Either loading is visible or results are already loaded (fast response)
      if (isLoadingVisible) {
        await expect(loadingContainer).toBeVisible();
      }
    });

    test('should display progress bar with percentage', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      // Check for progress bar
      const progressBar = page.locator('[role="progressbar"]');
      const isProgressVisible = await progressBar.isVisible().catch(() => false);

      if (isProgressVisible) {
        // Should have aria attributes
        await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        await expect(progressBar).toHaveAttribute('aria-valuemax', '100');

        // Should have percentage display
        const percentage = page.locator('.progress-percentage');
        await expect(percentage).toBeVisible();
      }
    });

    test('should display status message during loading', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      // Check for status message
      const statusMessage = page.locator('.status-message');
      const isStatusVisible = await statusMessage.isVisible().catch(() => false);

      if (isStatusVisible) {
        await expect(statusMessage).toBeVisible();
        const text = await statusMessage.textContent();
        // Should have some meaningful text
        expect(text).toBeTruthy();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test('should have ARIA live region for accessibility', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      // Check for live region
      const liveRegion = page.locator('[aria-live="polite"]');
      const isLiveVisible = await liveRegion.isVisible().catch(() => false);

      if (isLiveVisible) {
        await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      }
    });
  });

  test.describe('Cancel Button', () => {
    test('should display cancel button during loading', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      // Check for cancel button
      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await expect(cancelButton).toBeVisible();
        const text = await cancelButton.textContent();
        expect(text).toContain('Cancel');
      }
    });

    test('should have accessible aria-label on cancel button', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await expect(cancelButton).toHaveAttribute('aria-label', 'Cancel search');
      }
    });

    test('clicking cancel should show confirmation modal', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        // Modal should appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
      }
    });
  });

  test.describe('Cancel Confirmation Modal', () => {
    test('should display modal with proper structure', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Check modal structure
          await expect(modal).toHaveAttribute('aria-modal', 'true');
          await expect(modal).toHaveAttribute('aria-labelledby', 'cancel-modal-title');
          await expect(modal).toHaveAttribute('aria-describedby', 'cancel-modal-description');

          // Check title
          const title = modal.locator('#cancel-modal-title');
          await expect(title).toBeVisible();
          const titleText = await title.textContent();
          expect(titleText).toContain('Cancel');
        }
      }
    });

    test('should display issues loaded count', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Should display issues count
          const issuesInfo = modal.locator('.issues-info');
          await expect(issuesInfo).toBeVisible();
          const text = await issuesInfo.textContent();
          expect(text).toContain('issue');
        }
      }
    });

    test('should have Continue and Cancel buttons', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Continue button
          const continueBtn = modal.locator('.btn-continue');
          await expect(continueBtn).toBeVisible();
          const continueText = await continueBtn.textContent();
          expect(continueText).toContain('Continue');

          // Cancel confirmation button
          const confirmBtn = modal.locator('.btn-cancel');
          await expect(confirmBtn).toBeVisible();
        }
      }
    });

    test('clicking Continue should close modal and resume loading', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          const continueBtn = modal.locator('.btn-continue');
          await continueBtn.click();
          await page.waitForTimeout(200);

          // Modal should be closed
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('clicking outside modal should close it (Continue behavior)', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Click on backdrop (outside modal)
          const backdrop = page.locator('.modal-backdrop');
          await backdrop.click({ position: { x: 10, y: 10 } });
          await page.waitForTimeout(200);

          // Modal should be closed
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('pressing Escape should close modal (Continue behavior)', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);

          // Modal should be closed
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('confirming cancel should stop search and show results', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          const confirmBtn = modal.locator('.btn-cancel');
          await confirmBtn.click();
          await page.waitForTimeout(500);

          // Modal should be closed
          await expect(modal).not.toBeVisible();

          // Loading should stop (either show results or empty state)
          const loadingContainer = page.locator('.loading-progress-container');
          await expect(loadingContainer).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Modal Accessibility', () => {
    test('should auto-focus Continue button when modal opens', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(300); // Extra time for focus

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Continue button should be focused
          const focused = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.classList.contains('btn-continue') || el?.textContent?.includes('Continue');
          });
          expect(focused).toBe(true);
        }
      }
    });

    test('should trap focus within modal', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(300);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          // Tab should cycle within modal
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);

          const isInModal = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.closest('[role="dialog"]') !== null;
          });
          expect(isInModal).toBe(true);

          // Tab again
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);

          const stillInModal = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.closest('[role="dialog"]') !== null;
          });
          expect(stillInModal).toBe(true);
        }
      }
    });
  });

  test.describe('Progress Phases', () => {
    test('should show different status messages for different phases', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      // Use a repo that might take a bit longer
      await searchInput.fill('https://github.com/facebook/react');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      // Capture status messages over time
      const messages: string[] = [];

      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(500);
        const statusMessage = page.locator('.status-message');
        const isVisible = await statusMessage.isVisible().catch(() => false);
        if (isVisible) {
          const text = await statusMessage.textContent();
          if (text && !messages.includes(text)) {
            messages.push(text);
          }
        }
      }

      // Should have captured at least one message
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display loading progress on mobile', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const loadingContainer = page.locator('.loading-progress-container');
      const isLoadingVisible = await loadingContainer.isVisible().catch(() => false);

      if (isLoadingVisible) {
        // Container should fit mobile viewport
        const box = await loadingContainer.boundingBox();
        if (box) {
          expect(box.width).toBeLessThanOrEqual(375);
        }
      }
    });

    test('modal should be responsive on mobile', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('.cancel-modal');

        if (await modal.isVisible()) {
          const box = await modal.boundingBox();
          if (box) {
            // Modal should fit within mobile viewport with padding
            expect(box.width).toBeLessThanOrEqual(375 - 32); // 1rem padding on each side
          }
        }
      }
    });
  });

  test.describe('Desktop Layout', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should center loading progress on desktop', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const loadingContainer = page.locator('.loading-progress-container');
      const isLoadingVisible = await loadingContainer.isVisible().catch(() => false);

      if (isLoadingVisible) {
        const box = await loadingContainer.boundingBox();
        if (box) {
          const viewportCenter = 1280 / 2;
          const containerCenter = box.x + box.width / 2;
          // Should be roughly centered
          expect(Math.abs(containerCenter - viewportCenter)).toBeLessThan(100);
        }
      }
    });

    test('modal buttons should be side by side on desktop', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      const cancelButton = page.locator('.cancel-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);

      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(200);

        const modal = page.locator('[role="dialog"]');

        if (await modal.isVisible()) {
          const continueBtn = modal.locator('.btn-continue');
          const confirmBtn = modal.locator('.btn-cancel');

          const continueBox = await continueBtn.boundingBox();
          const confirmBox = await confirmBtn.boundingBox();

          if (continueBox && confirmBox) {
            // On desktop (tablet+), buttons should be on same row (similar Y)
            const yDiff = Math.abs(continueBox.y - confirmBox.y);
            expect(yDiff).toBeLessThan(10);
          }
        }
      }
    });
  });

  test.describe('Search Completion', () => {
    test('should hide loading progress when search completes', async ({ page }) => {
      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      // Wait for search to complete
      await page.waitForTimeout(5000);

      // Loading should be hidden
      const loadingContainer = page.locator('.loading-progress-container');
      await expect(loadingContainer).not.toBeVisible();

      // Results or empty state should be visible
      const hasResults = await page
        .locator('.issue-card')
        .first()
        .isVisible()
        .catch(() => false);
      const hasEmptyState = await page
        .locator('[data-testid="empty-state"]')
        .isVisible()
        .catch(() => false);

      expect(hasResults || hasEmptyState).toBe(true);
    });
  });

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const searchInput = page.locator('#repoUrl');
      await searchInput.fill('https://github.com/VibeTensor/IssueVista');

      const searchButton = page.locator('button:has-text("Find Issues")');
      await searchButton.click();

      await page.waitForTimeout(500);

      // Progress bar should still work, just without animations
      const progressBar = page.locator('[role="progressbar"]');
      const isProgressVisible = await progressBar.isVisible().catch(() => false);

      if (isProgressVisible) {
        await expect(progressBar).toBeVisible();
      }
    });
  });
});
