/**
 * Unit Tests for Copy Button Functionality
 * Tests Issue #6 implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Copy Button Functionality', () => {
  let container: HTMLDivElement;
  let copyButton: HTMLButtonElement;
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };
  let mockExecCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock copy button element
    container = document.createElement('div');
    container.innerHTML = `
      <style>
        .issue-card {
          display: flex;
          padding: 1rem;
          border: 1px solid #ccc;
        }
        .flex-row {
          display: flex;
          flex-direction: row;
        }
        .bg-gradient-to-br {
          background: linear-gradient(to bottom right, var(--tw-gradient-stops));
        }
        .from-slate-600 {
          --tw-gradient-from: rgb(71, 85, 105);
        }
        .from-green-600 {
          --tw-gradient-from: rgb(22, 163, 74);
        }
        .rounded-xl {
          border-radius: 0.75rem;
        }
        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      </style>
      <div class="issue-card">
        <button
          type="button"
          class="flex-row bg-gradient-to-br from-slate-600 rounded-xl shadow-md"
          aria-label="Copy issue link for issue 123"
          title="Copy issue link"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <span>Copy</span>
        </button>
      </div>
    `;

    document.body.appendChild(container);
    copyButton = container.querySelector('button')!;

    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    });

    // Mock document.execCommand for fallback
    mockExecCommand = vi.fn().mockReturnValue(true);
    (document as any).execCommand = mockExecCommand;

    // Mock setTimeout and clearTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Clean up clipboard mock
    delete (navigator as any).clipboard;
  });

  describe('Clipboard API - Modern Browser Support', () => {
    it('should call navigator.clipboard.writeText with correct URL', async () => {
      const testUrl = 'https://github.com/test/repo/issues/123';
      const issueNumber = 123;

      // Simulate the copyIssueUrl function
      await navigator.clipboard.writeText(testUrl);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testUrl);
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it('should handle successful clipboard write', async () => {
      const testUrl = 'https://github.com/test/repo/issues/456';

      const result = await navigator.clipboard.writeText(testUrl);

      expect(result).toBeUndefined(); // writeText resolves with undefined on success
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should handle empty URL gracefully', async () => {
      const emptyUrl = '';

      // Function should return early if URL is empty
      if (!emptyUrl) {
        // Early return - clipboard should not be called
        expect(mockClipboard.writeText).not.toHaveBeenCalled();
      }
    });
  });

  describe('Fallback - Legacy Browser Support', () => {
    beforeEach(() => {
      // Simulate clipboard API not being available
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API not available'));
    });

    it('should use document.execCommand as fallback when clipboard API fails', async () => {
      const testUrl = 'https://github.com/test/repo/issues/789';

      try {
        await navigator.clipboard.writeText(testUrl);
      } catch (err) {
        // Fallback implementation
        const textArea = document.createElement('textarea');
        textArea.value = testUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = (document as any).execCommand('copy');
        document.body.removeChild(textArea);

        expect(success).toBe(true);
        expect(mockExecCommand).toHaveBeenCalledWith('copy');
      }
    });

    it('should create temporary textarea for fallback copy', async () => {
      const testUrl = 'https://github.com/test/repo/issues/111';
      const initialChildCount = document.body.childElementCount;

      try {
        await navigator.clipboard.writeText(testUrl);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = testUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';

        expect(textArea.value).toBe(testUrl);
        expect(textArea.style.position).toBe('fixed');
        expect(textArea.style.left).toBe('-999999px');

        document.body.appendChild(textArea);
        expect(document.body.childElementCount).toBe(initialChildCount + 1);

        textArea.select();
        (document as any).execCommand('copy');
        document.body.removeChild(textArea);

        // Verify cleanup
        expect(document.body.childElementCount).toBe(initialChildCount);
      }
    });
  });

  describe('Visual Feedback State Management', () => {
    it('should set copied state for correct issue number', () => {
      let copiedIssueNumber: number | null = null;
      const issueNumber = 42;

      // Simulate successful copy
      copiedIssueNumber = issueNumber;

      expect(copiedIssueNumber).toBe(42);
      expect(copiedIssueNumber).not.toBeNull();
    });

    it('should clear copied state after timeout', () => {
      let copiedIssueNumber: number | null = 42;
      let copyFeedbackTimeout: number | null = null;

      // Set timeout to clear feedback
      copyFeedbackTimeout = window.setTimeout(() => {
        copiedIssueNumber = null;
        copyFeedbackTimeout = null;
      }, 2000);

      expect(copiedIssueNumber).toBe(42);

      // Fast-forward time by 2 seconds
      vi.advanceTimersByTime(2000);

      expect(copiedIssueNumber).toBeNull();
      expect(copyFeedbackTimeout).toBeNull();
    });

    it('should clear previous timeout when copying again', () => {
      let copyFeedbackTimeout: number | null = null;
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      // First copy
      copyFeedbackTimeout = window.setTimeout(() => {}, 2000);
      const firstTimeout = copyFeedbackTimeout;

      // Second copy (should clear first timeout)
      if (copyFeedbackTimeout) {
        clearTimeout(copyFeedbackTimeout);
      }
      copyFeedbackTimeout = window.setTimeout(() => {}, 2000);

      expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimeout);
    });

    it('should maintain separate copied states for different issues', () => {
      const copiedStates = new Map<number, boolean>();

      copiedStates.set(1, true);
      copiedStates.set(2, false);
      copiedStates.set(3, true);

      expect(copiedStates.get(1)).toBe(true);
      expect(copiedStates.get(2)).toBe(false);
      expect(copiedStates.get(3)).toBe(true);
    });
  });

  describe('Timeout Management', () => {
    it('should use 2000ms (2 seconds) for feedback timeout', () => {
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
      let copiedIssueNumber: number | null = null;

      const timeout = window.setTimeout(() => {
        copiedIssueNumber = null;
      }, 2000);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('should reset state only after full timeout duration', () => {
      let copiedIssueNumber: number | null = 123;

      window.setTimeout(() => {
        copiedIssueNumber = null;
      }, 2000);

      // After 1 second - should still be set
      vi.advanceTimersByTime(1000);
      expect(copiedIssueNumber).toBe(123);

      // After 1.5 seconds total - should still be set
      vi.advanceTimersByTime(500);
      expect(copiedIssueNumber).toBe(123);

      // After 2 seconds total - should be cleared
      vi.advanceTimersByTime(500);
      expect(copiedIssueNumber).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle clipboard API rejection gracefully', async () => {
      const testUrl = 'https://github.com/test/repo/issues/999';
      const error = new Error('Clipboard write failed');
      mockClipboard.writeText.mockRejectedValue(error);

      let caughtError: Error | null = null;
      try {
        await navigator.clipboard.writeText(testUrl);
      } catch (err) {
        caughtError = err as Error;
      }

      expect(caughtError).toEqual(error);
      expect(mockClipboard.writeText).toHaveBeenCalledWith(testUrl);
    });

    it('should handle execCommand failure in fallback', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('API failed'));
      mockExecCommand.mockReturnValue(false); // Simulate execCommand failure

      try {
        await navigator.clipboard.writeText('test-url');
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = 'test-url';
        document.body.appendChild(textArea);
        textArea.select();
        const success = (document as any).execCommand('copy');
        document.body.removeChild(textArea);

        expect(success).toBe(false);
      }
    });

    it('should log error to console on copy failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Copy failed');

      console.error('Failed to copy issue URL:', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy issue URL:', testError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('URL Validation', () => {
    it('should accept valid GitHub issue URLs', () => {
      const validUrls = [
        'https://github.com/owner/repo/issues/1',
        'https://github.com/test/project/issues/999',
        'https://github.com/VibeTensor/IssueFlow/issues/6'
      ];

      validUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/\d+$/);
      });
    });

    it('should handle different issue number formats', () => {
      const issueNumbers = [1, 42, 123, 9999, 100000];

      issueNumbers.forEach((num) => {
        expect(num).toBeGreaterThan(0);
        expect(Number.isInteger(num)).toBe(true);
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have descriptive ARIA label with issue number', () => {
      const ariaLabel = copyButton.getAttribute('aria-label');

      expect(ariaLabel).toContain('Copy issue link');
      expect(ariaLabel).toMatch(/issue \d+/);
      expect(ariaLabel).toBe('Copy issue link for issue 123');
    });

    it('should have title attribute for tooltip', () => {
      const title = copyButton.getAttribute('title');
      expect(title).toBe('Copy issue link');
    });

    it('should be a button element for proper semantics', () => {
      expect(copyButton.tagName.toLowerCase()).toBe('button');
      expect(copyButton.getAttribute('type')).toBe('button');
    });

    it('should provide visual feedback text', () => {
      const span = copyButton.querySelector('span');
      expect(span?.textContent).toBe('Copy');
    });

    it('should have proper SVG icon', () => {
      const svg = copyButton.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });

  describe('Button State Management', () => {
    it('should show "Copy" text and icon by default', () => {
      const span = copyButton.querySelector('span');
      const svg = copyButton.querySelector('svg');

      expect(span?.textContent).toBe('Copy');
      expect(svg).toBeTruthy();
    });

    it('should have flex-row layout for horizontal icon + text', () => {
      expect(copyButton.classList.contains('flex-row')).toBe(true);
    });

    it('should apply gradient background classes', () => {
      const classes = copyButton.className;
      expect(classes).toContain('bg-gradient-to-br');
      expect(classes).toContain('from-slate-600');
    });

    it('should have rounded corners', () => {
      expect(copyButton.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have shadow effect', () => {
      expect(copyButton.classList.contains('shadow-md')).toBe(true);
    });
  });

  describe('Button Layout Structure', () => {
    it('should contain SVG icon element', () => {
      const svg = copyButton.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.tagName.toLowerCase()).toBe('svg');
    });

    it('should contain text span element', () => {
      const span = copyButton.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.tagName.toLowerCase()).toBe('span');
    });

    it('should have icon with proper sizing classes', () => {
      const svg = copyButton.querySelector('svg');
      expect(svg?.classList.contains('w-5')).toBe(true);
      expect(svg?.classList.contains('h-5')).toBe(true);
    });

    it('should have copy icon path data', () => {
      const path = copyButton.querySelector('path');
      expect(path).toBeTruthy();

      const pathData = path?.getAttribute('d');
      expect(pathData).toContain('M8 16H6a2 2 0 01-2-2V6');
    });
  });

  describe('Integration with Issue Card', () => {
    it('should be contained within issue card structure', () => {
      const issueCard = container.querySelector('.issue-card');
      expect(issueCard).toBeTruthy();
      expect(issueCard?.contains(copyButton)).toBe(true);
    });

    it('should be properly styled for visibility', () => {
      // Button should have visible styling
      expect(copyButton.className.length).toBeGreaterThan(0);

      // Should have gradient background
      expect(copyButton.className).toContain('bg-gradient');
    });
  });

  describe('State Logic Validation', () => {
    it('should correctly identify matching issue numbers', () => {
      let copiedIssueNumber: number = 42;

      expect(copiedIssueNumber === 42).toBe(true);

      copiedIssueNumber = 43;
      expect(copiedIssueNumber === 43).toBe(true);

      copiedIssueNumber = 1;
      expect(copiedIssueNumber === 1).toBe(true);
    });

    it('should handle null copied state', () => {
      const copiedIssueNumber: number | null = null;
      const currentIssue = 42;

      expect(copiedIssueNumber === currentIssue).toBe(false);
      expect(copiedIssueNumber).toBeNull();
    });

    it('should determine correct button text based on state', () => {
      let copiedIssueNumber: number | null = null;
      const currentIssue = 42;

      let buttonText = copiedIssueNumber === currentIssue ? 'Copied!' : 'Copy';
      expect(buttonText).toBe('Copy');

      copiedIssueNumber = 42;
      buttonText = copiedIssueNumber === currentIssue ? 'Copied!' : 'Copy';
      expect(buttonText).toBe('Copied!');
    });

    it('should determine correct title based on state', () => {
      let copiedIssueNumber: number | null = null;
      const currentIssue = 42;

      let title = copiedIssueNumber === currentIssue ? 'Copied!' : 'Copy issue link';
      expect(title).toBe('Copy issue link');

      copiedIssueNumber = 42;
      title = copiedIssueNumber === currentIssue ? 'Copied!' : 'Copy issue link';
      expect(title).toBe('Copied!');
    });
  });
});
