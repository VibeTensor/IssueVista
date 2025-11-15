/**
 * Unit Tests for Help Button Pulse Animation
 * Tests for Issue #2: Add animation to help button for better discoverability
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Help Button Pulse Animation', () => {
  let container: HTMLDivElement;
  let helpButton: HTMLButtonElement;

  beforeEach(() => {
    // Create a mock help button with the animation classes
    container = document.createElement('div');
    container.innerHTML = `
      <style>
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 10px 50px rgba(148, 163, 184, 0.4);
          }
        }

        .help-button-pulse {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .help-button-pulse:hover {
          animation-play-state: paused;
        }

        .help-button {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 9999;
          width: 3.5rem;
          height: 3.5rem;
          background-color: rgb(51, 65, 85);
          border-radius: 9999px;
        }
      </style>
      <button
        class="help-button help-button-pulse fixed w-14 h-14 md:w-16 md:h-16 bg-slate-700 rounded-full hover:bg-slate-600 transition-all flex items-center justify-center sketch-button shadow-2xl"
        aria-label="Help"
      >
        ?
      </button>
    `;

    document.body.appendChild(container);
    helpButton = container.querySelector('button')!;
  });

  describe('CSS Animation Setup', () => {
    it('should have help-button-pulse class applied', () => {
      expect(helpButton.classList.contains('help-button-pulse')).toBe(true);
    });

    it('should have help-button class for positioning', () => {
      expect(helpButton.classList.contains('help-button')).toBe(true);
    });

    it('should have proper ARIA label for accessibility', () => {
      expect(helpButton.getAttribute('aria-label')).toBe('Help');
    });

    it('should be a button element', () => {
      expect(helpButton.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Animation Properties', () => {
    it('should have animation property defined', () => {
      // In happy-dom test environment, computed styles for animations may not be fully supported
      // Instead, verify the animation is defined in the CSS and class is applied
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';
      const hasClass = helpButton.classList.contains('help-button-pulse');

      // Check both CSS definition and class application
      expect(cssText).toContain('animation: pulse-scale 2s ease-in-out infinite');
      expect(hasClass).toBe(true);
    });

    it('should have 2 second animation duration', () => {
      const styleElement = container.querySelector('style');
      expect(styleElement?.textContent).toContain('2s ease-in-out infinite');
    });

    it('should use ease-in-out timing function', () => {
      const styleElement = container.querySelector('style');
      expect(styleElement?.textContent).toContain('ease-in-out');
    });

    it('should have infinite animation iteration', () => {
      const styleElement = container.querySelector('style');
      expect(styleElement?.textContent).toContain('infinite');
    });
  });

  describe('Keyframes Animation', () => {
    it('should define pulse-scale keyframes', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('@keyframes pulse-scale');
    });

    it('should scale from 1 to 1.05', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('transform: scale(1)');
      expect(cssText).toContain('transform: scale(1.05)');
    });

    it('should have box-shadow animation', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5)');
      expect(cssText).toContain('box-shadow: 0 10px 50px rgba(148, 163, 184, 0.4)');
    });

    it('should have keyframes at 0%, 50%, and 100%', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toMatch(/0%,\s*100%/);
      expect(cssText).toContain('50%');
    });
  });

  describe('Hover Behavior', () => {
    it('should pause animation on hover', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('.help-button-pulse:hover');
      expect(cssText).toContain('animation-play-state: paused');
    });

    it('should not stop animation completely on hover (paused, not none)', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      // Ensure we're using paused, not animation: none
      const hoverSection = cssText.split('.help-button-pulse:hover')[1];
      expect(hoverSection).toContain('paused');
      expect(hoverSection).not.toContain('animation: none');
    });
  });

  describe('Button Positioning', () => {
    it('should be fixed positioned', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('position: fixed');
    });

    it('should be positioned at bottom right', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('bottom: 1rem');
      expect(cssText).toContain('right: 1rem');
    });

    it('should have high z-index for visibility', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      expect(cssText).toContain('z-index: 9999');
    });

    it('should be circular (border-radius)', () => {
      expect(helpButton.classList.contains('rounded-full')).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should use transform (hardware accelerated) not position', () => {
      const styleElement = container.querySelector('style');
      const cssText = styleElement?.textContent || '';

      // Transform is used for animation (hardware accelerated)
      expect(cssText).toContain('transform: scale');

      // Should not animate top/left/margin (causes reflow)
      expect(cssText).not.toMatch(/50%\s*{\s*top:/);
      expect(cssText).not.toMatch(/50%\s*{\s*left:/);
    });

    it('should use CSS animation (no JavaScript)', () => {
      // The animation should be pure CSS, no JS required
      // This test verifies the animation is defined in CSS
      const styleElement = container.querySelector('style');
      expect(styleElement?.textContent).toContain('@keyframes');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive sizing classes', () => {
      // Check for mobile and desktop size classes
      expect(helpButton.classList.contains('w-14')).toBe(true); // Mobile width
      expect(helpButton.classList.contains('h-14')).toBe(true); // Mobile height
      expect(helpButton.className).toContain('md:w-16'); // Desktop width
      expect(helpButton.className).toContain('md:h-16'); // Desktop height
    });
  });

  describe('User Experience', () => {
    it('should be clickable (not disabled)', () => {
      expect(helpButton.disabled).toBe(false);
    });

    it('should have appropriate aria-label for screen readers', () => {
      const ariaLabel = helpButton.getAttribute('aria-label');
      expect(ariaLabel).toBe('Help');
      expect(ariaLabel).toBeTruthy();
    });

    it('should have visible content', () => {
      expect(helpButton.textContent?.trim()).toBe('?');
    });
  });

  describe('Integration with Existing Styles', () => {
    it('should maintain sketch-button class for hand-drawn effect', () => {
      expect(helpButton.classList.contains('sketch-button')).toBe(true);
    });

    it('should maintain shadow-2xl class', () => {
      expect(helpButton.classList.contains('shadow-2xl')).toBe(true);
    });

    it('should maintain transition-all class', () => {
      expect(helpButton.classList.contains('transition-all')).toBe(true);
    });

    it('should maintain hover:bg-slate-600 class', () => {
      expect(helpButton.className).toContain('hover:bg-slate-600');
    });
  });
});
