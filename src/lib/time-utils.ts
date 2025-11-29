/**
 * Time Utilities for Issue #17
 * Smart relative time display with freshness indicators
 * Uses native Intl.RelativeTimeFormat for zero bundle size impact
 */

// Time constants in milliseconds
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

// Freshness thresholds in days
const FRESH_THRESHOLD_DAYS = 7;
const MODERATE_THRESHOLD_DAYS = 30;

/**
 * Freshness levels for visual indicators
 */
export type FreshnessLevel = 'fresh' | 'moderate' | 'stale';

/**
 * Get relative time string from a date
 * Examples: "Today", "Yesterday", "3 days ago", "2 weeks ago", "5 months ago"
 *
 * @param dateString - ISO date string (e.g., "2025-11-29T10:30:00Z")
 * @returns Human-readable relative time string
 */
export function getRelativeTime(dateString: string): string {
  if (!dateString) {
    return 'Unknown';
  }

  const date = new Date(dateString);

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Handle future dates
  if (diff < 0) {
    return 'In the future';
  }

  // Calculate days difference for "Today" and "Yesterday"
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / DAY);

  // Special cases for today and yesterday
  if (daysDiff === 0) {
    return 'Today';
  }

  if (daysDiff === 1) {
    return 'Yesterday';
  }

  // Use Intl.RelativeTimeFormat for other cases
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  // Determine the appropriate unit and value
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return rtf.format(-minutes, 'minute');
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return rtf.format(-hours, 'hour');
  }

  if (diff < WEEK) {
    return rtf.format(-daysDiff, 'day');
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return rtf.format(-weeks, 'week');
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return rtf.format(-months, 'month');
  }

  const years = Math.floor(diff / YEAR);
  return rtf.format(-years, 'year');
}

/**
 * Get exact date and time for tooltip display
 * Format: "November 29, 2025 at 10:30 AM"
 *
 * @param dateString - ISO date string
 * @returns Formatted exact date/time string
 */
export function getExactDateTime(dateString: string): string {
  if (!dateString) {
    return 'Unknown date';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Determine freshness level based on issue age
 * - fresh: < 7 days old (green indicator)
 * - moderate: 7-30 days old (amber indicator)
 * - stale: > 30 days old (gray indicator)
 *
 * @param dateString - ISO date string
 * @returns Freshness level for styling
 */
export function getFreshnessLevel(dateString: string): FreshnessLevel {
  if (!dateString) {
    return 'stale';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'stale';
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / DAY);

  if (daysDiff < FRESH_THRESHOLD_DAYS) {
    return 'fresh';
  }

  if (daysDiff < MODERATE_THRESHOLD_DAYS) {
    return 'moderate';
  }

  return 'stale';
}

/**
 * Get days since a date (for filtering/sorting)
 *
 * @param dateString - ISO date string
 * @returns Number of days since the date
 */
export function getDaysSince(dateString: string): number {
  if (!dateString) {
    return Infinity;
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return Infinity;
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / DAY);
}
