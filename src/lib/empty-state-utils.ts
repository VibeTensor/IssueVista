/**
 * Empty State Utility Functions
 * Issue #30 - Helper functions for EmptyState component
 *
 * Provides:
 * - Type definitions for empty state variants
 * - Configuration objects for each variant
 * - Pure functions for state detection
 * - Accessibility helpers for screen readers
 *
 * Extracted for testability and reusability
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Empty state variant types
 * Matches the visual/UX states in EmptyState.svelte
 */
export type EmptyStateVariant =
  | 'initial' // First visit, no search yet
  | 'no-results' // Search completed, zero issues found
  | 'error' // API error, invalid repo, network failure
  | 'rate-limited' // GitHub API rate limit exceeded
  | 'success'; // All issues reviewed (future use)

/**
 * Configuration for each empty state variant
 */
export interface EmptyStateConfig {
  /** Primary heading text */
  title: string;
  /** Descriptive secondary text */
  description: string;
  /** Label for primary action button */
  primaryActionLabel?: string;
  /** Label for secondary action link */
  secondaryActionLabel?: string;
  /** URL for secondary action (external link) */
  secondaryActionHref?: string;
  /** Screen reader announcement for state change */
  announcement: string;
}

/**
 * Input state for variant detection
 */
export interface EmptyStateDetectionInput {
  /** Whether a search has been performed */
  hasSearched: boolean;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Current error (if any) */
  error: Error | string | null;
  /** Number of results returned */
  resultsCount: number;
}

// ============================================================================
// URL Constants
// ============================================================================

/** IssueVista README URL */
export const README_URL = 'https://github.com/VibeTensor/IssueVista#readme';

/** IssueVista Issues URL for reporting bugs */
export const ISSUES_URL = 'https://github.com/VibeTensor/IssueVista/issues';

/** GitHub Rate Limit Documentation URL */
export const RATE_LIMIT_DOCS_URL = 'https://docs.github.com/en/rest/rate-limit';

// ============================================================================
// Configuration Object
// ============================================================================

/**
 * Configuration for all empty state variants
 * Uses Record type for type-safe lookup by variant
 */
export const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  initial: {
    title: 'Enter a repository URL',
    description: 'Or click a quick pick above to get started',
    secondaryActionLabel: 'How it works',
    secondaryActionHref: README_URL,
    announcement: 'Ready to search. Enter a GitHub repository URL to find issues.'
  },
  'no-results': {
    title: 'No issues found',
    description:
      'This repository has no unassigned issues without pull requests. Try another repository or adjust filters',
    primaryActionLabel: 'Clear Filters',
    secondaryActionLabel: 'Try another repo',
    announcement: 'No issues found for this repository.'
  },
  error: {
    title: 'Something went wrong',
    description:
      "We couldn't fetch issues from this repository. Please check the URL and try again",
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Report Issue',
    secondaryActionHref: ISSUES_URL,
    announcement: 'Error loading issues. Please try again.'
  },
  'rate-limited': {
    title: 'API limit reached',
    description: "GitHub's rate limit was exceeded. Please wait a moment and try again",
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Learn about rate limits',
    secondaryActionHref: RATE_LIMIT_DOCS_URL,
    announcement: 'GitHub API rate limit exceeded. Please wait before retrying.'
  },
  success: {
    title: 'All caught up!',
    description: "You've reviewed all the issues. Time for a well-deserved break!",
    primaryActionLabel: 'Search Another Repo',
    announcement: 'All issues reviewed. Great job!'
  }
};

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Get configuration for a specific empty state variant
 * Pure function - same input always returns same output
 *
 * @param variant - The empty state variant type
 * @returns Configuration object for the variant
 *
 * @example
 * const config = getEmptyStateConfig('initial');
 * console.log(config.title); // 'Ready to find issues?'
 */
export function getEmptyStateConfig(variant: EmptyStateVariant): EmptyStateConfig {
  return EMPTY_STATE_CONFIGS[variant];
}

