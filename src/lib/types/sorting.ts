/**
 * Sorting Type Definitions
 * Issue #122 - Smart Search Result Sorting with Relevance Score
 *
 * Type definitions for sort options, preferences, and persistence.
 * Uses string literal unions instead of enums per TypeScript best practices.
 */

/**
 * Available sort options for issue results
 */
export type SortOption = 'relevance' | 'date' | 'comments' | 'reactions';

/**
 * Sort direction (ascending or descending)
 */
export type SortDirection = 'asc' | 'desc';

/**
 * User's sort preferences for persistence
 */
export interface SortPreferences {
  /** Which field to sort by */
  sortBy: SortOption;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Reaction data from GitHub GraphQL API
 */
export interface ReactionGroup {
  /** Reaction type (THUMBS_UP, HEART, etc.) */
  content: string;
  /** Number of users who reacted */
  reactors: {
    totalCount: number;
  };
}

/**
 * Positive reaction types that contribute to relevance score
 * These indicate community interest and approval
 */
export const POSITIVE_REACTIONS = ['THUMBS_UP', 'HEART', 'HOORAY', 'ROCKET'] as const;

/**
 * Labels that indicate beginner-friendly issues
 * Higher scores for more beginner-friendly labels
 */
export const BEGINNER_LABELS: Record<string, number> = {
  'good first issue': 15,
  'good-first-issue': 15,
  'help wanted': 10,
  'help-wanted': 10,
  beginner: 10,
  'beginner-friendly': 10,
  easy: 5,
  starter: 5,
  'first-timers-only': 15,
  'up-for-grabs': 10
};

/**
 * Display labels for sort options
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  date: 'Date Created',
  comments: 'Comments',
  reactions: 'Reactions'
};

/**
 * Display labels for sort directions
 */
export const SORT_DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending'
};

/**
 * Default sort preferences
 */
export const DEFAULT_SORT_PREFERENCES: SortPreferences = {
  sortBy: 'relevance',
  direction: 'desc'
};

/**
 * Default direction for each sort option
 * - relevance: desc (highest score first)
 * - date: desc (newest first)
 * - comments: asc (fewest comments first - easier to start)
 * - reactions: desc (most reactions first)
 */
export const DEFAULT_DIRECTIONS: Record<SortOption, SortDirection> = {
  relevance: 'desc',
  date: 'desc',
  comments: 'asc',
  reactions: 'desc'
};

/**
 * Check if a string is a valid sort option
 */
export function isValidSortOption(option: string): option is SortOption {
  return ['relevance', 'date', 'comments', 'reactions'].includes(option);
}

/**
 * Check if a string is a valid sort direction
 */
export function isValidSortDirection(direction: string): direction is SortDirection {
  return ['asc', 'desc'].includes(direction);
}

/**
 * Validate and normalize sort preferences
 * Returns default preferences if validation fails
 */
export function validateSortPreferences(prefs: unknown): SortPreferences {
  if (!prefs || typeof prefs !== 'object') {
    return DEFAULT_SORT_PREFERENCES;
  }

  const obj = prefs as Record<string, unknown>;

  const sortBy =
    typeof obj.sortBy === 'string' && isValidSortOption(obj.sortBy)
      ? obj.sortBy
      : DEFAULT_SORT_PREFERENCES.sortBy;

  const direction =
    typeof obj.direction === 'string' && isValidSortDirection(obj.direction)
      ? obj.direction
      : DEFAULT_SORT_PREFERENCES.direction;

  return { sortBy, direction };
}
