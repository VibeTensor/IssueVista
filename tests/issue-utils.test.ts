/**
 * Unit Tests for Issue Utilities
 * Tests Issue #20 implementation - zero-comment detection, filtering, and sorting
 */

import { describe, it, expect } from 'vitest';
import type { GitHubIssue } from '../src/lib/github-graphql';
import {
  isZeroComment,
  getCommentLevel,
  getCommentCount,
  filterZeroCommentIssues,
  filterByCommentLevel,
  sortByComments,
  countZeroCommentIssues,
  hasZeroCommentIssues
} from '../src/lib/issue-utils';

/**
 * Helper function to create a mock GitHubIssue with specified comment count
 * @param commentCount - Number of comments for the issue
 * @param number - Issue number (optional, defaults to 1)
 * @returns Mock GitHubIssue object
 */
function createMockIssue(commentCount: number, number: number = 1): GitHubIssue {
  return {
    number,
    title: `Test Issue #${number}`,
    url: `https://github.com/test/repo/issues/${number}`,
    createdAt: '2025-11-29T00:00:00Z',
    updatedAt: '2025-11-29T00:00:00Z',
    comments: { totalCount: commentCount },
    labels: { nodes: [] },
    timelineItems: { nodes: [] }
  };
}

/**
 * Helper function to create an array of mock issues with varying comment counts
 * @param commentCounts - Array of comment counts
 * @returns Array of mock GitHubIssue objects
 */
function createMockIssues(commentCounts: number[]): GitHubIssue[] {
  return commentCounts.map((count, index) => createMockIssue(count, index + 1));
}

// ============================================================================
// isZeroComment Tests
// ============================================================================
describe('isZeroComment', () => {
  describe('returns true for zero comments', () => {
    it('should return true for issue with 0 comments', () => {
      const issue = createMockIssue(0);
      expect(isZeroComment(issue)).toBe(true);
    });
  });

  describe('returns false for non-zero comments', () => {
    it('should return false for issue with 1 comment', () => {
      const issue = createMockIssue(1);
      expect(isZeroComment(issue)).toBe(false);
    });

    it('should return false for issue with 5 comments', () => {
      const issue = createMockIssue(5);
      expect(isZeroComment(issue)).toBe(false);
    });

    it('should return false for issue with 100 comments', () => {
      const issue = createMockIssue(100);
      expect(isZeroComment(issue)).toBe(false);
    });
  });

  describe('handles edge cases', () => {
    it('should return false for null issue', () => {
      expect(isZeroComment(null as unknown as GitHubIssue)).toBe(false);
    });

    it('should return false for undefined issue', () => {
      expect(isZeroComment(undefined as unknown as GitHubIssue)).toBe(false);
    });

    it('should return false for issue without comments property', () => {
      const issue = { number: 1, title: 'Test' } as GitHubIssue;
      expect(isZeroComment(issue)).toBe(false);
    });
  });
});

// ============================================================================
// getCommentLevel Tests
// ============================================================================
describe('getCommentLevel', () => {
  describe('returns "zero" for 0 comments', () => {
    it('should return "zero" for issue with 0 comments', () => {
      const issue = createMockIssue(0);
      expect(getCommentLevel(issue)).toBe('zero');
    });
  });

  describe('returns "low" for 1-5 comments', () => {
    it('should return "low" for issue with 1 comment', () => {
      const issue = createMockIssue(1);
      expect(getCommentLevel(issue)).toBe('low');
    });

    it('should return "low" for issue with 3 comments', () => {
      const issue = createMockIssue(3);
      expect(getCommentLevel(issue)).toBe('low');
    });

    it('should return "low" for issue with 5 comments (boundary)', () => {
      const issue = createMockIssue(5);
      expect(getCommentLevel(issue)).toBe('low');
    });
  });

  describe('returns "active" for 6+ comments', () => {
    it('should return "active" for issue with 6 comments (boundary)', () => {
      const issue = createMockIssue(6);
      expect(getCommentLevel(issue)).toBe('active');
    });

    it('should return "active" for issue with 10 comments', () => {
      const issue = createMockIssue(10);
      expect(getCommentLevel(issue)).toBe('active');
    });

    it('should return "active" for issue with 100 comments', () => {
      const issue = createMockIssue(100);
      expect(getCommentLevel(issue)).toBe('active');
    });
  });

  describe('handles edge cases', () => {
    it('should return "active" for null issue', () => {
      expect(getCommentLevel(null as unknown as GitHubIssue)).toBe('active');
    });

    it('should return "active" for undefined issue', () => {
      expect(getCommentLevel(undefined as unknown as GitHubIssue)).toBe('active');
    });

    it('should return "active" for issue without comments property', () => {
      const issue = { number: 1, title: 'Test' } as GitHubIssue;
      expect(getCommentLevel(issue)).toBe('active');
    });
  });
});

