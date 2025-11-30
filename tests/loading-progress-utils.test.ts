/**
 * Unit Tests for Loading Progress Utilities
 * Tests Issue #23 implementation - Loading progress with status messages and cancel option
 */

import { describe, it, expect } from 'vitest';
import {
  // Constants
  GRAPHQL_MAX_PAGES,
  REST_MAX_PAGES,
  PHASE_MESSAGES,
  // Types
  type ProgressState,
  type LoadingPhase,
  type ProgressConfig,
  // Progress Calculation
  calculateProgress,
  getStatusMessage,
  getDetailedStatus,
  // State Factory Functions
  createInitialState,
  toAuthenticatingState,
  toFetchingState,
  toProcessingState,
  toCompleteState,
  toCancelledState,
  toErrorState,
  // Utility Functions
  isLoading,
  canCancel,
  getProgressColor,
  formatPageIndicator,
  estimateRemainingTime
} from '../src/lib/loading-progress-utils';

// ============================================================================
// Constants Tests
// ============================================================================
describe('Loading Progress Constants', () => {
  describe('Page Limits', () => {
    it('should have GRAPHQL_MAX_PAGES set to 3', () => {
      expect(GRAPHQL_MAX_PAGES).toBe(3);
    });

    it('should have REST_MAX_PAGES set to 2', () => {
      expect(REST_MAX_PAGES).toBe(2);
    });

    it('should have GraphQL pages greater than REST pages', () => {
      expect(GRAPHQL_MAX_PAGES).toBeGreaterThan(REST_MAX_PAGES);
    });
  });

  describe('Phase Messages', () => {
    it('should have message for initializing phase', () => {
      expect(PHASE_MESSAGES.initializing).toBe('Initializing...');
    });

    it('should have message for authenticating phase', () => {
      expect(PHASE_MESSAGES.authenticating).toBe('Authenticating with GitHub...');
    });

    it('should have message for fetching phase', () => {
      expect(PHASE_MESSAGES.fetching).toBe('Fetching issues...');
    });

    it('should have message for processing phase', () => {
      expect(PHASE_MESSAGES.processing).toBe('Processing results...');
    });

    it('should have message for complete phase', () => {
      expect(PHASE_MESSAGES.complete).toBe('Complete!');
    });

    it('should have message for cancelled phase', () => {
      expect(PHASE_MESSAGES.cancelled).toBe('Cancelled');
    });

    it('should have message for error phase', () => {
      expect(PHASE_MESSAGES.error).toBe('An error occurred');
    });

    it('should have messages for all phases', () => {
      const phases: LoadingPhase[] = [
        'initializing',
        'authenticating',
        'fetching',
        'processing',
        'complete',
        'cancelled',
        'error'
      ];
      phases.forEach(phase => {
        expect(PHASE_MESSAGES[phase]).toBeDefined();
        expect(typeof PHASE_MESSAGES[phase]).toBe('string');
      });
    });
  });
});