/**
 * Check if an error indicates GitHub API rate limiting
 * Detects various rate limit error message patterns
 *
 * @param error - Error to check (can be Error object or string)
 * @returns true if error is rate limit related
 *
 * @example
 * isRateLimitError('API rate limit exceeded'); // true
 * isRateLimitError('Not found'); // false
 */
export function isRateLimitError(error: Error | string | null): boolean {
  if (!error) return false;

  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // Check for explicit rate limit patterns
  const hasRateLimitKeyword =
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('rate_limit') ||
    lowerMessage.includes('api limit') ||
    lowerMessage.includes('limit exceeded') ||
    lowerMessage.includes('quota exceeded');

  // 403 alone may be a different error (e.g., permission denied)
  // Only treat 403 as rate limit if combined with rate/limit/quota keywords
  const is403RateLimited =
    lowerMessage.includes('403') &&
    (lowerMessage.includes('rate') ||
      lowerMessage.includes('limit') ||
      lowerMessage.includes('quota'));

  return hasRateLimitKeyword || is403RateLimited;
}

/**
 * Check if value represents an error state
 * Validates that error is not null, undefined, or empty string
 *
 * @param error - Value to check
 * @returns true if error exists and is truthy
 *
 * @example
 * isErrorState(new Error('test')); // true
 * isErrorState(null); // false
 * isErrorState(''); // false
 */
export function isErrorState(error: unknown): boolean {
  if (error === null || error === undefined) return false;
  if (typeof error === 'string' && error.trim() === '') return false;
  return true;
}

/**
 * Detect which empty state variant to display based on current state
 * Pure function implementing state detection logic
 *
 * Priority order:
 * 1. Loading - return null (no empty state)
 * 2. Rate limit error - return 'rate-limited'
 * 3. General error - return 'error'
 * 4. Not searched yet - return 'initial'
 * 5. No results - return 'no-results'
 * 6. Has results - return null (show results)
 *
 * @param input - Current application state
 * @returns Variant to display, or null if content should be shown
 *
 * @example
 * detectEmptyStateVariant({
 *   hasSearched: false,
 *   isLoading: false,
 *   error: null,
 *   resultsCount: 0
 * }); // 'initial'
 */
export function detectEmptyStateVariant(input: EmptyStateDetectionInput): EmptyStateVariant | null {
  const { hasSearched, isLoading, error, resultsCount } = input;

  // Don't show empty state while loading
  if (isLoading) {
    return null;
  }

  // Check for rate limit error first (specific error type)
  if (error && isRateLimitError(error)) {
    return 'rate-limited';
  }

  // Check for general error
  if (isErrorState(error)) {
    return 'error';
  }

  // Initial state - no search performed yet
  if (!hasSearched) {
    return 'initial';
  }

  // Search completed but no results
  if (resultsCount === 0) {
    return 'no-results';
  }

  // Has results - don't show empty state
  return null;
}

/**
 * Get screen reader announcement for an empty state variant
 * Used for ARIA live region updates to announce state changes
 *
 * @param variant - Empty state variant
 * @returns Announcement text optimized for screen readers
 *
 * @example
 * getEmptyStateAnnouncement('error');
 * // 'Error loading issues. Please try again.'
 */
export function getEmptyStateAnnouncement(variant: EmptyStateVariant): string {
  return EMPTY_STATE_CONFIGS[variant].announcement;
}

/**
 * Get all available empty state variants
 * Derived from EMPTY_STATE_CONFIGS to ensure consistency
 * Useful for testing and validation
 *
 * @returns Array of all variant types
 */
export function getAllVariants(): EmptyStateVariant[] {
  return Object.keys(EMPTY_STATE_CONFIGS) as EmptyStateVariant[];
}

/**
 * Check if a string is a valid empty state variant
 * Type guard for runtime validation
 *
 * @param value - String to check
 * @returns true if value is a valid EmptyStateVariant
 *
 * @example
 * isValidVariant('initial'); // true
 * isValidVariant('unknown'); // false
 */
export function isValidVariant(value: string): value is EmptyStateVariant {
  return getAllVariants().includes(value as EmptyStateVariant);
}