// ============================================================================
// getCommentCount Tests
// ============================================================================
describe('getCommentCount', () => {
  describe('returns correct count', () => {
    it('should return 0 for issue with 0 comments', () => {
      const issue = createMockIssue(0);
      expect(getCommentCount(issue)).toBe(0);
    });

    it('should return 5 for issue with 5 comments', () => {
      const issue = createMockIssue(5);
      expect(getCommentCount(issue)).toBe(5);
    });

    it('should return 100 for issue with 100 comments', () => {
      const issue = createMockIssue(100);
      expect(getCommentCount(issue)).toBe(100);
    });
  });

  describe('handles edge cases', () => {
    it('should return 0 for null issue', () => {
      expect(getCommentCount(null as unknown as GitHubIssue)).toBe(0);
    });

    it('should return 0 for undefined issue', () => {
      expect(getCommentCount(undefined as unknown as GitHubIssue)).toBe(0);
    });

    it('should return 0 for issue without comments property', () => {
      const issue = { number: 1, title: 'Test' } as GitHubIssue;
      expect(getCommentCount(issue)).toBe(0);
    });
  });
});

// ============================================================================
// filterZeroCommentIssues Tests
// ============================================================================
describe('filterZeroCommentIssues', () => {
  describe('filters correctly', () => {
    it('should return only zero-comment issues', () => {
      const issues = createMockIssues([0, 5, 0, 10, 0]);
      const result = filterZeroCommentIssues(issues);
      expect(result).toHaveLength(3);
      expect(result.every((issue) => issue.comments.totalCount === 0)).toBe(true);
    });

    it('should return empty array if no zero-comment issues', () => {
      const issues = createMockIssues([1, 5, 10]);
      const result = filterZeroCommentIssues(issues);
      expect(result).toHaveLength(0);
    });

    it('should return all issues if all have zero comments', () => {
      const issues = createMockIssues([0, 0, 0]);
      const result = filterZeroCommentIssues(issues);
      expect(result).toHaveLength(3);
    });
  });

  describe('handles edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = filterZeroCommentIssues([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for null input', () => {
      const result = filterZeroCommentIssues(null as unknown as GitHubIssue[]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for undefined input', () => {
      const result = filterZeroCommentIssues(undefined as unknown as GitHubIssue[]);
      expect(result).toHaveLength(0);
    });
  });

  describe('does not mutate original array', () => {
    it('should not modify the original array', () => {
      const issues = createMockIssues([0, 5, 0]);
      const originalLength = issues.length;
      filterZeroCommentIssues(issues);
      expect(issues).toHaveLength(originalLength);
    });
  });
});

// ============================================================================
// filterByCommentLevel Tests
// ============================================================================
describe('filterByCommentLevel', () => {
  describe('filters by "zero" level', () => {
    it('should return only zero-comment issues', () => {
      const issues = createMockIssues([0, 3, 0, 10]);
      const result = filterByCommentLevel(issues, 'zero');
      expect(result).toHaveLength(2);
      expect(result.every((issue) => issue.comments.totalCount === 0)).toBe(true);
    });
  });

  describe('filters by "low" level', () => {
    it('should return only low-comment issues (1-5)', () => {
      const issues = createMockIssues([0, 1, 3, 5, 6, 10]);
      const result = filterByCommentLevel(issues, 'low');
      expect(result).toHaveLength(3);
      expect(result.map((i) => i.comments.totalCount)).toEqual([1, 3, 5]);
    });
  });

  describe('filters by "active" level', () => {
    it('should return only active-comment issues (6+)', () => {
      const issues = createMockIssues([0, 3, 6, 10, 100]);
      const result = filterByCommentLevel(issues, 'active');
      expect(result).toHaveLength(3);
      expect(result.every((issue) => issue.comments.totalCount >= 6)).toBe(true);
    });
  });

  describe('handles edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = filterByCommentLevel([], 'zero');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for null input', () => {
      const result = filterByCommentLevel(null as unknown as GitHubIssue[], 'zero');
      expect(result).toHaveLength(0);
    });
  });
});