// ============================================================================
// calculateProgress Tests
// ============================================================================
describe('calculateProgress', () => {
  describe('Terminal States', () => {
    it('should return 100 for complete phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'complete',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(100);
    });

    it('should return 0 for cancelled phase', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'cancelled',
        cancelled: true
      };
      expect(calculateProgress(state)).toBe(0);
    });

    it('should return 0 for error phase', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'error',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(0);
    });
  });

  describe('Initial Phases', () => {
    it('should return 5 for initializing phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(5);
    });

    it('should return 10 for authenticating phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'authenticating',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(10);
    });
  });

  describe('Fetching Phase Progress', () => {
    it('should calculate progress for page 1 of 3', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (1/3 * 75) = 15 + 25 = 40
      expect(progress).toBe(40);
    });

    it('should calculate progress for page 2 of 3', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (2/3 * 75) = 15 + 50 = 65
      expect(progress).toBe(65);
    });

    it('should calculate progress for page 3 of 3', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (3/3 * 75) = 15 + 75 = 90
      expect(progress).toBe(90);
    });

    it('should cap fetching progress at 90', () => {
      const state: ProgressState = {
        currentPage: 10,
        maxPages: 3,
        issuesFound: 300,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      expect(progress).toBeLessThanOrEqual(90);
    });

    it('should calculate progress for REST API (page 1 of 2)', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 2,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (1/2 * 75) = 15 + 37.5 = 52.5
      expect(progress).toBe(52.5);
    });

    it('should calculate progress for REST API (page 2 of 2)', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 200,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (2/2 * 75) = 15 + 75 = 90
      expect(progress).toBe(90);
    });

    it('should handle single page fetch', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 1,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const progress = calculateProgress(state);
      // Base 15 + (1/1 * 75) = 90
      expect(progress).toBe(90);
    });
  });

  describe('Processing Phase', () => {
    it('should return 95 for processing phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(95);
    });

    it('should return 95 regardless of issues found', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 0,
        phase: 'processing',
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(95);
    });
  });

  describe('Edge Cases', () => {
    it('should return 0 for unknown phase', () => {
      const state = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'unknown' as LoadingPhase,
        cancelled: false
      };
      expect(calculateProgress(state)).toBe(0);
    });

    it('should handle zero maxPages gracefully', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 0,
        issuesFound: 0,
        phase: 'fetching',
        cancelled: false
      };
      // Division by zero results in NaN (0/0)
      const progress = calculateProgress(state);
      expect(Number.isNaN(progress)).toBe(true);
    });
  });
});

// ============================================================================
// getStatusMessage Tests
// ============================================================================
describe('getStatusMessage', () => {
  describe('Phase-specific Messages', () => {
    it('should return initializing message', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Initializing...');
    });

    it('should return authenticating message', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'authenticating',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Authenticating with GitHub...');
    });

    it('should return cancelled message', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'cancelled',
        cancelled: true
      };
      expect(getStatusMessage(state)).toBe('Search cancelled');
    });

    it('should return error message', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'error',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('An error occurred');
    });
  });

  describe('Fetching Phase Messages', () => {
    it('should include page numbers in fetching message', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Fetching page 2 of 3...');
    });

    it('should show simple message for single page fetch', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 1,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Fetching issues...');
    });

    it('should show page 1 of 2 for REST API', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 2,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Fetching page 1 of 2...');
    });
  });

  describe('Processing Phase Messages', () => {
    it('should include issue count in processing message', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Processing 150 issues...');
    });

    it('should handle zero issues in processing', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 0,
        phase: 'processing',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Processing 0 issues...');
    });
  });

  describe('Complete Phase Messages', () => {
    it('should include issue count in complete message', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 127,
        phase: 'complete',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Found 127 issues');
    });

    it('should handle zero issues in complete', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 0,
        phase: 'complete',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Found 0 issues');
    });

    it('should handle large issue counts', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 10000,
        phase: 'complete',
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Found 10000 issues');
    });
  });

  describe('Default Message', () => {
    it('should return Loading... for unknown phase', () => {
      const state = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'unknown' as LoadingPhase,
        cancelled: false
      };
      expect(getStatusMessage(state)).toBe('Loading...');
    });
  });
});

// ============================================================================
// getDetailedStatus Tests
// ============================================================================
describe('getDetailedStatus', () => {
  describe('Fetching Phase with Issues', () => {
    it('should append issue count to fetching message when issues found', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 127,
        phase: 'fetching',
        cancelled: false
      };
      expect(getDetailedStatus(state)).toBe('Fetching page 2 of 3... (127 found so far)');
    });

    it('should not append when zero issues found', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 0,
        phase: 'fetching',
        cancelled: false
      };
      expect(getDetailedStatus(state)).toBe('Fetching page 1 of 3...');
    });
  });

  describe('Non-fetching Phases', () => {
    it('should return base message for initializing', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      expect(getDetailedStatus(state)).toBe('Initializing...');
    });

    it('should return base message for complete', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'complete',
        cancelled: false
      };
      expect(getDetailedStatus(state)).toBe('Found 150 issues');
    });

    it('should return base message for processing', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      expect(getDetailedStatus(state)).toBe('Processing 150 issues...');
    });
  });
});

