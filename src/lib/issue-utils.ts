/**
 * Issue Utilities for Issue #20
 * Zero-comment issue detection, filtering, and sorting helpers
 * Helps identify easy entry points for new contributors
 */

import type { GitHubIssue } from './github-graphql';

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
export function filterByCommentLevel(
  issues: GitHubIssue[],
  level: CommentLevel
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }
  return issues.filter(issue => getCommentLevel(issue) === level);
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
