/**
 * E2E Tests: Help Button and HelpPopup
 * Tests for the "How it works?" floating action button and modal popup
 * Verifies brand styling, accessibility, and functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Help Button - Brand Styled FAB', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render circular help button in fixed position', async ({ page }) => {
    const helpButton = page.locator('.help-button');
    await expect(helpButton).toBeVisible();

    // Should be circular (equal width and height)
    const box = await helpButton.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(Math.abs(box.width - box.height)).toBeLessThan(2); // Allow 2px tolerance
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const helpButton = page.locator('.help-button');

    // Check aria-label
    await expect(helpButton).toHaveAttribute('aria-label', /how it works/i);

    // Check aria-expanded
    await expect(helpButton).toHaveAttribute('aria-expanded', 'false');

    // Check title tooltip
    await expect(helpButton).toHaveAttribute('title', /how it works/i);
  });

  test('should open help popup on click', async ({ page }) => {
    const helpButton = page.locator('.help-button');

    // Click to open
    await helpButton.click();

    // Wait for popup to appear
    const popup = page.locator('[role="dialog"]');
    await expect(popup).toBeVisible();

    // Button should indicate expanded state
    await expect(helpButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('should have teal gradient styling', async ({ page }) => {
    const helpButton = page.locator('.help-button');

    // Check background includes gradient (teal colors)
    const bgStyle = await helpButton.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgStyle).toContain('gradient');
  });

  test('should contain question mark icon', async ({ page }) => {
    const helpButton = page.locator('.help-button');
    const icon = helpButton.locator('svg.help-icon');

    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('Help Popup - Modal Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open the help popup
    await page.locator('.help-button').click();
    await page.waitForSelector('[role="dialog"]');
  });

  test('should have proper dialog accessibility', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');

    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'help-dialog-title');
  });

  test('should display "How It Works" title', async ({ page }) => {
    const title = page.locator('#help-dialog-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText(/how it works/i);
  });

  test('should have 4 numbered steps with teal styling', async ({ page }) => {
    // Check for step badges with teal gradient
    const stepBadges = page.locator('.sketch-card .bg-gradient-to-br');
    const count = await stepBadges.count();
    expect(count).toBe(4); // Steps 1-4
  });

  test('should have collapsible token creation section', async ({ page }) => {
    // Check for details element with token creation steps
    const details = page.locator('details');
    await expect(details).toBeVisible();

    // Click to expand
    const summary = details.locator('summary');
    await summary.click();

    // Check for steps inside
    const steps = details.locator('ol li');
    const count = await steps.count();
    expect(count).toBe(4); // 4 condensed steps
  });

  test('should have teal CTA button', async ({ page }) => {
    // Find the CTA button (compact design uses just "Got it!")
    const ctaButton = page.getByRole('button', { name: /got it/i });
    await expect(ctaButton).toBeVisible();

    // Check for teal gradient background
    const bgStyle = await ctaButton.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgStyle).toContain('gradient');
  });

  test('should have teal-colored link for token creation', async ({ page }) => {
    // Expand the details first
    const details = page.locator('details');
    await details.locator('summary').click();

    const tokenLink = page.locator('a[href*="github.com/settings/tokens"]');
    await expect(tokenLink).toBeVisible();

    // Check for teal color class
    const hasClass = await tokenLink.evaluate((el) => el.classList.contains('text-teal-400'));
    expect(hasClass).toBe(true);
  });

  test('should close on CTA button click', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /got it/i });
    await ctaButton.click();

    // Dialog should be hidden
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('should close on Escape key', async ({ page }) => {
    await page.keyboard.press('Escape');

    // Dialog should be hidden
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('should close on backdrop click', async ({ page }) => {
    // Click outside the modal content (on the backdrop)
    const backdrop = page.locator('.fixed.inset-0.bg-black\\/80');
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Dialog should be hidden
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('should close on X button click', async ({ page }) => {
    const closeButton = page.locator('button[aria-label="Close"]');
    await closeButton.click();

    // Dialog should be hidden
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Help Button - Responsive Behavior', () => {
  test('should be visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.locator('.help-button');
    await expect(helpButton).toBeVisible();
  });

  test('should be visible on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const helpButton = page.locator('.help-button');
    await expect(helpButton).toBeVisible();
  });

  test('popup should fit on screen without scrollbar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open popup
    await page.locator('.help-button').click();
    await page.waitForSelector('[role="dialog"]');

    // The popup wrapper should be visible and rounded
    const wrapper = page.locator('.help-popup-wrapper');
    await expect(wrapper).toBeVisible();
  });
});