// ============================================================================
// State Factory Functions Tests
// ============================================================================
describe('State Factory Functions', () => {
  describe('createInitialState', () => {
    it('should create initial state with GraphQL config', () => {
      const config: ProgressConfig = {
        maxPages: GRAPHQL_MAX_PAGES,
        isAuthenticated: true
      };
      const state = createInitialState(config);

      expect(state.currentPage).toBe(0);
      expect(state.maxPages).toBe(3);
      expect(state.issuesFound).toBe(0);
      expect(state.phase).toBe('initializing');
      expect(state.cancelled).toBe(false);
    });

    it('should create initial state with REST config', () => {
      const config: ProgressConfig = {
        maxPages: REST_MAX_PAGES,
        isAuthenticated: false
      };
      const state = createInitialState(config);

      expect(state.maxPages).toBe(2);
      expect(state.phase).toBe('initializing');
    });

    it('should create initial state with custom maxPages', () => {
      const config: ProgressConfig = {
        maxPages: 5,
        isAuthenticated: true
      };
      const state = createInitialState(config);

      expect(state.maxPages).toBe(5);
    });
  });

  describe('toAuthenticatingState', () => {
    it('should transition to authenticating phase', () => {
      const prev = createInitialState({ maxPages: 3, isAuthenticated: true });
      const state = toAuthenticatingState(prev);

      expect(state.phase).toBe('authenticating');
      expect(state.currentPage).toBe(0);
      expect(state.issuesFound).toBe(0);
      expect(state.cancelled).toBe(false);
    });

    it('should preserve other state properties', () => {
      const prev: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      const state = toAuthenticatingState(prev);

      expect(state.maxPages).toBe(prev.maxPages);
    });
  });

  describe('toFetchingState', () => {
    it('should transition to fetching phase with page number', () => {
      const prev = createInitialState({ maxPages: 3, isAuthenticated: true });
      const state = toFetchingState(prev, 1);

      expect(state.phase).toBe('fetching');
      expect(state.currentPage).toBe(1);
    });

    it('should update issues found', () => {
      const prev = createInitialState({ maxPages: 3, isAuthenticated: true });
      const state = toFetchingState(prev, 2, 100);

      expect(state.currentPage).toBe(2);
      expect(state.issuesFound).toBe(100);
    });

    it('should preserve previous issues count if not provided', () => {
      const prev: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const state = toFetchingState(prev, 2);

      expect(state.issuesFound).toBe(50);
    });

    it('should allow updating to page 3', () => {
      const prev = createInitialState({ maxPages: 3, isAuthenticated: true });
      const state = toFetchingState(prev, 3, 150);

      expect(state.currentPage).toBe(3);
      expect(state.issuesFound).toBe(150);
    });
  });

  describe('toProcessingState', () => {
    it('should transition to processing phase', () => {
      const prev: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const state = toProcessingState(prev, 150);

      expect(state.phase).toBe('processing');
      expect(state.issuesFound).toBe(150);
    });

    it('should preserve page info', () => {
      const prev: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const state = toProcessingState(prev, 200);

      expect(state.currentPage).toBe(2);
      expect(state.maxPages).toBe(2);
    });
  });

  describe('toCompleteState', () => {
    it('should transition to complete phase', () => {
      const prev: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      const state = toCompleteState(prev, 150);

      expect(state.phase).toBe('complete');
      expect(state.issuesFound).toBe(150);
    });

    it('should handle zero issues', () => {
      const prev: ProgressState = {
        currentPage: 2,
        maxPages: 2,
        issuesFound: 0,
        phase: 'processing',
        cancelled: false
      };
      const state = toCompleteState(prev, 0);

      expect(state.phase).toBe('complete');
      expect(state.issuesFound).toBe(0);
    });
  });

  describe('toCancelledState', () => {
    it('should transition to cancelled phase', () => {
      const prev: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const state = toCancelledState(prev);

      expect(state.phase).toBe('cancelled');
      expect(state.cancelled).toBe(true);
    });

    it('should preserve issues found', () => {
      const prev: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 127,
        phase: 'fetching',
        cancelled: false
      };
      const state = toCancelledState(prev);

      expect(state.issuesFound).toBe(127);
    });

    it('should preserve page info for partial results', () => {
      const prev: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const state = toCancelledState(prev);

      expect(state.currentPage).toBe(1);
      expect(state.maxPages).toBe(3);
    });
  });

  describe('toErrorState', () => {
    it('should transition to error phase', () => {
      const prev: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const state = toErrorState(prev);

      expect(state.phase).toBe('error');
    });

    it('should preserve all other state', () => {
      const prev: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      const state = toErrorState(prev);

      expect(state.currentPage).toBe(2);
      expect(state.maxPages).toBe(3);
      expect(state.issuesFound).toBe(100);
      expect(state.cancelled).toBe(false);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state', () => {
      const original: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'fetching',
        cancelled: false
      };
      const originalCopy = { ...original };

      toFetchingState(original, 2, 100);

      expect(original).toEqual(originalCopy);
    });

    it('should create new object for each transition', () => {
      const prev = createInitialState({ maxPages: 3, isAuthenticated: true });
      const auth = toAuthenticatingState(prev);
      const fetch = toFetchingState(auth, 1);

      expect(prev).not.toBe(auth);
      expect(auth).not.toBe(fetch);
    });
  });
});

