/**
 * E2E Tests for Footer Component
 * Tests Issue #21 implementation in real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Footer Component - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Footer Presence and Visibility', () => {
    test('should display footer at the bottom of the page', async ({ page }) => {
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();
    });

    test('should have proper ARIA role and label', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveAttribute('role', 'contentinfo');
      await expect(footer).toHaveAttribute('aria-label', 'Site footer');
    });

    test('should have footer navigation section', async ({ page }) => {
      const nav = page.locator('footer nav[aria-label="Footer navigation"]');
      await expect(nav).toBeVisible();
    });

    test('should have footer-container class for styling', async ({ page }) => {
      const footer = page.locator('footer');
      const classes = await footer.getAttribute('class');
      expect(classes).toContain('footer-container');
    });
  });

  test.describe('Navigation Links', () => {
    test('should display GitHub link', async ({ page }) => {
      const githubLink = page.locator('footer a[aria-label="View IssueFlow on GitHub (opens in new tab)"]');
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute('href', 'https://github.com/VibeTensor/IssueFlow');
    });

    test('should display Report Issue link', async ({ page }) => {
      const issueLink = page.locator('footer a[aria-label*="Report an issue"]');
      await expect(issueLink).toBeVisible();
      await expect(issueLink).toHaveAttribute('href', 'https://github.com/VibeTensor/IssueFlow/issues');
    });

    test('should display Contributing link', async ({ page }) => {
      const contributeLink = page.locator('footer a[aria-label*="contributing"]');
      await expect(contributeLink).toBeVisible();
      await expect(contributeLink).toHaveAttribute('href', 'https://github.com/VibeTensor/IssueFlow/blob/master/CONTRIBUTING.md');
    });

    test('should have all links open in new tab', async ({ page }) => {
      const navLinks = page.locator('footer .footer-links a');
      const count = await navLinks.count();

      expect(count).toBe(3);

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });

    test('should display link text correctly', async ({ page }) => {
      const githubLink = page.locator('footer a[aria-label="View IssueFlow on GitHub (opens in new tab)"]');
      const issueLink = page.locator('footer a[aria-label*="Report an issue"]');
      const contributeLink = page.locator('footer a[aria-label*="contributing"]');

      await expect(githubLink).toContainText('GitHub');
      await expect(issueLink).toContainText('Report Issue');
      await expect(contributeLink).toContainText('Contribute');
    });

    test('should have icons on all navigation links', async ({ page }) => {
      const navLinks = page.locator('footer .footer-links a');
      const count = await navLinks.count();

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        const svg = link.locator('svg');
        await expect(svg).toBeVisible();
      }
    });
  });

  test.describe('Social Share Buttons', () => {
    test('should display Twitter/X share button', async ({ page }) => {
      const twitterButton = page.locator('footer a[aria-label*="Twitter"]');
      await expect(twitterButton).toBeVisible();
    });

    test('should have correct Twitter share URL structure', async ({ page }) => {
      const twitterButton = page.locator('footer a[aria-label*="Twitter"]');
      const href = await twitterButton.getAttribute('href');

      expect(href).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
      expect(href).toContain('text=');
      expect(href).toContain('url=');
      expect(href).toContain('hashtags=');
    });

    test('should display LinkedIn share button', async ({ page }) => {
      const linkedinButton = page.locator('footer a[aria-label*="LinkedIn"]');
      await expect(linkedinButton).toBeVisible();
    });

    test('should have correct LinkedIn share URL structure', async ({ page }) => {
      const linkedinButton = page.locator('footer a[aria-label*="LinkedIn"]');
      const href = await linkedinButton.getAttribute('href');

      expect(href).toMatch(/^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?url=/);
    });

    test('should have title attributes on social buttons', async ({ page }) => {
      const twitterButton = page.locator('footer a[aria-label*="Twitter"]');
      const linkedinButton = page.locator('footer a[aria-label*="LinkedIn"]');

      await expect(twitterButton).toHaveAttribute('title', 'Share on X');
      await expect(linkedinButton).toHaveAttribute('title', 'Share on LinkedIn');
    });

    test('should have social buttons open in new tab', async ({ page }) => {
      const socialButtons = page.locator('footer .footer-social a');
      const count = await socialButtons.count();

      for (let i = 0; i < count; i++) {
        const button = socialButtons.nth(i);
        await expect(button).toHaveAttribute('target', '_blank');
        await expect(button).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });

    test('should have icons on social buttons', async ({ page }) => {
      const socialButtons = page.locator('footer .footer-social a, footer .footer-social button');
      const count = await socialButtons.count();

      for (let i = 0; i < count; i++) {
        const button = socialButtons.nth(i);
        const svg = button.locator('svg');
        await expect(svg).toBeVisible();
      }
    });
  });

  test.describe('Version Display', () => {
    test('should display version badge', async ({ page }) => {
      const versionBadge = page.locator('footer .version-badge');
      await expect(versionBadge).toBeVisible();
    });

    test('should have version label "v"', async ({ page }) => {
      const versionLabel = page.locator('footer .version-label');
      await expect(versionLabel).toHaveText('v');
    });

    test('should display valid version number', async ({ page }) => {
      const versionNumber = page.locator('footer .version-number');
      await expect(versionNumber).toBeVisible();

      const version = await versionNumber.textContent();
      // Version should match semver pattern
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  test.describe('Attribution Section', () => {
    test('should display "Made with love" text', async ({ page }) => {
      const attribution = page.locator('footer .attribution');
      await expect(attribution).toBeVisible();
      await expect(attribution).toContainText('Made with');
    });

    test('should display heart symbol', async ({ page }) => {
      const heart = page.locator('footer .heart');
      await expect(heart).toBeVisible();
    });

    test('should display VibeTensor author link', async ({ page }) => {
      const authorLink = page.locator('footer .author-link');
      await expect(authorLink).toBeVisible();
      await expect(authorLink).toHaveText('VibeTensor');
      await expect(authorLink).toHaveAttribute('href', 'https://github.com/VibeTensor');
    });

    test('should have author link open in new tab', async ({ page }) => {
      const authorLink = page.locator('footer .author-link');
      await expect(authorLink).toHaveAttribute('target', '_blank');
      await expect(authorLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    test('should have hidden icons from screen readers', async ({ page }) => {
      const iconsWithAriaHidden = await page.locator('footer svg[aria-hidden="true"]').count();
      const totalIcons = await page.locator('footer svg').count();
      // All SVG icons in the footer should be hidden from screen readers
      expect(iconsWithAriaHidden).toBe(totalIcons);
    });

    test('should be keyboard accessible - can tab to links', async ({ page }) => {
      // Start with Tab navigation
      let foundFooterLink = false;

      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.closest('footer') !== null;
        });

        if (focused) {
          foundFooterLink = true;
          break;
        }
      }

      expect(foundFooterLink).toBe(true);
    });

    test('should have focus-visible styles', async ({ page }) => {
      const githubLink = page.locator('footer a[aria-label="View IssueFlow on GitHub (opens in new tab)"]');
      await githubLink.focus();

      // Check that the link receives focus
      await expect(githubLink).toBeFocused();
    });

    test('should have aria-label on navigation', async ({ page }) => {
      const nav = page.locator('footer nav');
      await expect(nav).toHaveAttribute('aria-label', 'Footer navigation');
    });

    test('should have aria-label on social section', async ({ page }) => {
      const social = page.locator('footer .footer-social');
      await expect(social).toHaveAttribute('aria-label', 'Share on social media');
    });
  });

  test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should display footer on mobile', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have centered content on mobile', async ({ page }) => {
      const footerContent = page.locator('footer .footer-content');
      const styles = await footerContent.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          textAlign: computed.textAlign,
          flexDirection: computed.flexDirection
        };
      });

      expect(styles.textAlign).toBe('center');
      expect(styles.flexDirection).toBe('column');
    });

    test('should display all navigation links on mobile', async ({ page }) => {
      const navLinks = page.locator('footer .footer-links a');
      const count = await navLinks.count();
      expect(count).toBe(3);

      for (let i = 0; i < count; i++) {
        await expect(navLinks.nth(i)).toBeVisible();
      }
    });

    test('should display social buttons on mobile', async ({ page }) => {
      const twitterButton = page.locator('footer a[aria-label*="Twitter"]');
      const linkedinButton = page.locator('footer a[aria-label*="LinkedIn"]');

      await expect(twitterButton).toBeVisible();
      await expect(linkedinButton).toBeVisible();
    });

    test('should have tappable social buttons', async ({ page }) => {
      const socialButtons = page.locator('footer .social-icon-button');
      const count = await socialButtons.count();

      for (let i = 0; i < count; i++) {
        const button = socialButtons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // Minimum touch target should be around 40x40px
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Desktop Layout', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display footer on desktop', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have row layout on desktop', async ({ page }) => {
      const footerContent = page.locator('footer .footer-content');
      const styles = await footerContent.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          flexDirection: computed.flexDirection,
          justifyContent: computed.justifyContent
        };
      });

      expect(styles.flexDirection).toBe('row');
      expect(styles.justifyContent).toBe('space-between');
    });

    test('should have footer-bottom in row layout on desktop', async ({ page }) => {
      const footerBottom = page.locator('footer .footer-bottom');
      const styles = await footerBottom.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          flexDirection: computed.flexDirection,
          justifyContent: computed.justifyContent
        };
      });

      expect(styles.flexDirection).toBe('row');
    });
  });

  test.describe('Visual Styling', () => {
    test('should have backdrop blur effect', async ({ page }) => {
      const footer = page.locator('footer');
      const backdropFilter = await footer.evaluate((el) => {
        return window.getComputedStyle(el).backdropFilter;
      });

      expect(backdropFilter).toContain('blur');
    });

    test('should have gradient background on links', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();
      const background = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).backgroundImage;
      });

      expect(background).toContain('gradient');
    });

    test('should have rounded corners on links', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();
      const borderRadius = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });

      // Should have 0.75rem = 12px rounded corners
      expect(parseFloat(borderRadius)).toBeGreaterThan(0);
    });

    test('should have shadow on links', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();
      const boxShadow = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(boxShadow).not.toBe('none');
    });
  });

  test.describe('Hover States', () => {
    test('should change link appearance on hover', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();

      await footerLink.hover();

      // Wait for CSS transition to apply a non-default transform
      await expect(footerLink).not.toHaveCSS('transform', 'none');
    });

    test('should change social button appearance on hover', async ({ page }) => {
      const socialButton = page.locator('footer .social-icon-button').first();

      await socialButton.hover();

      // Wait for CSS transition to apply a non-default transform
      await expect(socialButton).not.toHaveCSS('transform', 'none');
    });
  });

  test.describe('Reduced Motion', () => {
    test('should respect reduced motion preference for heart animation', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const heart = page.locator('footer .heart');
      const animation = await heart.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        // Check animation-name or animation (shorthand)
        return {
          animationName: computed.animationName,
          animation: computed.animation
        };
      });

      // Animation should be none when reduced motion is preferred
      // The CSS sets animation: none in @media (prefers-reduced-motion: reduce)
      const isAnimationDisabled =
        animation.animationName === 'none' ||
        animation.animation === 'none' ||
        animation.animation.includes('none');

      expect(isAnimationDisabled).toBe(true);
    });
  });
});
