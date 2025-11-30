/**
 * E2E Tests for Auto-Focus and Real-Time URL Validation
 * Tests Issue #16 implementation in real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Auto-Focus and URL Validation - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Auto-Focus', () => {
    test('should auto-focus the repository URL input on page load', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      // Check that the input is focused
      await expect(repoUrlInput).toBeFocused();
    });

    test('should allow immediate typing without clicking', async ({ page }) => {
      // Type directly without clicking
      await page.keyboard.type('https://github.com/facebook/react');

      const repoUrlInput = page.locator('#repoUrl');
      await expect(repoUrlInput).toHaveValue('https://github.com/facebook/react');
    });
  });

  test.describe('Valid URL Validation', () => {
    test('should show green checkmark for valid GitHub URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      // Type a valid GitHub URL
      await repoUrlInput.fill('https://github.com/facebook/react');

      // Wait for debounce (300ms) + buffer
      await page.waitForTimeout(400);

      // Check for green checkmark icon
      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();
    });

    test('should show validation message with owner/repo for valid URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/sveltejs/svelte');
      await page.waitForTimeout(400);

      // Check for hint text with checkmark and owner/repo
      const hintText = page.locator('#repoUrl-hint');
      await expect(hintText).toBeVisible();
      await expect(hintText).toContainText('sveltejs/svelte');
    });

    test('should apply green border to input for valid URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/microsoft/vscode');
      await page.waitForTimeout(400);

      // Check that input has green border class
      const classList = await repoUrlInput.getAttribute('class');
      expect(classList).toContain('border-green-500');
    });

    test('should validate URL with www prefix', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://www.github.com/nodejs/node');
      await page.waitForTimeout(400);

      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();
    });

    test('should validate URL with trailing slash', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/torvalds/linux/');
      await page.waitForTimeout(400);

      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();
    });

    test('should strip .git suffix and validate', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/user/repo.git');
      await page.waitForTimeout(400);

      const hintText = page.locator('#repoUrl-hint');
      await expect(hintText).toContainText('user/repo');
    });
  });

  test.describe('Invalid URL Validation', () => {
    test('should show red warning for non-GitHub URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://gitlab.com/user/repo');
      await page.waitForTimeout(400);

      // Check for red warning icon
      const invalidIcon = page.locator('svg.text-red-500');
      await expect(invalidIcon).toBeVisible();
    });

    test('should show error message for invalid URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('not a valid url');
      await page.waitForTimeout(400);

      const hintText = page.locator('#repoUrl-hint');
      await expect(hintText).toBeVisible();
      await expect(hintText).toContainText('valid GitHub URL');
    });

    test('should apply red border to input for invalid URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://example.com/something');
      await page.waitForTimeout(400);

      const classList = await repoUrlInput.getAttribute('class');
      expect(classList).toContain('border-red-500');
    });

    test('should have aria-invalid attribute for invalid URL', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('invalid-url');
      await page.waitForTimeout(400);

      await expect(repoUrlInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should show error for URL with only owner (no repo)', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/facebook');
      await page.waitForTimeout(400);

      const invalidIcon = page.locator('svg.text-red-500');
      await expect(invalidIcon).toBeVisible();
    });
  });

  test.describe('Idle State', () => {
    test('should not show any validation icon when input is empty', async ({ page }) => {
      // Input should be empty by default
      const validIcon = page.locator('svg.text-green-500');
      const invalidIcon = page.locator('svg.text-red-500');

      await expect(validIcon).not.toBeVisible();
      await expect(invalidIcon).not.toBeVisible();
    });

    test('should not show hint text when input is empty', async ({ page }) => {
      const hintText = page.locator('#repoUrl-hint');
      // Hint element exists but should have invisible class when no validation message
      const classList = await hintText.getAttribute('class');
      expect(classList).toContain('invisible');
    });

    test('should return to idle state when input is cleared', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      // First enter a valid URL
      await repoUrlInput.fill('https://github.com/facebook/react');
      await page.waitForTimeout(400);

      // Verify validation is shown
      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();

      // Clear the input
      await repoUrlInput.fill('');
      await page.waitForTimeout(100);

      // Should be back to idle - no icons visible
      await expect(validIcon).not.toBeVisible();
      const invalidIcon = page.locator('svg.text-red-500');
      await expect(invalidIcon).not.toBeVisible();
    });
  });

  test.describe('Debounce Behavior', () => {
    test('should not validate immediately on keypress', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      // Type quickly
      await repoUrlInput.fill('https://github.com/facebook/react');

      // Check immediately (before debounce)
      const validIcon = page.locator('svg.text-green-500');
      const isVisibleImmediate = await validIcon.isVisible();

      // Icon should not be visible yet due to debounce
      expect(isVisibleImmediate).toBe(false);
    });

    test('should validate after debounce delay', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/facebook/react');

      // Wait for debounce (300ms) + buffer
      await page.waitForTimeout(400);

      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();
    });

    test('should reset debounce timer on continued typing', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      // Start typing
      await repoUrlInput.type('https://gith', { delay: 50 });

      // Wait a bit (but not full debounce)
      await page.waitForTimeout(200);

      // Continue typing
      await repoUrlInput.type('ub.com/facebook/react', { delay: 50 });

      // Wait for full debounce after last keystroke
      await page.waitForTimeout(400);

      const validIcon = page.locator('svg.text-green-500');
      await expect(validIcon).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have aria-describedby linking input to hint', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');
      await expect(repoUrlInput).toHaveAttribute('aria-describedby', 'repoUrl-hint');
    });

    test('should announce validation errors to screen readers', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('invalid-url');
      await page.waitForTimeout(400);

      // Hint should have role="alert" for invalid state
      const hintText = page.locator('#repoUrl-hint');
      await expect(hintText).toHaveAttribute('role', 'alert');
    });

    test('should not have alert role for valid state', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');

      await repoUrlInput.fill('https://github.com/facebook/react');
      await page.waitForTimeout(400);

      const hintText = page.locator('#repoUrl-hint');
      // Should not have role="alert" for valid URLs
      const role = await hintText.getAttribute('role');
      expect(role).toBeNull();
    });
  });

  test.describe('Integration with Search', () => {
    test('should allow search after valid URL validation', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');
      const searchButton = page.locator('button:has-text("Find Issues")');

      await repoUrlInput.fill('https://github.com/facebook/react');
      await page.waitForTimeout(400);

      // Button should be enabled
      await expect(searchButton).toBeEnabled();
    });

    test('should disable search button for invalid URL format', async ({ page }) => {
      const repoUrlInput = page.locator('#repoUrl');
      const searchButton = page.locator('button:has-text("Find Issues")');

      await repoUrlInput.fill('invalid-but-not-empty');
      await page.waitForTimeout(400);

      // Button is disabled when URL validation fails (invalid state)
      await expect(searchButton).toBeDisabled();
    });

    test('should disable search button when input is empty', async ({ page }) => {
      const searchButton = page.locator('button:has-text("Find Issues")');

      // Button should be disabled when input is empty
      await expect(searchButton).toBeDisabled();
    });
  });
});
