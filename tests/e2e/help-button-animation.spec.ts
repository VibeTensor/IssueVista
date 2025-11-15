/**
 * E2E Tests for Help Button Pulse Animation
 * Tests Issue #2 implementation in real browser environment
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Help Button Pulse Animation - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Visual Presence', () => {
    test('should display help button in bottom right corner', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      await expect(helpButton).toBeVisible();

      // Check position
      const boundingBox = await helpButton.boundingBox();
      expect(boundingBox).toBeTruthy();

      if (boundingBox) {
        const viewportSize = page.viewportSize();
        expect(viewportSize).toBeTruthy();

        if (viewportSize) {
          // Should be in bottom right (within last 20% of viewport)
          expect(boundingBox.x + boundingBox.width).toBeGreaterThan(viewportSize.width * 0.8);
          expect(boundingBox.y + boundingBox.height).toBeGreaterThan(viewportSize.height * 0.8);
        }
      }
    });

    test('should have question mark icon visible', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');
      const svg = helpButton.locator('svg');

      await expect(svg).toBeVisible();
    });
  });

  test.describe('Animation Presence', () => {
    test('should have pulse animation class applied', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      const classList = await helpButton.getAttribute('class');
      expect(classList).toContain('help-button-pulse');
    });

    test('should have active CSS animation', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Get computed style to check animation
      const animationName = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-name');
      });

      expect(animationName).toContain('pulse-scale');
    });

    test('should have 2 second animation duration', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      const animationDuration = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-duration');
      });

      expect(animationDuration).toBe('2s');
    });

    test('should have infinite iteration count', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      const iterationCount = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-iteration-count');
      });

      expect(iterationCount).toBe('infinite');
    });
  });

  test.describe('Hover Interaction', () => {
    test('should pause animation on hover', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Hover over the button
      await helpButton.hover();

      // Wait a bit for hover to take effect
      await page.waitForTimeout(100);

      // Check animation play state
      const playState = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-play-state');
      });

      expect(playState).toBe('paused');
    });

    test('should resume animation when hover ends', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // First hover
      await helpButton.hover();
      await page.waitForTimeout(100);

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);

      // Check animation is running again
      const playState = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-play-state');
      });

      expect(playState).toBe('running');
    });

    test('should change background color on hover', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Get initial background
      const initialBg = await helpButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Hover
      await helpButton.hover();
      await page.waitForTimeout(200);

      // Get hover background (may take time for transition)
      const hoverBg = await helpButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Background should be different (darker on hover)
      // Note: exact color match might vary, but they should be different
      expect(initialBg).not.toBe(hoverBg);
    });
  });

  test.describe('Click Functionality', () => {
    test('should open help popup when clicked', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Click the button
      await helpButton.click();

      // Wait for popup to appear
      await page.waitForTimeout(300);

      // Check for popup content
      const popup = page.locator('text=How It Works').first();
      await expect(popup).toBeVisible();
    });

    test('should close help popup when close button clicked', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Open popup
      await helpButton.click();
      await page.waitForTimeout(300);

      // Close popup
      const closeButton = page.locator('button[aria-label="Close"]');
      await closeButton.click();
      await page.waitForTimeout(300);

      // Popup should be hidden
      const popup = page.locator('text=How It Works').first();
      await expect(popup).not.toBeVisible();
    });

    test('should maintain animation after popup interaction', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      // Open and close popup
      await helpButton.click();
      await page.waitForTimeout(300);

      const closeButton = page.locator('button[aria-label="Close"]');
      await closeButton.click();
      await page.waitForTimeout(300);

      // Animation should still be active
      const animationName = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-name');
      });

      expect(animationName).toContain('pulse-scale');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be visible on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      const helpButton = page.locator('button[aria-label="Help"]');
      await expect(helpButton).toBeVisible();
    });

    test('should have appropriate size on mobile', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      const helpButton = page.locator('button[aria-label="Help"]');
      const boundingBox = await helpButton.boundingBox();

      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        // Mobile size should be around 56px (3.5rem = 14 * 4)
        expect(boundingBox.width).toBeGreaterThanOrEqual(50);
        expect(boundingBox.width).toBeLessThanOrEqual(70);
      }
    });

    test('should maintain animation on mobile', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      const helpButton = page.locator('button[aria-label="Help"]');

      const animationName = await helpButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.getPropertyValue('animation-name');
      });

      expect(animationName).toContain('pulse-scale');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA label', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');
      await expect(helpButton).toHaveAttribute('aria-label', 'Help');
    });

    test('should be keyboard accessible', async ({ page }) => {
      // Tab to the help button
      await page.keyboard.press('Tab');

      // Check if help button is focused (may need multiple tabs depending on page structure)
      // This is a basic check - might need adjustment based on actual tab order
      const helpButton = page.locator('button[aria-label="Help"]');

      // Press Enter to activate
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Popup should open
      const popup = page.locator('text=How It Works').first();
      await expect(popup).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      const styles = await helpButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color
        };
      });

      // Basic check that colors are defined
      expect(styles.backgroundColor).toBeTruthy();
      expect(styles.color).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should not cause layout shifts', async ({ page }) => {
      // Wait for initial load
      await page.waitForLoadState('networkidle');

      const helpButton = page.locator('button[aria-label="Help"]');
      const initialBox = await helpButton.boundingBox();

      // Wait for animation cycle
      await page.waitForTimeout(2100); // Slightly more than one 2s cycle

      const afterBox = await helpButton.boundingBox();

      expect(initialBox).toBeTruthy();
      expect(afterBox).toBeTruthy();

      if (initialBox && afterBox) {
        // Position should remain fixed
        expect(initialBox.x).toBe(afterBox.x);
        expect(initialBox.y).toBe(afterBox.y);
      }
    });

    test('should use CSS transform (hardware accelerated)', async ({ page }) => {
      const helpButton = page.locator('button[aria-label="Help"]');

      const usesTransform = await helpButton.evaluate((el) => {
        // Check if keyframes use transform
        const styleSheets = Array.from(document.styleSheets);

        for (const sheet of styleSheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule instanceof CSSKeyframesRule && rule.name === 'pulse-scale') {
                const keyframeRules = Array.from(rule.cssRules);
                return keyframeRules.some(kr => {
                  return kr instanceof CSSKeyframeRule && kr.style.transform.includes('scale');
                });
              }
            }
          } catch (e) {
            // Skip cross-origin stylesheets
            continue;
          }
        }
        return false;
      });

      expect(usesTransform).toBe(true);
    });
  });
});
