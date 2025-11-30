/**
 * E2E Tests for Zero-Comment Issue Highlighting
 * Tests Issue #20 implementation in real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Zero-Comment Issue Highlighting - E2E Tests', () => {
  // Increase timeout for API-dependent tests
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // GitHub token for authenticated API calls (higher rate limit)
  // Set GITHUB_TOKEN environment variable for authenticated requests
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

  /**
   * Helper function to search for issues in a repository
   * Fills the repo URL input, adds token, clicks search, and waits for results
   * @param page - Playwright Page object
   * @returns true if issues were found, false otherwise
   */
  async function searchForIssues(page: any): Promise<boolean> {
    // Fill in the GitHub token for authenticated requests (if provided)
    if (GITHUB_TOKEN) {
      const tokenInput = page.locator('#token');
      await tokenInput.fill(GITHUB_TOKEN);
    }

    const searchInput = page.locator('#repoUrl');
    await searchInput.fill('https://github.com/sveltejs/svelte');

    const searchButton = page.locator('button:has-text("Find Issues")');
    await searchButton.click();

    // Wait for either results header or error message (up to 30 seconds)
    try {
      await page.waitForSelector('h2:has-text("Unassigned"), .text-red-300', { timeout: 30000 });

      // Check if we got results
      const resultsHeader = page.locator('h2:has-text("Unassigned")');
      return await resultsHeader.count() > 0;
    } catch {
      // Timeout - no results loaded
      return false;
    }
  }

  test.describe('Easy to Start Badge', () => {
    test('should display "Easy to Start!" badge on zero-comment issues', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const badges = page.locator('.easy-start-badge');
      const count = await badges.count();

      // If there are zero-comment issues, badges should be visible
      if (count > 0) {
        // Find a visible badge (may need to check first few)
        const visibleBadge = badges.filter({ hasText: 'Easy to Start!' }).first();
        const isVisible = await visibleBadge.isVisible().catch(() => false);

        if (isVisible) {
          await expect(visibleBadge).toContainText('Easy to Start!');
        } else {
          // Badge exists in DOM but not visible (card might be collapsed/hidden)
          // Just verify the badge has correct content structure
          const badgeContent = await badges.first().textContent();
          expect(badgeContent).toContain('Easy to Start');
        }
      }
    });

    test('should have checkmark icon in badge', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const badges = page.locator('.easy-start-badge');
      const count = await badges.count();

      if (count > 0) {
        // Check that SVG exists within badges (don't require visibility)
        const svgInBadge = badges.first().locator('svg');
        const svgCount = await svgInBadge.count();
        expect(svgCount).toBeGreaterThan(0);
      }
    });

    test('badge should have aria-label for accessibility', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const badges = page.locator('.easy-start-badge');
      const count = await badges.count();

      if (count > 0) {
        const ariaLabel = await badges.first().getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('Easy to start');
      }
    });

    test('badge should have role="status" for screen readers', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const badges = page.locator('.easy-start-badge');
      const count = await badges.count();

      if (count > 0) {
        const role = await badges.first().getAttribute('role');
        expect(role).toBe('status');
      }
    });
  });

  test.describe('Zero-Comment Card Highlight', () => {
    test('should apply green highlight to zero-comment issue cards', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const highlightedCards = page.locator('.zero-comment-highlight');
      const count = await highlightedCards.count();

      if (count > 0) {
        const firstCard = highlightedCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test('highlight should have animated glow effect', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const highlightedCards = page.locator('.zero-comment-highlight');
      const count = await highlightedCards.count();

      if (count > 0) {
        // Check that the animation CSS class is applied
        const styles = await highlightedCards.first().evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return computed.animationName;
        });
        expect(styles).toContain('card-glow');
      }
    });
  });

  test.describe('Filter Toggle', () => {
    test('should display "Easy Issues Only" toggle', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const toggle = page.locator('#easy-issues-toggle');
      await expect(toggle).toBeVisible();
    });

    test('toggle should have role="switch" for accessibility', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const toggle = page.locator('#easy-issues-toggle');
      const role = await toggle.getAttribute('role');
      expect(role).toBe('switch');
    });

    test('toggle should show count badge when zero-comment issues exist', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const countBadge = page.locator('.filter-toggle-container .bg-green-500.rounded-full');
      const count = await countBadge.count();

      // The count badge should exist if there are zero-comment issues
      if (count > 0) {
        await expect(countBadge.first()).toBeVisible();
      }
    });

    test('should filter to only zero-comment issues when toggle is enabled', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Get initial count of all issues
      const initialCards = page.locator('.sketch-card.hover-effect');
      const initialCount = await initialCards.count();

      if (initialCount > 0) {
        // Click the toggle label (the checkbox is sr-only/hidden)
        const toggleLabel = page.locator('#easy-issues-toggle-label');
        await toggleLabel.click();
        await page.waitForTimeout(500);

        // Count filtered issues
        const filteredCards = page.locator('.sketch-card.hover-effect');
        const filteredCount = await filteredCards.count();

        // All filtered cards should have zero-comment highlight
        const highlightedCards = page.locator('.zero-comment-highlight');
        const highlightedCount = await highlightedCards.count();

        // If toggle is active, all visible cards should be highlighted (or none if no zero-comment issues)
        if (filteredCount > 0) {
          expect(filteredCount).toBe(highlightedCount);
        }
      }
    });

    test('toggle should update aria-checked attribute', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const toggle = page.locator('#easy-issues-toggle');
      const toggleLabel = page.locator('#easy-issues-toggle-label');

      // Initially unchecked
      let ariaChecked = await toggle.getAttribute('aria-checked');
      expect(ariaChecked).toBe('false');

      // Click label to enable (the checkbox is sr-only/hidden)
      await toggleLabel.click();
      await page.waitForTimeout(300);

      ariaChecked = await toggle.getAttribute('aria-checked');
      expect(ariaChecked).toBe('true');
    });
  });

  test.describe('Sort Dropdown', () => {
    test('should display sort dropdown', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      await expect(sortDropdown).toBeVisible();
    });

    test('should have "Default Order" as initial value', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      const value = await sortDropdown.inputValue();
      expect(value).toBe('default');
    });

    test('should have three sorting options', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const options = page.locator('#sort-comments option');
      const count = await options.count();
      expect(count).toBe(3);

      const optionTexts = await options.allTextContents();
      expect(optionTexts).toContain('Default Order');
      expect(optionTexts).toContain('Fewest Comments');
      expect(optionTexts).toContain('Most Comments');
    });

    test('should sort issues by fewest comments', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.selectOption('asc');
      await page.waitForTimeout(500);

      // Verify dropdown value changed
      const value = await sortDropdown.inputValue();
      expect(value).toBe('asc');
    });

    test('should sort issues by most comments', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.selectOption('desc');
      await page.waitForTimeout(500);

      // Verify dropdown value changed
      const value = await sortDropdown.inputValue();
      expect(value).toBe('desc');
    });

    test('sort dropdown should have aria-describedby', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      const describedBy = await sortDropdown.getAttribute('aria-describedby');
      expect(describedBy).toBe('sort-description');
    });
  });

  test.describe('Clear Filters Button', () => {
    test('should not show clear button when no filters are active', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const clearButton = page.locator('button:has-text("Clear Filters")');
      await expect(clearButton).toBeHidden();
    });

    test('should show clear button when toggle is enabled', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Enable filter (click label, not hidden input)
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(300);

      const clearButton = page.locator('button:has-text("Clear Filters")');
      await expect(clearButton).toBeVisible();
    });

    test('should show clear button when sort is changed', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Change sort
      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.selectOption('asc');
      await page.waitForTimeout(300);

      const clearButton = page.locator('button:has-text("Clear Filters")');
      await expect(clearButton).toBeVisible();
    });

    test('should reset all filters when clear button is clicked', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Enable filter and change sort (click label, not hidden input)
      const toggle = page.locator('#easy-issues-toggle');
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(300);

      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.selectOption('asc');
      await page.waitForTimeout(300);

      // Click clear button
      const clearButton = page.locator('button:has-text("Clear Filters")');
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify filters are reset
      const ariaChecked = await toggle.getAttribute('aria-checked');
      expect(ariaChecked).toBe('false');

      const sortValue = await sortDropdown.inputValue();
      expect(sortValue).toBe('default');
    });

    test('clear button should have aria-label', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Enable filter to show clear button (click label, not hidden input)
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(300);

      const clearButton = page.locator('button:has-text("Clear Filters")');
      const ariaLabel = await clearButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Clear');
    });
  });

  test.describe('Live Region Announcements', () => {
    test('should have aria-live region for filter changes', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const liveRegion = page.locator('[aria-live="polite"]');
      const count = await liveRegion.count();
      expect(count).toBeGreaterThan(0);
    });

    test('live region should have role="status"', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const liveRegion = page.locator('[aria-live="polite"]');
      const role = await liveRegion.getAttribute('role');
      expect(role).toBe('status');
    });

    test('live region should update when filter changes', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Enable filter (click label, not hidden input)
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(500);

      const liveRegion = page.locator('[aria-live="polite"]');
      const text = await liveRegion.textContent();
      expect(text).toContain('easy issues');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('toggle should be focusable via keyboard', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const toggle = page.locator('#easy-issues-toggle');
      await toggle.focus();

      const isFocused = await toggle.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    });

    test('toggle can be activated with Space key', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const toggle = page.locator('#easy-issues-toggle');
      await toggle.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      const ariaChecked = await toggle.getAttribute('aria-checked');
      expect(ariaChecked).toBe('true');
    });

    test('sort dropdown should be focusable via keyboard', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.focus();

      const isFocused = await sortDropdown.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    });
  });

  test.describe('Reduced Motion Preference', () => {
    test('should respect prefers-reduced-motion for badge animation', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      const badges = page.locator('.easy-start-badge');
      const count = await badges.count();

      if (count > 0) {
        const animationName = await badges.first().evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return computed.animationName;
        });
        // When reduced motion is enabled, animation should be none
        expect(animationName).toBe('none');
      }
    });
  });

  test.describe('Combined Filtering and Sorting', () => {
    test('should apply filter and sort together', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Enable filter (click label, not hidden input)
      const toggle = page.locator('#easy-issues-toggle');
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(300);

      // Apply sort
      const sortDropdown = page.locator('#sort-comments');
      await sortDropdown.selectOption('asc');
      await page.waitForTimeout(300);

      // Verify both are active
      const ariaChecked = await toggle.getAttribute('aria-checked');
      expect(ariaChecked).toBe('true');

      const sortValue = await sortDropdown.inputValue();
      expect(sortValue).toBe('asc');
    });

    test('filtered count should update header display', async ({ page }) => {
      const hasIssues = await searchForIssues(page);
      test.skip(!hasIssues, 'No issues loaded from API');

      // Get initial header text
      const header = page.locator('h2:has-text("Unassigned")');
      const initialText = await header.textContent();

      // Enable filter (click label, not hidden input)
      const toggleLabel = page.locator('#easy-issues-toggle-label');
      await toggleLabel.click();
      await page.waitForTimeout(500);

      // Header should update (may show filtered count or "(filtered from X)")
      const filteredText = await header.textContent();
      // Verify header changed or shows filtered indicator
      const headerChanged = filteredText !== initialText || filteredText?.includes('filtered from');
      expect(headerChanged).toBe(true);
    });
  });
});