// ============================================================================
// Utility Functions Tests
// ============================================================================
describe('Utility Functions', () => {
  describe('isLoading', () => {
    it('should return true for initializing phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      expect(isLoading(state)).toBe(true);
    });

    it('should return true for authenticating phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'authenticating',
        cancelled: false
      };
      expect(isLoading(state)).toBe(true);
    });

    it('should return true for fetching phase', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      expect(isLoading(state)).toBe(true);
    });

    it('should return true for processing phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      expect(isLoading(state)).toBe(true);
    });

    it('should return false for complete phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'complete',
        cancelled: false
      };
      expect(isLoading(state)).toBe(false);
    });

    it('should return false for cancelled phase', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'cancelled',
        cancelled: true
      };
      expect(isLoading(state)).toBe(false);
    });

    it('should return false for error phase', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'error',
        cancelled: false
      };
      expect(isLoading(state)).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('should return true for initializing phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'initializing',
        cancelled: false
      };
      expect(canCancel(state)).toBe(true);
    });

    it('should return true for authenticating phase', () => {
      const state: ProgressState = {
        currentPage: 0,
        maxPages: 3,
        issuesFound: 0,
        phase: 'authenticating',
        cancelled: false
      };
      expect(canCancel(state)).toBe(true);
    });

    it('should return true for fetching phase', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'fetching',
        cancelled: false
      };
      expect(canCancel(state)).toBe(true);
    });

    it('should return false for processing phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'processing',
        cancelled: false
      };
      expect(canCancel(state)).toBe(false);
    });

    it('should return false for complete phase', () => {
      const state: ProgressState = {
        currentPage: 3,
        maxPages: 3,
        issuesFound: 150,
        phase: 'complete',
        cancelled: false
      };
      expect(canCancel(state)).toBe(false);
    });

    it('should return false for cancelled phase', () => {
      const state: ProgressState = {
        currentPage: 2,
        maxPages: 3,
        issuesFound: 100,
        phase: 'cancelled',
        cancelled: true
      };
      expect(canCancel(state)).toBe(false);
    });

    it('should return false for error phase', () => {
      const state: ProgressState = {
        currentPage: 1,
        maxPages: 3,
        issuesFound: 50,
        phase: 'error',
        cancelled: false
      };
      expect(canCancel(state)).toBe(false);
    });
  });

  describe('getProgressColor', () => {
    it('should return emerald for complete phase', () => {
      expect(getProgressColor('complete')).toBe('bg-emerald-500');
    });

    it('should return amber for cancelled phase', () => {
      expect(getProgressColor('cancelled')).toBe('bg-amber-500');
    });

    it('should return red for error phase', () => {
      expect(getProgressColor('error')).toBe('bg-red-500');
    });

    it('should return teal for initializing phase', () => {
      expect(getProgressColor('initializing')).toBe('bg-teal-500');
    });

    it('should return teal for authenticating phase', () => {
      expect(getProgressColor('authenticating')).toBe('bg-teal-500');
    });

    it('should return teal for fetching phase', () => {
      expect(getProgressColor('fetching')).toBe('bg-teal-500');
    });

    it('should return teal for processing phase', () => {
      expect(getProgressColor('processing')).toBe('bg-teal-500');
    });

    it('should return teal for unknown phase', () => {
      expect(getProgressColor('unknown' as LoadingPhase)).toBe('bg-teal-500');
    });
  });

  describe('formatPageIndicator', () => {
    it('should format page indicator correctly', () => {
      expect(formatPageIndicator(1, 3)).toBe('Page 1 of 3');
    });

    it('should format page 2 of 3', () => {
      expect(formatPageIndicator(2, 3)).toBe('Page 2 of 3');
    });

    it('should format page 3 of 3', () => {
      expect(formatPageIndicator(3, 3)).toBe('Page 3 of 3');
    });

    it('should return empty string for single page', () => {
      expect(formatPageIndicator(1, 1)).toBe('');
    });

    it('should return empty string for zero max pages', () => {
      expect(formatPageIndicator(0, 0)).toBe('');
    });

    it('should format REST API pages (1 of 2)', () => {
      expect(formatPageIndicator(1, 2)).toBe('Page 1 of 2');
    });

    it('should format REST API pages (2 of 2)', () => {
      expect(formatPageIndicator(2, 2)).toBe('Page 2 of 2');
    });
  });

  describe('estimateRemainingTime', () => {
    it('should return null for zero progress', () => {
      expect(estimateRemainingTime(0, 1000)).toBe(null);
    });

    it('should return null for 100% progress', () => {
      expect(estimateRemainingTime(100, 5000)).toBe(null);
    });

    it('should return null for negative progress', () => {
      expect(estimateRemainingTime(-10, 1000)).toBe(null);
    });

    it('should return "Almost done..." for less than 1 second', () => {
      // 95% progress, 9500ms elapsed -> total 10000ms, remaining 500ms
      expect(estimateRemainingTime(95, 9500)).toBe('Almost done...');
    });

    it('should return "A few seconds..." for 1-5 seconds', () => {
      // 50% progress, 2500ms elapsed -> 2500ms remaining
      expect(estimateRemainingTime(50, 2500)).toBe('A few seconds...');
    });

    it('should return "Less than 10 seconds..." for 5-10 seconds', () => {
      // 40% progress, 4000ms elapsed -> total 10000ms, remaining 6000ms
      expect(estimateRemainingTime(40, 4000)).toBe('Less than 10 seconds...');
    });

    it('should return "Less than 30 seconds..." for 10-30 seconds', () => {
      // 50% progress, 10000ms elapsed -> 10000ms remaining
      expect(estimateRemainingTime(50, 10000)).toBe('Less than 30 seconds...');
    });

    it('should return "This may take a moment..." for more than 30 seconds', () => {
      // 20% progress, 10000ms elapsed -> 40000ms remaining
      expect(estimateRemainingTime(20, 10000)).toBe('This may take a moment...');
    });

    it('should handle progress greater than 100', () => {
      expect(estimateRemainingTime(150, 5000)).toBe(null);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================
describe('Loading Progress Integration', () => {
  describe('Full State Flow', () => {
    it('should transition through all phases correctly', () => {
      // Create initial state
      const initial = createInitialState({ maxPages: 3, isAuthenticated: true });
      expect(initial.phase).toBe('initializing');
      expect(calculateProgress(initial)).toBe(5);

      // Transition to authenticating
      const auth = toAuthenticatingState(initial);
      expect(auth.phase).toBe('authenticating');
      expect(calculateProgress(auth)).toBe(10);

      // Transition to fetching page 1
      const fetch1 = toFetchingState(auth, 1, 50);
      expect(fetch1.phase).toBe('fetching');
      expect(fetch1.currentPage).toBe(1);
      expect(calculateProgress(fetch1)).toBe(40);

      // Transition to fetching page 2
      const fetch2 = toFetchingState(fetch1, 2, 100);
      expect(fetch2.currentPage).toBe(2);
      expect(calculateProgress(fetch2)).toBe(65);

      // Transition to fetching page 3
      const fetch3 = toFetchingState(fetch2, 3, 150);
      expect(fetch3.currentPage).toBe(3);
      expect(calculateProgress(fetch3)).toBe(90);

      // Transition to processing
      const processing = toProcessingState(fetch3, 150);
      expect(processing.phase).toBe('processing');
      expect(calculateProgress(processing)).toBe(95);

      // Transition to complete
      const complete = toCompleteState(processing, 150);
      expect(complete.phase).toBe('complete');
      expect(calculateProgress(complete)).toBe(100);
    });

    it('should handle cancel flow correctly', () => {
      const initial = createInitialState({ maxPages: 3, isAuthenticated: true });
      const auth = toAuthenticatingState(initial);
      const fetch = toFetchingState(auth, 2, 100);

      expect(canCancel(fetch)).toBe(true);

      const cancelled = toCancelledState(fetch);
      expect(cancelled.phase).toBe('cancelled');
      expect(cancelled.cancelled).toBe(true);
      expect(cancelled.issuesFound).toBe(100);
      expect(canCancel(cancelled)).toBe(false);
    });

    it('should handle error flow correctly', () => {
      const initial = createInitialState({ maxPages: 3, isAuthenticated: true });
      const fetch = toFetchingState(initial, 1, 50);

      const error = toErrorState(fetch);
      expect(error.phase).toBe('error');
      expect(calculateProgress(error)).toBe(0);
      expect(isLoading(error)).toBe(false);
      expect(canCancel(error)).toBe(false);
    });
  });

  describe('REST API Flow', () => {
    it('should work with REST API limits', () => {
      const initial = createInitialState({ maxPages: REST_MAX_PAGES, isAuthenticated: false });
      expect(initial.maxPages).toBe(2);

      const fetch1 = toFetchingState(initial, 1, 100);
      expect(getStatusMessage(fetch1)).toBe('Fetching page 1 of 2...');

      const fetch2 = toFetchingState(fetch1, 2, 200);
      expect(getStatusMessage(fetch2)).toBe('Fetching page 2 of 2...');

      const complete = toCompleteState(fetch2, 200);
      expect(getStatusMessage(complete)).toBe('Found 200 issues');
    });
  });

  describe('Progress Calculation Consistency', () => {
    it('should have monotonically increasing progress for normal flow', () => {
      const initial = createInitialState({ maxPages: 3, isAuthenticated: true });
      const auth = toAuthenticatingState(initial);
      const fetch1 = toFetchingState(auth, 1);
      const fetch2 = toFetchingState(fetch1, 2);
      const fetch3 = toFetchingState(fetch2, 3);
      const processing = toProcessingState(fetch3, 150);
      const complete = toCompleteState(processing, 150);

      const progresses = [
        calculateProgress(initial),
        calculateProgress(auth),
        calculateProgress(fetch1),
        calculateProgress(fetch2),
        calculateProgress(fetch3),
        calculateProgress(processing),
        calculateProgress(complete)
      ];

      // Each progress should be greater than or equal to the previous
      for (let i = 1; i < progresses.length; i++) {
        expect(progresses[i]).toBeGreaterThanOrEqual(progresses[i - 1]);
      }
    });
  });
});