// ============================================================================
// sortByComments Tests
// ============================================================================
describe('sortByComments', () => {
  describe('sorts in ascending order', () => {
    it('should sort issues by comment count ascending', () => {
      const issues = createMockIssues([10, 0, 5, 3]);
      const result = sortByComments(issues, 'asc');
      expect(result.map((i) => i.comments.totalCount)).toEqual([0, 3, 5, 10]);
    });

    it('should use ascending as default order', () => {
      const issues = createMockIssues([10, 0, 5]);
      const result = sortByComments(issues);
      expect(result.map((i) => i.comments.totalCount)).toEqual([0, 5, 10]);
    });
  });

  describe('sorts in descending order', () => {
    it('should sort issues by comment count descending', () => {
      const issues = createMockIssues([0, 10, 5, 3]);
      const result = sortByComments(issues, 'desc');
      expect(result.map((i) => i.comments.totalCount)).toEqual([10, 5, 3, 0]);
    });
  });

  describe('handles edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = sortByComments([], 'asc');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for null input', () => {
      const result = sortByComments(null as unknown as GitHubIssue[], 'asc');
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', () => {
      const issues = createMockIssues([5]);
      const result = sortByComments(issues, 'asc');
      expect(result).toHaveLength(1);
      expect(result[0].comments.totalCount).toBe(5);
    });

    it('should handle array with equal values', () => {
      const issues = createMockIssues([5, 5, 5]);
      const result = sortByComments(issues, 'asc');
      expect(result).toHaveLength(3);
      expect(result.every((i) => i.comments.totalCount === 5)).toBe(true);
    });
  });

  describe('does not mutate original array', () => {
    it('should return a new array', () => {
      const issues = createMockIssues([10, 0, 5]);
      const result = sortByComments(issues, 'asc');
      expect(result).not.toBe(issues);
    });

    it('should not modify the original array order', () => {
      const issues = createMockIssues([10, 0, 5]);
      const originalOrder = issues.map((i) => i.comments.totalCount);
      sortByComments(issues, 'asc');
      expect(issues.map((i) => i.comments.totalCount)).toEqual(originalOrder);
    });
  });
});

// ============================================================================
// countZeroCommentIssues Tests
// ============================================================================
describe('countZeroCommentIssues', () => {
  describe('counts correctly', () => {
    it('should return correct count of zero-comment issues', () => {
      const issues = createMockIssues([0, 5, 0, 10, 0]);
      expect(countZeroCommentIssues(issues)).toBe(3);
    });

    it('should return 0 if no zero-comment issues', () => {
      const issues = createMockIssues([1, 5, 10]);
      expect(countZeroCommentIssues(issues)).toBe(0);
    });

    it('should return total count if all have zero comments', () => {
      const issues = createMockIssues([0, 0, 0, 0]);
      expect(countZeroCommentIssues(issues)).toBe(4);
    });
  });

  describe('handles edge cases', () => {
    it('should return 0 for empty array', () => {
      expect(countZeroCommentIssues([])).toBe(0);
    });

    it('should return 0 for null input', () => {
      expect(countZeroCommentIssues(null as unknown as GitHubIssue[])).toBe(0);
    });

    it('should return 0 for undefined input', () => {
      expect(countZeroCommentIssues(undefined as unknown as GitHubIssue[])).toBe(0);
    });
  });
});

// ============================================================================
// hasZeroCommentIssues Tests
// ============================================================================
describe('hasZeroCommentIssues', () => {
  describe('returns true when zero-comment issues exist', () => {
    it('should return true if at least one zero-comment issue exists', () => {
      const issues = createMockIssues([5, 0, 10]);
      expect(hasZeroCommentIssues(issues)).toBe(true);
    });

    it('should return true if all issues have zero comments', () => {
      const issues = createMockIssues([0, 0, 0]);
      expect(hasZeroCommentIssues(issues)).toBe(true);
    });

    it('should return true for single zero-comment issue', () => {
      const issues = createMockIssues([0]);
      expect(hasZeroCommentIssues(issues)).toBe(true);
    });
  });

  describe('returns false when no zero-comment issues exist', () => {
    it('should return false if no zero-comment issues', () => {
      const issues = createMockIssues([1, 5, 10]);
      expect(hasZeroCommentIssues(issues)).toBe(false);
    });

    it('should return false for single non-zero issue', () => {
      const issues = createMockIssues([5]);
      expect(hasZeroCommentIssues(issues)).toBe(false);
    });
  });

  describe('handles edge cases', () => {
    it('should return false for empty array', () => {
      expect(hasZeroCommentIssues([])).toBe(false);
    });

    it('should return false for null input', () => {
      expect(hasZeroCommentIssues(null as unknown as GitHubIssue[])).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(hasZeroCommentIssues(undefined as unknown as GitHubIssue[])).toBe(false);
    });
  });
});
