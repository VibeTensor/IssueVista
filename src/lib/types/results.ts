/**
 * Type definitions for Results components
 * Issue #35 - Refactoring ResultsList.svelte
 */

import type { GitHubIssue } from '../github-graphql';
import type { CommentSortOrder } from '../issue-utils';

/**
 * Search form state
 */
export interface SearchState {
  repoUrl: string;
  token: string;
  loading: boolean;
  error: string;
  loadingMessage: string;
}

/**
 * URL validation state
 */
export interface ValidationState {
  state: 'idle' | 'valid' | 'invalid';
  message: string;
}

/**
 * Filter and sort state for issues
 */
export interface FilterState {
  showOnlyZeroComments: boolean;
  sortOrder: CommentSortOrder | 'default';
}

/**
 * GitHub API rate limit information
 */
export interface RateLimitInfo {
  remaining: number;
  resetAt: string;
}

/**
 * Props for SearchForm component
 */
export interface SearchFormProps {
  repoUrl: string;
  token: string;
  loading: boolean;
  validationState: ValidationState;
  rateLimit: RateLimitInfo;
  isAuthenticated: boolean;
  onSearch: () => void;
  onUrlChange: (url: string) => void;
  onTokenChange: (token: string) => void;
  onShowHelp: () => void;
}

/**
 * Props for IssueCard component
 */
export interface IssueCardProps {
  issue: GitHubIssue;
  copiedIssueNumber: number | null;
  onCopy: (issueNumber: number) => void;
}

/**
 * Props for FilterControls component
 */
export interface FilterControlsProps {
  enabled: boolean;
  zeroCommentCount: number;
  onToggle: (enabled: boolean) => void;
}

/**
 * Props for SortControls component
 */
export interface SortControlsProps {
  sortOrder: CommentSortOrder | 'default';
  onSortChange: (order: CommentSortOrder | 'default') => void;
}

/**
 * Props for ExportMenu component
 */
export interface ExportMenuProps {
  issues: GitHubIssue[];
  disabled?: boolean;
}

/**
 * Props for HelpPopup component
 */
export interface HelpPopupProps {
  show: boolean;
  onClose: () => void;
}

/**
 * Props for RateLimitDisplay component
 */
export interface RateLimitDisplayProps {
  remaining: number;
  resetTime: string;
}

/**
 * Search history item stored in localStorage
 * Issue #62 - Search history with localStorage persistence
 */
export interface SearchHistoryItem {
  owner: string;
  repo: string;
  fullUrl: string;
  lastSearched: string;
  searchCount: number;
  issueCount?: number;
}

/**
 * Props for SearchHistory component
 */
export interface SearchHistoryProps {
  items: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onDelete: (owner: string, repo: string) => void;
  onClear: () => void;
  onClose: () => void;
}
