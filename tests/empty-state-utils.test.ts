/**
 * Unit Tests for Empty State Utilities
 * Tests Issue #30 implementation - EmptyState component helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  getEmptyStateConfig,
  isRateLimitError,
  isErrorState,
  detectEmptyStateVariant,
  getEmptyStateAnnouncement,
  getAllVariants,
  isValidVariant,
  EMPTY_STATE_CONFIGS,
  README_URL,
  ISSUES_URL,
  RATE_LIMIT_DOCS_URL,
  type EmptyStateVariant,
  type EmptyStateDetectionInput
} from '../src/lib/empty-state-utils';

// ============================================================================
// Constants Tests
// ============================================================================
describe('Empty State Constants', () => {
  describe('URL Constants', () => {
    it('should have correct README URL', () => {
      expect(README_URL).toBe('https://github.com/VibeTensor/IssueFlow#readme');
    });

    it('should have correct Issues URL', () => {
      expect(ISSUES_URL).toBe('https://github.com/VibeTensor/IssueFlow/issues');
    });

    it('should have correct Rate Limit Docs URL', () => {
      expect(RATE_LIMIT_DOCS_URL).toBe('https://docs.github.com/en/rest/rate-limit');
    });
  });

  describe('EMPTY_STATE_CONFIGS', () => {
    it('should have all required variants', () => {
      const variants: EmptyStateVariant[] = [
        'initial',
        'no-results',
        'error',
        'rate-limited',
        'success'
      ];
      variants.forEach((variant) => {
        expect(EMPTY_STATE_CONFIGS[variant]).toBeDefined();
      });
    });

    it('should have title for each variant', () => {
      Object.values(EMPTY_STATE_CONFIGS).forEach((config) => {
        expect(config.title).toBeDefined();
        expect(config.title.length).toBeGreaterThan(0);
      });
    });

    it('should have description for each variant', () => {
      Object.values(EMPTY_STATE_CONFIGS).forEach((config) => {
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThan(0);
      });
    });

    it('should have announcement for each variant', () => {
      Object.values(EMPTY_STATE_CONFIGS).forEach((config) => {
        expect(config.announcement).toBeDefined();
        expect(config.announcement.length).toBeGreaterThan(0);
      });
    });

    it('should have primary action label for variants that need it', () => {
      // All variants except 'initial' have primary actions
      const variantsWithPrimaryAction = ['no-results', 'error', 'rate-limited', 'success'];
      variantsWithPrimaryAction.forEach((variant) => {
        const config = EMPTY_STATE_CONFIGS[variant as keyof typeof EMPTY_STATE_CONFIGS];
        expect(config.primaryActionLabel).toBeDefined();
        expect(config.primaryActionLabel!.length).toBeGreaterThan(0);
      });
      // Initial variant does NOT have primary action (quick picks are in SearchForm)
      expect(EMPTY_STATE_CONFIGS.initial.primaryActionLabel).toBeUndefined();
    });
  });

  describe('Initial variant config', () => {
    const config = EMPTY_STATE_CONFIGS.initial;

    it('should have correct title', () => {
      expect(config.title).toBe('Enter a repository URL');
    });

    it('should have correct description', () => {
      expect(config.description).toBe('Or click a quick pick above to get started');
    });

    it('should have secondary action href pointing to README', () => {
      expect(config.secondaryActionHref).toBe(README_URL);
    });

    it('should NOT have primary action (quick picks are in SearchForm)', () => {
      expect(config.primaryActionLabel).toBeUndefined();
    });
  });

  describe('Error variant config', () => {
    const config = EMPTY_STATE_CONFIGS.error;

    it('should have secondary action href pointing to Issues', () => {
      expect(config.secondaryActionHref).toBe(ISSUES_URL);
    });

    it('should have Retry as primary action', () => {
      expect(config.primaryActionLabel).toBe('Retry');
    });
  });

  describe('Rate-limited variant config', () => {
    const config = EMPTY_STATE_CONFIGS['rate-limited'];

    it('should have secondary action href pointing to rate limit docs', () => {
      expect(config.secondaryActionHref).toBe(RATE_LIMIT_DOCS_URL);
    });

    it('should have Retry as primary action', () => {
      expect(config.primaryActionLabel).toBe('Retry');
    });
  });
});

// ============================================================================
// getEmptyStateConfig Tests
// ============================================================================
describe('getEmptyStateConfig', () => {
  it('should return config for initial variant', () => {
    const config = getEmptyStateConfig('initial');
    expect(config).toBe(EMPTY_STATE_CONFIGS.initial);
  });

  it('should return config for no-results variant', () => {
    const config = getEmptyStateConfig('no-results');
    expect(config).toBe(EMPTY_STATE_CONFIGS['no-results']);
  });

  it('should return config for error variant', () => {
    const config = getEmptyStateConfig('error');
    expect(config).toBe(EMPTY_STATE_CONFIGS.error);
  });

  it('should return config for rate-limited variant', () => {
    const config = getEmptyStateConfig('rate-limited');
    expect(config).toBe(EMPTY_STATE_CONFIGS['rate-limited']);
  });

  it('should return config for success variant', () => {
    const config = getEmptyStateConfig('success');
    expect(config).toBe(EMPTY_STATE_CONFIGS.success);
  });

  it('should be a pure function (same input = same output)', () => {
    const config1 = getEmptyStateConfig('error');
    const config2 = getEmptyStateConfig('error');
    expect(config1).toBe(config2);
  });
});

// ============================================================================
// isRateLimitError Tests
// ============================================================================
describe('isRateLimitError', () => {
  describe('String error messages', () => {
    it('should detect "rate limit" message', () => {
      expect(isRateLimitError('Rate limit exceeded')).toBe(true);
      expect(isRateLimitError('rate limit reached')).toBe(true);
    });

    it('should detect "rate_limit" message (underscore)', () => {
      expect(isRateLimitError('rate_limit_exceeded')).toBe(true);
    });

    it('should detect "403" with rate limit context', () => {
      expect(isRateLimitError('403: Rate limit exceeded')).toBe(true);
      expect(isRateLimitError('GitHub API returned 403 - rate limit')).toBe(true);
      expect(isRateLimitError('Error 403: API quota exceeded')).toBe(true);
    });

    it('should NOT detect "403" alone (may be permission error)', () => {
      expect(isRateLimitError('Error 403: Forbidden')).toBe(false);
      expect(isRateLimitError('403 Access Denied')).toBe(false);
    });

    it('should detect "api limit" message', () => {
      expect(isRateLimitError('API limit reached')).toBe(true);
      expect(isRateLimitError('api limit exceeded')).toBe(true);
    });

    it('should detect "limit exceeded" and "quota exceeded" messages', () => {
      expect(isRateLimitError('Limit exceeded')).toBe(true);
      expect(isRateLimitError('Quota exceeded')).toBe(true);
      expect(isRateLimitError('Request limit exceeded')).toBe(true);
    });

    it('should not match generic exceeded messages (false positive prevention)', () => {
      expect(isRateLimitError('Memory exceeded')).toBe(false);
      expect(isRateLimitError('Timeout exceeded')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isRateLimitError('RATE LIMIT EXCEEDED')).toBe(true);
      expect(isRateLimitError('Rate_Limit')).toBe(true);
    });
  });

  describe('Error object messages', () => {
    it('should detect rate limit in Error objects', () => {
      expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
      expect(isRateLimitError(new Error('API rate_limit reached'))).toBe(true);
    });

    it('should detect 403 with rate context in Error objects', () => {
      expect(isRateLimitError(new Error('403: Rate limit exceeded'))).toBe(true);
      expect(isRateLimitError(new Error('403 - Quota exceeded'))).toBe(true);
    });

    it('should NOT detect 403 alone in Error objects', () => {
      expect(isRateLimitError(new Error('403 Forbidden'))).toBe(false);
    });
  });

  describe('Non-rate limit errors', () => {
    it('should return false for non-rate limit errors', () => {
      expect(isRateLimitError('Not found')).toBe(false);
      expect(isRateLimitError('Repository not found')).toBe(false);
      expect(isRateLimitError('Network error')).toBe(false);
      expect(isRateLimitError('Internal server error')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRateLimitError(null)).toBe(false);
    });
  });
});

// ============================================================================
// isErrorState Tests
// ============================================================================
describe('isErrorState', () => {
  describe('Truthy error values', () => {
    it('should return true for non-empty string', () => {
      expect(isErrorState('Some error')).toBe(true);
    });

    it('should return true for Error objects', () => {
      expect(isErrorState(new Error('test'))).toBe(true);
    });

    it('should return true for truthy objects', () => {
      expect(isErrorState({ message: 'error' })).toBe(true);
    });

    it('should return true for non-zero numbers', () => {
      expect(isErrorState(1)).toBe(true);
      expect(isErrorState(-1)).toBe(true);
    });
  });

  describe('Falsy error values', () => {
    it('should return false for null', () => {
      expect(isErrorState(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isErrorState(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isErrorState('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(isErrorState('   ')).toBe(false);
      expect(isErrorState('\t\n')).toBe(false);
    });
  });
});

// ============================================================================
// detectEmptyStateVariant Tests
// ============================================================================
describe('detectEmptyStateVariant', () => {
  describe('Loading state', () => {
    it('should return null when loading', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: false,
        isLoading: true,
        error: null,
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });

    it('should return null when loading even with error', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: true,
        error: 'Some error',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });
  });

  describe('Rate limit error detection', () => {
    it('should return rate-limited for rate limit error string', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: 'Rate limit exceeded',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('rate-limited');
    });

    it('should return rate-limited for 403 error with rate limit context', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: new Error('403: Rate limit exceeded'),
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('rate-limited');
    });

    it('should return error (not rate-limited) for 403 without rate limit context', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: new Error('403 Forbidden'),
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('error');
    });

    it('should prioritize rate-limited over general error', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: 'API rate limit exceeded - please try again later',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('rate-limited');
    });
  });

  describe('General error detection', () => {
    it('should return error for non-rate-limit error', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: 'Repository not found',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('error');
    });

    it('should return error for Error object', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: new Error('Network failure'),
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('error');
    });
  });

  describe('Initial state detection', () => {
    it('should return initial when not searched', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: false,
        isLoading: false,
        error: null,
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('initial');
    });

    it('should return initial even with positive resultsCount when not searched', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: false,
        isLoading: false,
        error: null,
        resultsCount: 5
      };
      expect(detectEmptyStateVariant(input)).toBe('initial');
    });
  });

  describe('No results detection', () => {
    it('should return no-results when searched with zero results', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: null,
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('no-results');
    });
  });

  describe('Has results (no empty state)', () => {
    it('should return null when results exist', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: null,
        resultsCount: 10
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });

    it('should return null when results exist even with one result', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: null,
        resultsCount: 1
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });
  });

  describe('Priority order', () => {
    it('should prioritize loading over everything', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: true,
        error: 'Rate limit',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });

    it('should prioritize rate-limited over error', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: 'Rate limit exceeded',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('rate-limited');
    });

    it('should prioritize error over initial', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: false,
        isLoading: false,
        error: 'Some error',
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('error');
    });

    it('should prioritize initial over no-results', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: false,
        isLoading: false,
        error: null,
        resultsCount: 0
      };
      expect(detectEmptyStateVariant(input)).toBe('initial');
    });
  });
});

// ============================================================================
// getEmptyStateAnnouncement Tests
// ============================================================================
describe('getEmptyStateAnnouncement', () => {
  it('should return announcement for initial variant', () => {
    const announcement = getEmptyStateAnnouncement('initial');
    expect(announcement).toBe(EMPTY_STATE_CONFIGS.initial.announcement);
    expect(announcement).toContain('Ready');
  });

  it('should return announcement for no-results variant', () => {
    const announcement = getEmptyStateAnnouncement('no-results');
    expect(announcement).toBe(EMPTY_STATE_CONFIGS['no-results'].announcement);
    expect(announcement).toContain('No issues');
  });

  it('should return announcement for error variant', () => {
    const announcement = getEmptyStateAnnouncement('error');
    expect(announcement).toBe(EMPTY_STATE_CONFIGS.error.announcement);
    expect(announcement).toContain('Error');
  });

  it('should return announcement for rate-limited variant', () => {
    const announcement = getEmptyStateAnnouncement('rate-limited');
    expect(announcement).toBe(EMPTY_STATE_CONFIGS['rate-limited'].announcement);
    expect(announcement).toContain('rate limit');
  });

  it('should return announcement for success variant', () => {
    const announcement = getEmptyStateAnnouncement('success');
    expect(announcement).toBe(EMPTY_STATE_CONFIGS.success.announcement);
    expect(announcement).toContain('reviewed');
  });
});

// ============================================================================
// getAllVariants Tests
// ============================================================================
describe('getAllVariants', () => {
  it('should return all 5 variants', () => {
    const variants = getAllVariants();
    expect(variants).toHaveLength(5);
  });

  it('should include initial variant', () => {
    expect(getAllVariants()).toContain('initial');
  });

  it('should include no-results variant', () => {
    expect(getAllVariants()).toContain('no-results');
  });

  it('should include error variant', () => {
    expect(getAllVariants()).toContain('error');
  });

  it('should include rate-limited variant', () => {
    expect(getAllVariants()).toContain('rate-limited');
  });

  it('should include success variant', () => {
    expect(getAllVariants()).toContain('success');
  });

  it('should return same array on multiple calls', () => {
    const variants1 = getAllVariants();
    const variants2 = getAllVariants();
    expect(variants1).toEqual(variants2);
  });
});

// ============================================================================
// isValidVariant Tests
// ============================================================================
describe('isValidVariant', () => {
  describe('Valid variants', () => {
    it('should return true for initial', () => {
      expect(isValidVariant('initial')).toBe(true);
    });

    it('should return true for no-results', () => {
      expect(isValidVariant('no-results')).toBe(true);
    });

    it('should return true for error', () => {
      expect(isValidVariant('error')).toBe(true);
    });

    it('should return true for rate-limited', () => {
      expect(isValidVariant('rate-limited')).toBe(true);
    });

    it('should return true for success', () => {
      expect(isValidVariant('success')).toBe(true);
    });
  });

  describe('Invalid variants', () => {
    it('should return false for unknown string', () => {
      expect(isValidVariant('unknown')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidVariant('')).toBe(false);
    });

    it('should return false for similar but incorrect strings', () => {
      expect(isValidVariant('Initial')).toBe(false);
      expect(isValidVariant('INITIAL')).toBe(false);
      expect(isValidVariant('no_results')).toBe(false);
      expect(isValidVariant('noresults')).toBe(false);
      expect(isValidVariant('rate_limited')).toBe(false);
    });

    it('should return false for partial matches', () => {
      expect(isValidVariant('init')).toBe(false);
      expect(isValidVariant('err')).toBe(false);
    });
  });

  describe('Type guard functionality', () => {
    it('should narrow type when true', () => {
      const value = 'initial';
      if (isValidVariant(value)) {
        // TypeScript should recognize value as EmptyStateVariant here
        const config = getEmptyStateConfig(value);
        expect(config).toBeDefined();
      }
    });
  });
});

// ============================================================================
// Edge Cases and Boundary Tests
// ============================================================================
describe('Edge Cases', () => {
  describe('detectEmptyStateVariant boundary conditions', () => {
    it('should handle negative resultsCount', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: null,
        resultsCount: -1
      };
      // Negative count should still show results (truthy check passes)
      expect(detectEmptyStateVariant(input)).toBe(null);
    });

    it('should handle very large resultsCount', () => {
      const input: EmptyStateDetectionInput = {
        hasSearched: true,
        isLoading: false,
        error: null,
        resultsCount: Number.MAX_SAFE_INTEGER
      };
      expect(detectEmptyStateVariant(input)).toBe(null);
    });
  });

  describe('isRateLimitError edge cases', () => {
    it('should handle error with empty message', () => {
      expect(isRateLimitError(new Error(''))).toBe(false);
    });

    it('should handle complex rate limit message', () => {
      const complexMessage =
        'GitHub API responded with status 403: rate limit exceeded for user. Reset at 2024-01-01T00:00:00Z';
      expect(isRateLimitError(complexMessage)).toBe(true);
    });
  });
});
