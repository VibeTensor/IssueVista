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
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have proper ARIA label', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveAttribute('aria-label', 'Site footer');
    });

    test('should have footer-container class for styling', async ({ page }) => {
      const footer = page.locator('footer');
      const classes = await footer.getAttribute('class');
      expect(classes).toContain('footer-container');
    });
  });

  test.describe('Navigation Links', () => {
    test('should display GitHub link', async ({ page }) => {
      const githubLink = page.locator('footer a[title="GitHub"]');
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute('href', 'https://github.com/VibeTensor/IssueFlow');
    });

    test('should display Report Issue link', async ({ page }) => {
      const issueLink = page.locator('footer a[title="Report Issue"]');
      await expect(issueLink).toBeVisible();
      await expect(issueLink).toHaveAttribute('href', 'https://github.com/VibeTensor/IssueFlow/issues');
    });

    test('should display Contribute link', async ({ page }) => {
      const contributeLink = page.locator('footer a[title="Contribute"]');
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
      const twitterButton = page.locator('footer a[title="Share on X"]');
      await expect(twitterButton).toBeVisible();
    });

    test('should have correct Twitter share URL structure', async ({ page }) => {
      const twitterButton = page.locator('footer a[title="Share on X"]');
      const href = await twitterButton.getAttribute('href');

      expect(href).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
      expect(href).toContain('text=');
      expect(href).toContain('url=');
    });

    test('should display LinkedIn share button', async ({ page }) => {
      const linkedinButton = page.locator('footer a[title="Share on LinkedIn"]');
      await expect(linkedinButton).toBeVisible();
    });

    test('should have correct LinkedIn share URL structure', async ({ page }) => {
      const linkedinButton = page.locator('footer a[title="Share on LinkedIn"]');
      const href = await linkedinButton.getAttribute('href');

      expect(href).toMatch(/^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?url=/);
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
      const socialButtons = page.locator('footer .footer-social a');
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

    test('should display valid version number', async ({ page }) => {
      const versionBadge = page.locator('footer .version-badge');
      const versionText = await versionBadge.textContent();

      // Version should match pattern like "v1.0.0"
      expect(versionText).toMatch(/^v\d+\.\d+\.\d+/);
    });
  });

  test.describe('Company Attribution', () => {
    test('should display company attribution section', async ({ page }) => {
      const attribution = page.locator('footer .company-attribution');
      await expect(attribution).toBeVisible();
    });

    test('should display VibeTensor company link', async ({ page }) => {
      const companyLink = page.locator('footer .company-link');
      await expect(companyLink).toBeVisible();
      await expect(companyLink).toContainText('VibeTensor');
      await expect(companyLink).toHaveAttribute('href', 'https://github.com/VibeTensor');
    });

    test('should display country indicator', async ({ page }) => {
      const country = page.locator('footer .company-country');
      await expect(country).toBeVisible();
      await expect(country).toContainText('India');
    });

    test('should display contact email', async ({ page }) => {
      const contactLink = page.locator('footer .contact-link');
      await expect(contactLink).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
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
      const githubLink = page.locator('footer a[title="GitHub"]');
      await githubLink.focus();

      // Check that the link receives focus
      await expect(githubLink).toBeFocused();
    });
  });

  test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should display footer on mobile', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
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
      const twitterButton = page.locator('footer a[title="Share on X"]');
      const linkedinButton = page.locator('footer a[title="Share on LinkedIn"]');

      await expect(twitterButton).toBeVisible();
      await expect(linkedinButton).toBeVisible();
    });
  });

  test.describe('Desktop Layout', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display footer on desktop', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should display footer row with centered content', async ({ page }) => {
      const footerRow = page.locator('footer .footer-row');
      await expect(footerRow).toBeVisible();
    });
  });

  test.describe('Visual Styling', () => {
    test('should have rounded corners on links', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();
      const borderRadius = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });

      expect(parseFloat(borderRadius)).toBeGreaterThan(0);
    });
  });

  test.describe('Hover States', () => {
    test('should change link appearance on hover', async ({ page }) => {
      const footerLink = page.locator('footer .footer-link').first();

      // Get initial color
      const initialColor = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      await footerLink.hover();
      await page.waitForTimeout(200);

      // Get hover color
      const hoverColor = await footerLink.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Color should change on hover (from gray to teal)
      expect(hoverColor).not.toBe(initialColor);
    });
  });
});
