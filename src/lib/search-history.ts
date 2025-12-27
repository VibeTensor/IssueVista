/**
 * Search History Utility
 * Issue #62 - Search history with localStorage persistence
 * Issue #188 - Save and retrieve last searched repository
 *
 * Provides type-safe localStorage operations for storing and retrieving
 * search history items and last searched repository.
 */

import type { SearchHistoryItem } from './types/results';

const STORAGE_KEY = 'issueflow_search_history';
const LAST_REPO_KEY = 'issueflow_last_searched_repo';
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

/**
 * Export types for search history
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Export metadata structure for JSON exports
 */
interface ExportMetadata {
  exportedAt: string;
  version: string;
  itemCount: number;
  items: SearchHistoryItem[];
}

/**
 * Escape a CSV field according to RFC 4180
 * Fields containing commas, quotes, or newlines are enclosed in quotes
 * Double quotes within fields are escaped by doubling them
 */
function escapeCsvField(field: string | number | undefined): string {
  if (field === undefined || field === null) {
    return '';
  }

  const stringValue = String(field);

  // Check if field needs escaping
  if (/[,"\n\r]/.test(stringValue)) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate current date string for filename
 * Format: YYYY-MM-DD
 */
function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Export search history to JSON format
 * Returns a formatted JSON string with metadata
 */
export function exportToJSON(): string {
  const history = getHistory();

  const exportData: ExportMetadata = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    itemCount: history.length,
    items: history
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export search history to CSV format
 * Returns a CSV string with headers and UTF-8 BOM for Excel compatibility
 */
export function exportToCSV(): string {
  const history = getHistory();

  // UTF-8 BOM for Excel compatibility
  const BOM = '\ufeff';

  // CSV headers
  const headers = ['Repository', 'URL', 'Last Searched', 'Search Count', 'Issue Count'];

  // Build CSV rows
  const rows = history.map((item) => {
    const repoName = `${item.owner}/${item.repo}`;
    return [
      escapeCsvField(repoName),
      escapeCsvField(item.fullUrl),
      escapeCsvField(item.lastSearched),
      escapeCsvField(item.searchCount),
      escapeCsvField(item.issueCount)
    ].join(',');
  });

  // Combine headers and rows
  return BOM + headers.join(',') + '\n' + rows.join('\n');
}

/**
 * Download search history as a file
 * Triggers browser download with appropriate filename and MIME type
 */
export function downloadExport(format: ExportFormat): void {
  if (!isBrowser()) {
    console.warn('[SearchHistory] Cannot download: not in browser environment');
    return;
  }

  const history = getHistory();

  if (history.length === 0) {
    console.warn('[SearchHistory] No history to export');
    return;
  }

  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === 'json') {
    content = exportToJSON();
    mimeType = 'application/json';
    extension = 'json';
  } else {
    content = exportToCSV();
    mimeType = 'text/csv;charset=utf-8';
    extension = 'csv';
  }

  const filename = `issueflow-search-history-${getDateString()}.${extension}`;

  try {
    // Create Blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Create temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup: remove element and revoke URL to free memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[SearchHistory] Failed to download export:', error);
  }
}

/**
 * Get the last searched repository URL from localStorage (Issue #188)
 * Returns null if no last repo exists or if not in browser
 */
export function getLastSearchedRepo(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(LAST_REPO_KEY);
    if (!stored || stored.trim() === '') {
      return null;
    }
    return stored.trim();
  } catch (error) {
    console.error('[SearchHistory] Failed to get last searched repo:', error);
    return null;
  }
}

/**
 * Save the last searched repository URL to localStorage (Issue #188)
 */
export function setLastSearchedRepo(url: string): void {
  if (!isBrowser()) {
    return;
  }

  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('[SearchHistory] Invalid URL provided to setLastSearchedRepo');
    return;
  }

  try {
    localStorage.setItem(LAST_REPO_KEY, url.trim());
  } catch (error) {
    console.error('[SearchHistory] Failed to save last searched repo:', error);
  }
}

/**
 * Clear the last searched repository from localStorage (Issue #188)
 */
export function clearLastSearchedRepo(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(LAST_REPO_KEY);
  } catch (error) {
    console.error('[SearchHistory] Failed to clear last searched repo:', error);
  }
}
