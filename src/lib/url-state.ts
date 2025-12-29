/**
 * URL State Utilities
 * Issue #140 - Shareable Search URLs with Query Parameters
 *
 * Provides functions to serialize/deserialize search state to/from URL query parameters.
 * Uses native URLSearchParams and history.replaceState for URL management.
 */

import type { SortOption, SortDirection } from './types/sorting';
import { DEFAULT_SORT_PREFERENCES } from './types/sorting';

/**
 * Search state that can be serialized to URL
 */
export interface SearchState {
  repoUrl: string;
  labelFilter: string | null;
  sortBy: SortOption;
  sortDirection: SortDirection;
  showOnlyZeroComments: boolean;
}

/**
 * URL parameter names (camelCase for consistency with JS conventions)
 */
const URL_PARAMS = {
  repo: 'repo',
  labels: 'labels',
  sortBy: 'sortBy',
  sortDir: 'sortDir',
  zeroComments: 'zeroComments'
} as const;

/**
 * Serialize search state to URL query string
 * Only includes non-default values to keep URLs clean
 *
 * @param state - Current search state
 * @returns Query string without leading '?'
 */
export function serializeSearchState(state: SearchState): string {
  const params = new URLSearchParams();

  // Always include repo if present (required for shareable URL)
  if (state.repoUrl) {
    params.set(URL_PARAMS.repo, state.repoUrl);
  }

  // Only include non-default filter values
  if (state.labelFilter) {
    params.set(URL_PARAMS.labels, state.labelFilter);
  }

  if (state.sortBy !== DEFAULT_SORT_PREFERENCES.sortBy) {
    params.set(URL_PARAMS.sortBy, state.sortBy);
  }

  if (state.sortDirection !== DEFAULT_SORT_PREFERENCES.direction) {
    params.set(URL_PARAMS.sortDir, state.sortDirection);
  }

  if (state.showOnlyZeroComments) {
    params.set(URL_PARAMS.zeroComments, 'true');
  }

  return params.toString();
}

/**
 * Deserialize URL params to partial search state
 * Returns only the values present in the URL
 *
 * @param params - URLSearchParams object
 * @returns Partial search state with values from URL
 */
export function deserializeSearchState(params: URLSearchParams): Partial<SearchState> {
  const state: Partial<SearchState> = {};

  const repo = params.get(URL_PARAMS.repo);
  if (repo) {
    state.repoUrl = repo;
  }

  const labels = params.get(URL_PARAMS.labels);
  if (labels) {
    state.labelFilter = labels;
  }

  const sortBy = params.get(URL_PARAMS.sortBy);
  if (sortBy && isValidSortOption(sortBy)) {
    state.sortBy = sortBy as SortOption;
  }

  const sortDir = params.get(URL_PARAMS.sortDir);
  if (sortDir && isValidSortDirection(sortDir)) {
    state.sortDirection = sortDir as SortDirection;
  }

  const zeroComments = params.get(URL_PARAMS.zeroComments);
  if (zeroComments === 'true') {
    state.showOnlyZeroComments = true;
  }

  return state;
}

/**
 * Update browser URL with current state without page reload
 * Uses replaceState to avoid flooding browser history
 *
 * @param state - Current search state
 */
export function updateUrlWithState(state: SearchState): void {
  // Only update if we're in a browser environment
  if (typeof window === 'undefined') return;

  const queryString = serializeSearchState(state);
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  // Only update if URL actually changed
  if (newUrl !== `${window.location.pathname}${window.location.search}`) {
    window.history.replaceState(null, '', newUrl);
  }
}

/**
 * Build complete shareable URL with current state
 *
 * @param state - Current search state
 * @returns Full URL including origin
 */
export function buildShareableUrl(state: SearchState): string {
  if (typeof window === 'undefined') return '';

  const queryString = serializeSearchState(state);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Copy shareable URL to clipboard
 *
 * @param state - Current search state
 * @returns Promise resolving to true if copy succeeded
 */
export async function copyShareableUrl(state: SearchState): Promise<boolean> {
  const url = buildShareableUrl(state);
  if (!url) return false;

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for browsers without clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Read search state from current URL
 *
 * @returns Partial search state from URL params
 */
export function readStateFromUrl(): Partial<SearchState> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return deserializeSearchState(params);
}

/**
 * Check if URL has any search state params
 *
 * @returns True if URL contains search state
 */
export function hasUrlState(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  return params.has(URL_PARAMS.repo);
}

// Type guards for validation
function isValidSortOption(value: string): boolean {
  const validOptions = ['stars', 'updated', 'created', 'comments', 'relevance'];
  return validOptions.includes(value);
}

function isValidSortDirection(value: string): boolean {
  return value === 'asc' || value === 'desc';
}
