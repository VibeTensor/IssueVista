/**
 * Relevance Scoring Algorithm
 * Issue #122 - Smart Search Result Sorting with Relevance Score
 *
 * Calculates relevance scores for GitHub issues based on:
 * - Positive reactions (community interest)
 * - Freshness (recent issues scored higher)
 * - Beginner-friendly labels
 * - Comment activity (penalty for high activity)
 */

import type { GitHubIssue } from './github-graphql';
import { POSITIVE_REACTIONS, BEGINNER_LABELS } from './types/sorting';

/**
 * Weights for relevance scoring components
 * Tuned to prioritize beginner-friendly, fresh issues with community interest
 */
const WEIGHTS = {
  /** Multiplier for positive reactions */
  REACTION: 2,
  /** Maximum points from freshness bonus */
  FRESHNESS_MAX: 15,
  /** Days after which freshness bonus decays to zero */
  FRESHNESS_DECAY_DAYS: 30,
  /** Freshness decay rate per day */
  FRESHNESS_RATE: 0.5,
  /** Penalty per comment (capped) */
  COMMENT_PENALTY_RATE: 0.5,
  /** Maximum comment penalty */
  COMMENT_PENALTY_MAX: 10
} as const;

/**
 * Calculate the total positive reactions for an issue
 * Counts THUMBS_UP, HEART, HOORAY, and ROCKET reactions
 *
 * @param issue - GitHub issue with reaction data
 * @returns Total count of positive reactions
 */
export function getPositiveReactionCount(issue: GitHubIssue): number {
  if (!issue.reactionGroups || !Array.isArray(issue.reactionGroups)) {
    return 0;
  }

  return issue.reactionGroups.reduce((total, group) => {
    if (POSITIVE_REACTIONS.includes(group.content as (typeof POSITIVE_REACTIONS)[number])) {
      return total + (group.reactors?.totalCount ?? 0);
    }
    return total;
  }, 0);
}

/**
 * Calculate the total reaction count for an issue (all reaction types)
 *
 * @param issue - GitHub issue with reaction data
 * @returns Total count of all reactions
 */
export function getTotalReactionCount(issue: GitHubIssue): number {
  if (!issue.reactionGroups || !Array.isArray(issue.reactionGroups)) {
    return 0;
  }

  return issue.reactionGroups.reduce((total, group) => {
    return total + (group.reactors?.totalCount ?? 0);
  }, 0);
}

/**
 * Calculate reaction score component
 * Positive reactions indicate community interest
 *
 * @param issue - GitHub issue with reaction data
 * @returns Reaction score (positive reactions * weight)
 */
function calculateReactionScore(issue: GitHubIssue): number {
  const positiveReactions = getPositiveReactionCount(issue);
  return positiveReactions * WEIGHTS.REACTION;
}

/**
 * Calculate freshness bonus based on issue age
 * Newer issues get higher scores with linear decay
 *
 * Formula: max(0, (DECAY_DAYS - daysOld)) * RATE
 * - Issues created today: 15 points
 * - Issues 30+ days old: 0 points
 *
 * @param issue - GitHub issue with createdAt timestamp
 * @returns Freshness bonus (0 to FRESHNESS_MAX)
 */
function calculateFreshnessBonus(issue: GitHubIssue): number {
  if (!issue.createdAt) {
    return 0;
  }

  const createdDate = new Date(issue.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Linear decay: newer issues get higher scores
  const rawBonus = (WEIGHTS.FRESHNESS_DECAY_DAYS - daysOld) * WEIGHTS.FRESHNESS_RATE;
  return Math.max(0, Math.min(rawBonus, WEIGHTS.FRESHNESS_MAX));
}

/**
 * Calculate label bonus for beginner-friendly labels
 * Returns the highest bonus from any matching label
 *
 * @param issue - GitHub issue with labels
 * @returns Label bonus (0 to 15)
 */
function calculateLabelBonus(issue: GitHubIssue): number {
  if (!issue.labels?.nodes || !Array.isArray(issue.labels.nodes)) {
    return 0;
  }

  let maxBonus = 0;

  for (const label of issue.labels.nodes) {
    const labelName = label.name.toLowerCase();
    const bonus = BEGINNER_LABELS[labelName];
    if (bonus && bonus > maxBonus) {
      maxBonus = bonus;
    }
  }

  return maxBonus;
}

/**
 * Calculate comment penalty
 * Issues with many comments may already have contributors working on them
 *
 * @param issue - GitHub issue with comment count
 * @returns Comment penalty (0 to COMMENT_PENALTY_MAX)
 */
function calculateCommentPenalty(issue: GitHubIssue): number {
  const commentCount = issue.comments?.totalCount ?? 0;
  const rawPenalty = commentCount * WEIGHTS.COMMENT_PENALTY_RATE;
  return Math.min(rawPenalty, WEIGHTS.COMMENT_PENALTY_MAX);
}

/**
 * Calculate the full relevance score for an issue
 *
 * Formula:
 * Score = reactionScore + freshnessBonus + labelBonus - commentPenalty
 *
 * Score components:
 * - Reaction score: positiveReactions * 2 (no cap)
 * - Freshness bonus: max(0, 30 - daysOld) * 0.5 (max 15 pts)
 * - Label bonus: +15 for "good first issue", +10 for "help wanted", +5 for "easy"
 * - Comment penalty: min(comments * 0.5, 10)
 *
 * @param issue - GitHub issue to score
 * @returns Relevance score (can be negative for old, commented issues)
 */
export function calculateRelevanceScore(issue: GitHubIssue): number {
  const reactionScore = calculateReactionScore(issue);
  const freshnessBonus = calculateFreshnessBonus(issue);
  const labelBonus = calculateLabelBonus(issue);
  const commentPenalty = calculateCommentPenalty(issue);

  return reactionScore + freshnessBonus + labelBonus - commentPenalty;
}

/**
 * Get a breakdown of the relevance score components
 * Useful for debugging and displaying score details
 *
 * @param issue - GitHub issue to analyze
 * @returns Object with individual score components
 */
export function getRelevanceScoreBreakdown(issue: GitHubIssue): {
  reactionScore: number;
  freshnessBonus: number;
  labelBonus: number;
  commentPenalty: number;
  totalScore: number;
} {
  const reactionScore = calculateReactionScore(issue);
  const freshnessBonus = calculateFreshnessBonus(issue);
  const labelBonus = calculateLabelBonus(issue);
  const commentPenalty = calculateCommentPenalty(issue);
  const totalScore = reactionScore + freshnessBonus + labelBonus - commentPenalty;

  return {
    reactionScore,
    freshnessBonus,
    labelBonus,
    commentPenalty,
    totalScore
  };
}
