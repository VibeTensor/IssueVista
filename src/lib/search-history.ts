/**
 * Search History Utility
 * Issue #62 - Search history with localStorage persistence
 *
 * Provides type-safe localStorage operations for storing and retrieving
 * search history items.
 */

import type { SearchHistoryItem } from './types/results';

const STORAGE_KEY = 'issueflow_search_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get all search history items from localStorage
 * Returns empty array if no history exists or if not in browser
 */
export function getHistory(): SearchHistoryItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      console.warn('[SearchHistory] Invalid data format, clearing history');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Filter out invalid items and ensure type safety
    return parsed.filter(
      (item: unknown): item is SearchHistoryItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as SearchHistoryItem).owner === 'string' &&
        typeof (item as SearchHistoryItem).repo === 'string' &&
        typeof (item as SearchHistoryItem).fullUrl === 'string' &&
        typeof (item as SearchHistoryItem).lastSearched === 'string' &&
        typeof (item as SearchHistoryItem).searchCount === 'number'
    );
  } catch (error) {
    console.error('[SearchHistory] Failed to parse history:', error);
    return [];
  }
}

/**
 * Save history items to localStorage
 */
function saveHistory(items: SearchHistoryItem[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[SearchHistory] Failed to save history:', error);
  }
}

/**
 * Add or update a search history item
 * If the repo already exists, increments search count and updates timestamp
 * Otherwise adds new item at the beginning
 */
export function addToHistory(
  owner: string,
  repo: string,
  fullUrl: string,
  issueCount?: number
): void {
  const history = getHistory();

  const existingIndex = history.findIndex(
    (item) =>
      item.owner.toLowerCase() === owner.toLowerCase() &&
      item.repo.toLowerCase() === repo.toLowerCase()
  );

  if (existingIndex >= 0) {
    // Update existing entry
    const existing = history[existingIndex];
    history.splice(existingIndex, 1);
    history.unshift({
      ...existing,
      fullUrl, // Update URL in case format changed
      lastSearched: new Date().toISOString(),
      searchCount: existing.searchCount + 1,
      issueCount: issueCount ?? existing.issueCount
    });
  } else {
    // Add new entry at the beginning
    history.unshift({
      owner,
      repo,
      fullUrl,
      lastSearched: new Date().toISOString(),
      searchCount: 1,
      issueCount
    });
  }

  // Keep only the most recent items
  saveHistory(history.slice(0, MAX_HISTORY_ITEMS));
}

/**
 * Remove a specific repository from history
 */
export function removeFromHistory(owner: string, repo: string): void {
  const history = getHistory();
  const filtered = history.filter(
    (item) =>
      !(
        item.owner.toLowerCase() === owner.toLowerCase() &&
        item.repo.toLowerCase() === repo.toLowerCase()
      )
  );
  saveHistory(filtered);
}

/**
 * Clear all search history
 */
export function clearHistory(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[SearchHistory] Failed to clear history:', error);
  }
}

/**
 * Get a formatted relative time string for display
 * e.g., "Just now", "5 min ago", "2 hours ago", "Yesterday", "3 days ago"
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    // Format as date for older entries
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
