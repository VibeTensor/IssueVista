/**
 * Autocomplete Utilities
 * Issue #129 - Intelligent Search Autocomplete Suggestions
 *
 * Provides utility functions for filtering, ranking, and highlighting
 * autocomplete suggestions combining search history with popular repositories.
 */

import type { SearchHistoryItem } from './types/results';

/**
 * Represents a suggestion item for the autocomplete dropdown
 */
export interface AutocompleteSuggestion {
  /** Type of suggestion: history (from localStorage) or popular (static list) */
  type: 'history' | 'popular';
  /** Repository owner (e.g., 'facebook') */
  owner: string;
  /** Repository name (e.g., 'react') */
  repo: string;
  /** Full GitHub URL */
  fullUrl: string;
  /** Display name in format 'owner/repo' */
  displayName: string;
  /** ISO timestamp of last search (history items only) */
  lastSearched?: string;
  /** Number of times searched (history items only) */
  searchCount?: number;
  /** Issue count from last search (history items only) */
  issueCount?: number;
  /** Ranking score for sorting (higher = more relevant) */
  score: number;
}

/**
 * Popular repositories for suggestions when no history matches
 * These are well-known open source projects with beginner-friendly issues
 */
const POPULAR_REPOS: Omit<AutocompleteSuggestion, 'score'>[] = [
  {
    type: 'popular',
    owner: 'facebook',
    repo: 'react',
    fullUrl: 'https://github.com/facebook/react',
    displayName: 'facebook/react'
  },
  {
    type: 'popular',
    owner: 'microsoft',
    repo: 'vscode',
    fullUrl: 'https://github.com/microsoft/vscode',
    displayName: 'microsoft/vscode'
  },
  {
    type: 'popular',
    owner: 'vercel',
    repo: 'next.js',
    fullUrl: 'https://github.com/vercel/next.js',
    displayName: 'vercel/next.js'
  },
  {
    type: 'popular',
    owner: 'sveltejs',
    repo: 'svelte',
    fullUrl: 'https://github.com/sveltejs/svelte',
    displayName: 'sveltejs/svelte'
  },
  {
    type: 'popular',
    owner: 'tailwindlabs',
    repo: 'tailwindcss',
    fullUrl: 'https://github.com/tailwindlabs/tailwindcss',
    displayName: 'tailwindlabs/tailwindcss'
  }
];

/**
 * Maximum number of suggestions to show in the dropdown
 */
const MAX_SUGGESTIONS = 5;

/**
 * Escape special regex characters in a string to prevent regex injection
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp constructor
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param str - String to escape
 * @returns HTML-escaped string safe for rendering
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Get the list of popular repository suggestions
 * @returns Array of popular repository suggestions with score 0
 */
export function getPopularRepos(): AutocompleteSuggestion[] {
  return POPULAR_REPOS.map((repo) => ({
    ...repo,
    score: 0
  }));
}

/**
 * Convert a SearchHistoryItem to an AutocompleteSuggestion
 * @param item - History item from localStorage
 * @param index - Position in the history list (used for scoring)
 * @returns AutocompleteSuggestion with calculated score
 */
export function historyToSuggestion(
  item: SearchHistoryItem,
  index: number
): AutocompleteSuggestion {
  return {
    type: 'history',
    owner: item.owner,
    repo: item.repo,
    fullUrl: item.fullUrl,
    displayName: `${item.owner}/${item.repo}`,
    lastSearched: item.lastSearched,
    searchCount: item.searchCount,
    issueCount: item.issueCount,
    // Score decreases with position: most recent = 100, next = 90, etc.
    score: Math.max(100 - index * 10, 10)
  };
}

/**
 * Filter suggestions by prefix match on displayName
 * Case-insensitive comparison
 * @param items - Array of suggestions to filter
 * @param query - Search query to match against
 * @returns Filtered array of matching suggestions
 */
export function filterByPrefix(
  items: AutocompleteSuggestion[],
  query: string
): AutocompleteSuggestion[] {
  if (!query || query.trim() === '') {
    return items;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return items.filter((item) => {
    const displayName = item.displayName.toLowerCase();
    // Match if displayName starts with query OR if repo name starts with query
    return (
      displayName.startsWith(normalizedQuery) || item.repo.toLowerCase().startsWith(normalizedQuery)
    );
  });
}

/**
 * Combine and rank suggestions from history and popular repos
 * History items are prioritized over popular items
 * @param history - Array of history items from localStorage
 * @param query - Current search query for filtering
 * @returns Ranked and filtered array of suggestions (max 5)
 */
export function rankSuggestions(
  history: SearchHistoryItem[],
  query: string
): AutocompleteSuggestion[] {
  // Convert history items to suggestions with scores
  const historySuggestions = history.map((item, index) => historyToSuggestion(item, index));

  // Get popular repos
  const popularSuggestions = getPopularRepos();

  // Combine all suggestions
  const allSuggestions = [...historySuggestions, ...popularSuggestions];

  // Remove duplicates (history takes precedence over popular)
  const seen = new Set<string>();
  const uniqueSuggestions = allSuggestions.filter((item) => {
    const key = item.displayName.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Filter by query
  const filtered = filterByPrefix(uniqueSuggestions, query);

  // Sort by score (descending)
  filtered.sort((a, b) => b.score - a.score);

  // Limit to max suggestions
  return filtered.slice(0, MAX_SUGGESTIONS);
}

/**
 * Highlight matching text in a suggestion by wrapping with <mark> tag
 * Uses case-insensitive matching but preserves original case
 * @param text - Original text to highlight
 * @param query - Search query to highlight
 * @returns HTML string with matching portions wrapped in <mark>
 */
export function highlightMatch(text: string, query: string): string {
  // Escape HTML first to prevent XSS from localStorage manipulation
  const escapedText = escapeHtml(text);

  if (!query || query.trim() === '') {
    return escapedText;
  }

  // Escape special regex characters in query
  const escapedQuery = escapeRegExp(query.trim());

  // Create case-insensitive regex
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // Replace matches with highlighted version
  // $1 preserves the original case of the matched text
  return escapedText.replace(regex, '<mark class="autocomplete-highlight">$1</mark>');
}
