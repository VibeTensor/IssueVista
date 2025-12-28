/**
 * Issue Utilities for Issue #20, #122
 * Zero-comment issue detection, filtering, and sorting helpers
 * Helps identify easy entry points for new contributors
 *
 * Issue #122: Added smart sorting by relevance, date, comments, reactions
 */

import type { GitHubIssue } from './github-graphql';
import type { SortOption, SortDirection, SortPreferences } from './types/sorting';
import { DEFAULT_DIRECTIONS } from './types/sorting';
import { calculateRelevanceScore, getTotalReactionCount } from './relevance-scoring';

// Thresholds for comment activity levels
const LOW_COMMENT_THRESHOLD = 5;

/**
 * Comment activity levels for visual indicators
 * - zero: No comments (easy to start)
 * - low: 1-5 comments (some discussion)
 * - active: 6+ comments (active discussion)
 */
export type CommentLevel = 'zero' | 'low' | 'active';

/**
 * Sort order for issues by comment count
 */
export type CommentSortOrder = 'asc' | 'desc';

/**
 * Check if an issue has zero comments
 * Zero-comment issues are ideal for new contributors
 *
 * @param issue - GitHub issue object
 * @returns true if the issue has no comments
 */
export function isZeroComment(issue: GitHubIssue): boolean {
  if (!issue || !issue.comments) {
    return false;
  }
  return issue.comments.totalCount === 0;
}

/**
 * Get the comment activity level of an issue
 * Used for visual categorization and filtering
 *
 * @param issue - GitHub issue object
 * @returns Comment level: 'zero', 'low', or 'active'
 */
export function getCommentLevel(issue: GitHubIssue): CommentLevel {
  if (!issue || !issue.comments) {
    return 'active'; // Default to active if unknown
  }

  const count = issue.comments.totalCount;

  if (count === 0) {
    return 'zero';
  }

  if (count <= LOW_COMMENT_THRESHOLD) {
    return 'low';
  }

  return 'active';
}

/**
 * Get the comment count from an issue safely
 *
 * @param issue - GitHub issue object
 * @returns Number of comments, or 0 if unavailable
 */
export function getCommentCount(issue: GitHubIssue): number {
  if (!issue || !issue.comments) {
    return 0;
  }
  return issue.comments.totalCount;
}

/**
 * Filter issues to only include those with zero comments
 * Returns a new array without modifying the original
 *
 * @param issues - Array of GitHub issues
 * @returns Filtered array containing only zero-comment issues
 */
export function filterZeroCommentIssues(issues: GitHubIssue[]): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }
  return issues.filter(isZeroComment);
}

/**
 * Filter issues by comment level
 * Returns a new array without modifying the original
 *
 * @param issues - Array of GitHub issues
 * @param level - Comment level to filter by
 * @returns Filtered array containing only issues with specified comment level
 */
export function filterByCommentLevel(issues: GitHubIssue[], level: CommentLevel): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }
  return issues.filter((issue) => getCommentLevel(issue) === level);
}

/**
 * Sort issues by comment count
 * Returns a new sorted array without modifying the original
 * Important: Always spreads array for Svelte 5 reactivity
 *
 * @param issues - Array of GitHub issues
 * @param order - Sort order: 'asc' (fewest first) or 'desc' (most first)
 * @returns New sorted array
 */
export function sortByComments(
  issues: GitHubIssue[],
  order: CommentSortOrder = 'asc'
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  // Spread to create new array (required for Svelte 5 reactivity)
  return [...issues].sort((a, b) => {
    const countA = getCommentCount(a);
    const countB = getCommentCount(b);

    if (order === 'asc') {
      return countA - countB;
    }
    return countB - countA;
  });
}

/**
 * Count how many issues have zero comments
 *
 * @param issues - Array of GitHub issues
 * @returns Number of zero-comment issues
 */
export function countZeroCommentIssues(issues: GitHubIssue[]): number {
  if (!issues || !Array.isArray(issues)) {
    return 0;
  }
  return issues.filter(isZeroComment).length;
}

/**
 * Check if any issues in the array have zero comments
 *
 * @param issues - Array of GitHub issues
 * @returns true if at least one issue has zero comments
 */
export function hasZeroCommentIssues(issues: GitHubIssue[]): boolean {
  if (!issues || !Array.isArray(issues)) {
    return false;
  }
  return issues.some(isZeroComment);
}

// ============================================================================
// Issue #122: Smart Sorting Functions
// ============================================================================

/**
 * Sort issues by creation date
 * Returns a new sorted array without modifying the original
 *
 * @param issues - Array of GitHub issues
 * @param direction - Sort direction: 'asc' (oldest first) or 'desc' (newest first)
 * @returns New sorted array
 */
export function sortByDate(
  issues: GitHubIssue[],
  direction: SortDirection = 'desc'
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  return [...issues].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    if (direction === 'asc') {
      return dateA - dateB;
    }
    return dateB - dateA;
  });
}

/**
 * Sort issues by total reaction count
 * Returns a new sorted array without modifying the original
 *
 * @param issues - Array of GitHub issues
 * @param direction - Sort direction: 'asc' (fewest first) or 'desc' (most first)
 * @returns New sorted array
 */
export function sortByReactions(
  issues: GitHubIssue[],
  direction: SortDirection = 'desc'
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  return [...issues].sort((a, b) => {
    const reactionsA = getTotalReactionCount(a);
    const reactionsB = getTotalReactionCount(b);

    if (direction === 'asc') {
      return reactionsA - reactionsB;
    }
    return reactionsB - reactionsA;
  });
}

/**
 * Sort issues by relevance score
 * Returns a new sorted array without modifying the original
 *
 * @param issues - Array of GitHub issues
 * @param direction - Sort direction: 'asc' (lowest first) or 'desc' (highest first)
 * @returns New sorted array
 */
export function sortByRelevance(
  issues: GitHubIssue[],
  direction: SortDirection = 'desc'
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  return [...issues].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a);
    const scoreB = calculateRelevanceScore(b);

    if (direction === 'asc') {
      return scoreA - scoreB;
    }
    return scoreB - scoreA;
  });
}

/**
 * Sort issues by the specified option and direction
 * Unified sorting function that delegates to specific sort functions
 *
 * @param issues - Array of GitHub issues
 * @param sortBy - Sort option: 'relevance', 'date', 'comments', 'reactions'
 * @param direction - Sort direction: 'asc' or 'desc'
 * @returns New sorted array
 */
export function sortIssues(
  issues: GitHubIssue[],
  sortBy: SortOption,
  direction: SortDirection
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  switch (sortBy) {
    case 'relevance':
      return sortByRelevance(issues, direction);
    case 'date':
      return sortByDate(issues, direction);
    case 'comments':
      // Convert to CommentSortOrder type expected by sortByComments
      return sortByComments(issues, direction);
    case 'reactions':
      return sortByReactions(issues, direction);
    default:
      return [...issues];
  }
}

/**
 * Sort issues using sort preferences object
 * Convenience wrapper for sortIssues
 *
 * @param issues - Array of GitHub issues
 * @param preferences - Sort preferences object
 * @returns New sorted array
 */
export function sortByPreferences(
  issues: GitHubIssue[],
  preferences: SortPreferences
): GitHubIssue[] {
  return sortIssues(issues, preferences.sortBy, preferences.direction);
}

/**
 * Get the default sort direction for a sort option
 *
 * @param sortBy - Sort option
 * @returns Default direction for that option
 */
export function getDefaultDirection(sortBy: SortOption): SortDirection {
  return DEFAULT_DIRECTIONS[sortBy];
}
