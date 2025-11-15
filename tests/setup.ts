/**
 * Test Setup File
 * This file runs before all tests to configure the testing environment
 */

// Extend expect with custom matchers if needed
import { expect } from 'vitest';

// Mock localStorage if not available in test environment
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
}

// Add custom matchers
expect.extend({
  toHaveAnimation(element: HTMLElement, animationName: string) {
    const styles = window.getComputedStyle(element);
    const animation = styles.getPropertyValue('animation-name');

    return {
      pass: animation.includes(animationName),
      message: () =>
        this.isNot
          ? `Expected element not to have animation "${animationName}", but it does`
          : `Expected element to have animation "${animationName}", but it has "${animation}"`
    };
  }
});

// Extend Vitest's expect types
declare module 'vitest' {
  interface Assertion {
    toHaveAnimation(animationName: string): void;
  }
}
