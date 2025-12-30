/**
 * Bookmarks Store
 * Issue #139 - Quick Actions Context Menu
 *
 * Provides localStorage-based persistence for bookmarked issues.
 * Follows the same pattern as search-history.ts for consistency.
 */

/**
 * localStorage key for bookmarks persistence
 */
const STORAGE_KEY = 'issueflow_bookmarks';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get all bookmarked issue URLs from localStorage
 * Returns empty array if no bookmarks exist or if not in browser
 */
export function getBookmarks(): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate that it's an array of strings
    if (!Array.isArray(parsed)) {
      console.warn('[Bookmarks] Invalid data format, clearing bookmarks');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Filter out non-string values
    return parsed.filter((item: unknown): item is string => typeof item === 'string');
  } catch (error) {
    console.error('[Bookmarks] Failed to parse bookmarks:', error);
    return [];
  }
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(bookmarks: string[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('[Bookmarks] Failed to save bookmarks:', error);
  }
}

/**
 * Check if an issue URL is bookmarked
 */
export function isBookmarked(url: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.includes(url);
}

/**
 * Add an issue URL to bookmarks
 * Does nothing if already bookmarked
 */
export function addBookmark(url: string): void {
  if (!url || typeof url !== 'string') {
    console.warn('[Bookmarks] Invalid URL provided');
    return;
  }

  const bookmarks = getBookmarks();

  if (!bookmarks.includes(url)) {
    bookmarks.unshift(url); // Add to beginning
    saveBookmarks(bookmarks);
  }
}

/**
 * Remove an issue URL from bookmarks
 */
export function removeBookmark(url: string): void {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((bookmark) => bookmark !== url);
  saveBookmarks(filtered);
}

/**
 * Toggle bookmark state for an issue URL
 * Returns the new bookmark state (true = bookmarked, false = not bookmarked)
 */
export function toggleBookmark(url: string): boolean {
  if (isBookmarked(url)) {
    removeBookmark(url);
    return false;
  } else {
    addBookmark(url);
    return true;
  }
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Bookmarks] Failed to clear bookmarks:', error);
  }
}

/**
 * Get the count of bookmarked issues
 */
export function getBookmarkCount(): number {
  return getBookmarks().length;
}
