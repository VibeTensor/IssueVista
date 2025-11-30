/**
 * Loading Progress Utilities
 * Issue #23 - Loading progress with status messages and cancel option
 *
 * Provides utility functions for calculating progress percentages,
 * generating status messages, and managing loading states.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Progress state for tracking API fetch progress
 */
export interface ProgressState {
  /** Current page being fetched (1-indexed) */
  currentPage: number;
  /** Maximum number of pages to fetch */
  maxPages: number;
  /** Total issues found so far */
  issuesFound: number;
  /** Current phase of the loading process */
  phase: LoadingPhase;
  /** Whether the operation was cancelled */
  cancelled: boolean;
}

/**
 * Loading phases for different stages of the fetch process
 */
export type LoadingPhase =
  | 'initializing'
  | 'authenticating'
  | 'fetching'
  | 'processing'
  | 'complete'
  | 'cancelled'
  | 'error';

/**
 * Progress callback function signature
 */
export type ProgressCallback = (state: ProgressState) => void;

/**
 * Configuration for progress tracking
 */
export interface ProgressConfig {
  /** Maximum pages to fetch (default: 3 for GraphQL, 2 for REST) */
  maxPages: number;
  /** Whether using authenticated API */
  isAuthenticated: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Default max pages for GraphQL API */
export const GRAPHQL_MAX_PAGES = 3;

/** Default max pages for REST API */
export const REST_MAX_PAGES = 2;

/** Status messages for each phase */
export const PHASE_MESSAGES: Record<LoadingPhase, string> = {
  initializing: 'Initializing...',
  authenticating: 'Authenticating with GitHub...',
  fetching: 'Fetching issues...',
  processing: 'Processing results...',
  complete: 'Complete!',
  cancelled: 'Cancelled',
  error: 'An error occurred'
};

// ============================================================================
// Progress Calculation Functions
// ============================================================================

/**
 * Calculate progress percentage based on current state
 * @param state - Current progress state
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(state: ProgressState): number {
  if (state.phase === 'complete') return 100;
  if (state.phase === 'cancelled' || state.phase === 'error') return 0;
  if (state.phase === 'initializing') return 5;
  if (state.phase === 'authenticating') return 10;

  // For fetching phase, calculate based on pages
  if (state.phase === 'fetching') {
    const baseProgress = 15; // After auth
    const fetchProgress = 75; // Total progress allocated to fetching
    const pageProgress = (state.currentPage / state.maxPages) * fetchProgress;
    return Math.min(baseProgress + pageProgress, 90);
  }

  // Processing phase
  if (state.phase === 'processing') return 95;

  return 0;
}

/**
 * Generate a human-readable status message based on progress state
 * @param state - Current progress state
 * @returns Status message string
 */
export function getStatusMessage(state: ProgressState): string {
  switch (state.phase) {
    case 'initializing':
      return 'Initializing...';

    case 'authenticating':
      return 'Authenticating with GitHub...';

    case 'fetching':
      if (state.maxPages === 1) {
        return `Fetching issues...`;
      }
      return `Fetching page ${state.currentPage} of ${state.maxPages}...`;

    case 'processing':
      return `Processing ${state.issuesFound} issues...`;

    case 'complete':
      return `Found ${state.issuesFound} issues`;

    case 'cancelled':
      return 'Search cancelled';

    case 'error':
      return 'An error occurred';

    default:
      return 'Loading...';
  }
}

/**
 * Generate detailed status including issue count during fetch
 * @param state - Current progress state
 * @returns Detailed status message
 */
export function getDetailedStatus(state: ProgressState): string {
  const baseMessage = getStatusMessage(state);

  if (state.phase === 'fetching' && state.issuesFound > 0) {
    return `${baseMessage} (${state.issuesFound} found so far)`;
  }

  return baseMessage;
}

// ============================================================================
// State Factory Functions
// ============================================================================

/**
 * Create initial progress state
 * @param config - Progress configuration
 * @returns Initial progress state
 */
export function createInitialState(config: ProgressConfig): ProgressState {
  return {
    currentPage: 0,
    maxPages: config.maxPages,
    issuesFound: 0,
    phase: 'initializing',
    cancelled: false
  };
}

/**
 * Create state for authentication phase
 * @param prevState - Previous state
 * @returns Updated state
 */
export function toAuthenticatingState(prevState: ProgressState): ProgressState {
  return {
    ...prevState,
    phase: 'authenticating'
  };
}

/**
 * Create state for fetching phase
 * @param prevState - Previous state
 * @param currentPage - Current page number (1-indexed)
 * @param issuesFound - Total issues found so far
 * @returns Updated state
 */
export function toFetchingState(
  prevState: ProgressState,
  currentPage: number,
  issuesFound: number = prevState.issuesFound
): ProgressState {
  return {
    ...prevState,
    currentPage,
    issuesFound,
    phase: 'fetching'
  };
}

/**
 * Create state for processing phase
 * @param prevState - Previous state
 * @param totalIssues - Total issues to process
 * @returns Updated state
 */
export function toProcessingState(
  prevState: ProgressState,
  totalIssues: number
): ProgressState {
  return {
    ...prevState,
    issuesFound: totalIssues,
    phase: 'processing'
  };
}

/**
 * Create state for complete phase
 * @param prevState - Previous state
 * @param totalIssues - Final total issues
 * @returns Updated state
 */
export function toCompleteState(
  prevState: ProgressState,
  totalIssues: number
): ProgressState {
  return {
    ...prevState,
    issuesFound: totalIssues,
    phase: 'complete'
  };
}

/**
 * Create state for cancelled phase
 * @param prevState - Previous state
 * @returns Updated state
 */
export function toCancelledState(prevState: ProgressState): ProgressState {
  return {
    ...prevState,
    phase: 'cancelled',
    cancelled: true
  };
}

/**
 * Create state for error phase
 * @param prevState - Previous state
 * @returns Updated state
 */
export function toErrorState(prevState: ProgressState): ProgressState {
  return {
    ...prevState,
    phase: 'error'
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if the progress state indicates loading is in progress
 * @param state - Progress state to check
 * @returns True if loading is in progress
 */
export function isLoading(state: ProgressState): boolean {
  return ['initializing', 'authenticating', 'fetching', 'processing'].includes(state.phase);
}

/**
 * Check if the progress state indicates the operation can be cancelled
 * @param state - Progress state to check
 * @returns True if operation can be cancelled
 */
export function canCancel(state: ProgressState): boolean {
  return ['initializing', 'authenticating', 'fetching'].includes(state.phase);
}

/**
 * Get the appropriate color for progress bar based on phase
 * @param phase - Current loading phase
 * @returns Tailwind color class
 */
export function getProgressColor(phase: LoadingPhase): string {
  switch (phase) {
    case 'complete':
      return 'bg-emerald-500';
    case 'cancelled':
      return 'bg-amber-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-teal-500';
  }
}

/**
 * Format the page indicator text
 * @param currentPage - Current page (1-indexed)
 * @param maxPages - Maximum pages
 * @returns Formatted page indicator
 */
export function formatPageIndicator(currentPage: number, maxPages: number): string {
  if (maxPages <= 1) return '';
  return `Page ${currentPage} of ${maxPages}`;
}

/**
 * Estimate remaining time based on progress (simple linear estimate)
 * @param progress - Current progress percentage (0-100)
 * @param elapsedMs - Time elapsed in milliseconds
 * @returns Estimated remaining time string or null if cannot estimate
 */
export function estimateRemainingTime(progress: number, elapsedMs: number): string | null {
  if (progress <= 0 || progress >= 100) return null;

  const totalEstimatedMs = (elapsedMs / progress) * 100;
  const remainingMs = totalEstimatedMs - elapsedMs;

  if (remainingMs < 1000) return 'Almost done...';
  if (remainingMs < 5000) return 'A few seconds...';
  if (remainingMs < 10000) return 'Less than 10 seconds...';
  if (remainingMs < 30000) return 'Less than 30 seconds...';

  return 'This may take a moment...';
}
