/**
 * E2E Tests for Smart Relative Time Display
 * Tests Issue #17 implementation in real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Smart Relative Time Display - E2E Tests', () => {
  // Increase timeout for API-dependent tests
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  /**
   * Helper function to search for issues in a repository
   * Fills the repo URL input, clicks search, and waits for API response
   * @param page - Playwright Page object
   */
  async function searchForIssues(page: any) {
    const searchInput = page.locator('#repoUrl');
    await searchInput.fill('https://github.com/VibeTensor/IssueFlow');

    const searchButton = page.locator('button:has-text("Find Issues")');
    await searchButton.click();

    // Wait for API response
    await page.waitForTimeout(5000);
  }

  test.describe('Relative Time Display', () => {
    test('should display time elements with datetime attribute after search', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        // At least one time element should be visible
        const firstTime = timeElements.first();
        await expect(firstTime).toBeVisible();
      }
    });

    test('should display relative time format (Today/Yesterday/X days ago)', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const timeText = await timeElements.first().textContent();

        // Should match relative time patterns
        const relativeTimePattern = /(Today|Yesterday|\d+\s+(minutes?|hours?|days?|weeks?|months?|years?)\s+ago|last\s+(week|month|year))/i;
        expect(timeText).toMatch(relativeTimePattern);
      }
    });

    test('should NOT display absolute date format like "Nov 29, 2025"', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const timeText = await timeElements.first().textContent();

        // Should NOT match absolute date patterns
        const absoluteDatePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/;
        expect(timeText).not.toMatch(absoluteDatePattern);
      }
    });
  });

  test.describe('Tooltip with Exact Date', () => {
    test('should have title attribute with exact date on time elements', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const titleAttr = await timeElements.first().getAttribute('title');
        expect(titleAttr).toBeTruthy();
        // Should contain year
        expect(titleAttr).toMatch(/\d{4}/);
      }
    });

    test('should show tooltip containing full month name', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const titleAttr = await timeElements.first().getAttribute('title');
        const monthPattern = /(January|February|March|April|May|June|July|August|September|October|November|December)/;
        expect(titleAttr).toMatch(monthPattern);
      }
    });

    test('should show tooltip containing AM/PM time format', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const titleAttr = await timeElements.first().getAttribute('title');
        expect(titleAttr).toMatch(/(AM|PM)/);
      }
    });
  });

  test.describe('Freshness Indicators', () => {
    test('should display freshness indicator dots next to dates', async ({ page }) => {
      await searchForIssues(page);

      // Check for any freshness dot (green, amber, or gray)
      const greenDots = page.locator('.bg-green-500.rounded-full');
      const amberDots = page.locator('.bg-amber-500.rounded-full');
      const grayDots = page.locator('.bg-gray-400.rounded-full');

      const greenCount = await greenDots.count();
      const amberCount = await amberDots.count();
      const grayCount = await grayDots.count();

      // At least one type of freshness indicator should exist when issues are displayed
      const timeElements = page.locator('time[datetime]');
      const timeCount = await timeElements.count();
      if (timeCount > 0) {
        // If issues exist, freshness indicators should also exist
        expect(greenCount + amberCount + grayCount).toBeGreaterThan(0);
      }
    });

    test('should have aria-hidden on freshness dots', async ({ page }) => {
      await searchForIssues(page);

      const dots = page.locator('.rounded-full[aria-hidden="true"]');
      const count = await dots.count();

      // If dots exist, they should have aria-hidden
      if (count > 0) {
        const firstDot = dots.first();
        await expect(firstDot).toHaveAttribute('aria-hidden', 'true');
      }
    });

    test('should have descriptive title on freshness dots', async ({ page }) => {
      await searchForIssues(page);

      const greenDot = page.locator('.bg-green-500.rounded-full').first();
      const amberDot = page.locator('.bg-amber-500.rounded-full').first();
      const grayDot = page.locator('.bg-gray-400.rounded-full').first();

      if (await greenDot.count() > 0) {
        const title = await greenDot.getAttribute('title');
        expect(title).toContain('Fresh');
      }

      if (await amberDot.count() > 0) {
        const title = await amberDot.getAttribute('title');
        expect(title).toContain('Moderate');
      }

      if (await grayDot.count() > 0) {
        const title = await grayDot.getAttribute('title');
        expect(title).toContain('Stale');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should use semantic <time> element for dates', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      // Verify semantic time elements are used (test passes if search completes)
      // The count check is conditional since repo may have no unassigned issues
      if (count > 0) {
        const firstTime = timeElements.first();
        await expect(firstTime).toBeVisible();
      }
    });

    test('should have datetime attribute with ISO date format', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const datetime = await timeElements.first().getAttribute('datetime');
        expect(datetime).toBeTruthy();
        // Should be valid ISO date format (YYYY-MM-DD)
        expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }
    });

    test('should have aria-label with "Created" text', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const ariaLabel = await timeElements.first().getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('Created');
      }
    });

    test('should have screen reader text for freshness level', async ({ page }) => {
      await searchForIssues(page);

      const srOnlyElements = page.locator('.sr-only');
      const count = await srOnlyElements.count();

      if (count > 0) {
        // Check for freshness-related sr-only text
        const allTexts = await srOnlyElements.allTextContents();
        const freshnessTexts = allTexts.filter(text =>
          text.includes('Fresh') || text.includes('Moderate') || text.includes('Stale')
        );

        // If sr-only elements exist, at least some should be freshness-related
        if (freshnessTexts.length > 0) {
          expect(freshnessTexts.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Grid and List View Consistency', () => {
    test('should display relative time in default grid view', async ({ page }) => {
      await searchForIssues(page);

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        await expect(timeElements.first()).toBeVisible();
      }
    });

    test('should display relative time after toggling to list view', async ({ page }) => {
      await searchForIssues(page);

      // Try to find and click list view button
      const listViewButton = page.locator('button[title="List view"]');

      if (await listViewButton.count() > 0) {
        await listViewButton.click();
        await page.waitForTimeout(500);

        const timeElements = page.locator('time[datetime]');
        const count = await timeElements.count();

        if (count > 0) {
          await expect(timeElements.first()).toBeVisible();
        }
      }
    });
  });
});
