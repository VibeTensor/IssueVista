/**
 * Sort Preferences Persistence
 * Issue #122 - Smart Search Result Sorting with Relevance Score
 *
 * Provides type-safe localStorage operations for storing and retrieving
 * user sort preferences. Follows the same pattern as search-history.ts.
 */

import {
  type SortPreferences,
  DEFAULT_SORT_PREFERENCES,
  validateSortPreferences
} from './types/sorting';

const STORAGE_KEY = 'issuevista_sort_preferences';
const LEGACY_STORAGE_KEY = 'issueflow_sort_preferences';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Migrate data from legacy IssueFlow key to new IssueVista key
 */
function migrateFromLegacy(): void {
  if (!isBrowser()) return;

  if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_STORAGE_KEY)) {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyData) {
      localStorage.setItem(STORAGE_KEY, legacyData);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }
}

// Run migration on module load
if (typeof localStorage !== 'undefined') {
  migrateFromLegacy();
}

/**
 * Get sort preferences from localStorage
 * Returns default preferences if none stored or if not in browser
 *
 * @returns User's saved sort preferences or defaults
 */
export function getSortPreferences(): SortPreferences {
  if (!isBrowser()) {
    return DEFAULT_SORT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SORT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    return validateSortPreferences(parsed);
  } catch (error) {
    console.error('[SortPreferences] Failed to parse preferences:', error);
    return DEFAULT_SORT_PREFERENCES;
  }
}

/**
 * Save sort preferences to localStorage
 *
 * @param preferences - Sort preferences to save
 */
export function setSortPreferences(preferences: SortPreferences): void {
  if (!isBrowser()) {
    return;
  }

  try {
    // Validate before saving
    const validated = validateSortPreferences(preferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  } catch (error) {
    console.error('[SortPreferences] Failed to save preferences:', error);
  }
}

/**
 * Clear sort preferences from localStorage
 * Resets to default preferences
 */
export function clearSortPreferences(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[SortPreferences] Failed to clear preferences:', error);
  }
}

/**
 * Check if user has saved sort preferences
 *
 * @returns true if preferences exist in localStorage
 */
export function hasSavedPreferences(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}
