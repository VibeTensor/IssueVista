/**
 * Unit Tests for Time Utilities
 * Tests Issue #17 implementation - relative time display functions
 */

import { describe, it, expect } from 'vitest';
import {
  getRelativeTime,
  getExactDateTime,
  getFreshnessLevel,
  getDaysSince
} from '../src/lib/time-utils';

// Helper functions to create test dates
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function minutesAgo(minutes: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ============================================================================
// getRelativeTime Tests
// ============================================================================
describe('getRelativeTime', () => {
  describe('Today and Yesterday', () => {
    it('should return "Today" for current date', () => {
      const result = getRelativeTime(new Date().toISOString());
      expect(result).toBe('Today');
    });

    it('should return "Yesterday" for 1 day ago', () => {
      const result = getRelativeTime(daysAgo(1));
      expect(result).toBe('Yesterday');
    });
  });

  describe('Minutes ago (same calendar day = Today)', () => {
    it('should return "Today" for 5 minutes ago (same day)', () => {
      const result = getRelativeTime(minutesAgo(5));
      // Same calendar day returns "Today" per implementation
      expect(result).toBe('Today');
    });

    it('should return "Today" for 30 minutes ago (same day)', () => {
      const result = getRelativeTime(minutesAgo(30));
      expect(result).toBe('Today');
    });

    it('should return "Today" for 59 minutes ago (same day)', () => {
      const result = getRelativeTime(minutesAgo(59));
      expect(result).toBe('Today');
    });
  });

  describe('Hours ago (same calendar day = Today)', () => {
    it('should return "Today" for 2 hours ago (same day)', () => {
      const result = getRelativeTime(hoursAgo(2));
      // Same calendar day returns "Today" per implementation
      expect(result).toBe('Today');
    });

    it('should return "Today" or "Yesterday" for 12 hours ago', () => {
      const result = getRelativeTime(hoursAgo(12));
      // Could be "Today" or "Yesterday" depending on time of day
      expect(result).toMatch(/(Today|Yesterday)/);
    });

    it('should return "Today" or "Yesterday" for 23 hours ago', () => {
      const result = getRelativeTime(hoursAgo(23));
      // Could be Today or Yesterday depending on when test runs
      expect(result).toMatch(/(Today|Yesterday)/);
    });
  });

  describe('Days ago', () => {
    it('should return "2 days ago" for 2 days', () => {
      const result = getRelativeTime(daysAgo(2));
      expect(result).toBe('2 days ago');
    });

    it('should return "3 days ago" for 3 days', () => {
      const result = getRelativeTime(daysAgo(3));
      expect(result).toBe('3 days ago');
    });

    it('should return "6 days ago" for 6 days', () => {
      const result = getRelativeTime(daysAgo(6));
      expect(result).toBe('6 days ago');
    });
  });

  describe('Weeks ago', () => {
    it('should return "last week" for 7 days', () => {
      const result = getRelativeTime(daysAgo(7));
      expect(result).toBe('last week');
    });

    it('should return "2 weeks ago" for 14 days', () => {
      const result = getRelativeTime(daysAgo(14));
      expect(result).toBe('2 weeks ago');
    });

    it('should return "3 weeks ago" for 21 days', () => {
      const result = getRelativeTime(daysAgo(21));
      expect(result).toBe('3 weeks ago');
    });

    it('should return "4 weeks ago" for 28 days', () => {
      const result = getRelativeTime(daysAgo(28));
      expect(result).toBe('4 weeks ago');
    });
  });

  describe('Months ago', () => {
    it('should return "last month" for 30 days', () => {
      const result = getRelativeTime(daysAgo(30));
      expect(result).toBe('last month');
    });

    it('should return "2 months ago" for 60 days', () => {
      const result = getRelativeTime(daysAgo(60));
      expect(result).toBe('2 months ago');
    });

    it('should return "6 months ago" for 180 days', () => {
      const result = getRelativeTime(daysAgo(180));
      expect(result).toBe('6 months ago');
    });

    it('should return "11 months ago" for 330 days', () => {
      const result = getRelativeTime(daysAgo(330));
      expect(result).toBe('11 months ago');
    });
  });

  describe('Years ago', () => {
    it('should return "last year" for 365 days', () => {
      const result = getRelativeTime(daysAgo(365));
      expect(result).toBe('last year');
    });

    it('should return "2 years ago" for 730 days', () => {
      const result = getRelativeTime(daysAgo(730));
      expect(result).toBe('2 years ago');
    });

    it('should return "5 years ago" for 1825 days', () => {
      const result = getRelativeTime(daysAgo(1825));
      expect(result).toBe('5 years ago');
    });
  });

  describe('Edge Cases', () => {
    it('should return "Unknown" for empty string', () => {
      const result = getRelativeTime('');
      expect(result).toBe('Unknown');
    });

    it('should return "Invalid date" for malformed input', () => {
      const result = getRelativeTime('not-a-date');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for random text', () => {
      const result = getRelativeTime('hello world');
      expect(result).toBe('Invalid date');
    });

    it('should return "In the future" for future dates', () => {
      const result = getRelativeTime(daysFromNow(5));
      expect(result).toBe('In the future');
    });

    it('should handle ISO date strings correctly', () => {
      const result = getRelativeTime('2020-01-01T00:00:00Z');
      expect(result).toMatch(/years ago/);
    });
  });
});

// ============================================================================
// getExactDateTime Tests
// ============================================================================
describe('getExactDateTime', () => {
  describe('Valid Date Formatting', () => {
    it('should format date with full month name', () => {
      const result = getExactDateTime('2025-11-29T10:30:00Z');
      expect(result).toMatch(/November/);
    });

    it('should include year in format', () => {
      const result = getExactDateTime('2025-11-29T10:30:00Z');
      expect(result).toMatch(/2025/);
    });

    it('should include day number', () => {
      const result = getExactDateTime('2025-11-29T10:30:00Z');
      expect(result).toMatch(/29/);
    });

    it('should include time with AM/PM', () => {
      const result = getExactDateTime('2025-11-29T10:30:00Z');
      expect(result).toMatch(/(AM|PM)/);
    });

    it('should format current date correctly', () => {
      const result = getExactDateTime(new Date().toISOString());
      expect(result).toBeTruthy();
      expect(result).not.toBe('Unknown date');
      expect(result).not.toBe('Invalid date');
    });
  });

  describe('Invalid Input Handling', () => {
    it('should return "Unknown date" for empty string', () => {
      const result = getExactDateTime('');
      expect(result).toBe('Unknown date');
    });

    it('should return "Invalid date" for malformed input', () => {
      const result = getExactDateTime('not-a-date');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for random text', () => {
      const result = getExactDateTime('hello world');
      expect(result).toBe('Invalid date');
    });
  });
});

// ============================================================================
// getFreshnessLevel Tests
// ============================================================================
describe('getFreshnessLevel', () => {
  describe('Fresh Issues (< 7 days)', () => {
    it('should return "fresh" for today', () => {
      const result = getFreshnessLevel(new Date().toISOString());
      expect(result).toBe('fresh');
    });

    it('should return "fresh" for 1 day ago', () => {
      const result = getFreshnessLevel(daysAgo(1));
      expect(result).toBe('fresh');
    });

    it('should return "fresh" for 3 days ago', () => {
      const result = getFreshnessLevel(daysAgo(3));
      expect(result).toBe('fresh');
    });

    it('should return "fresh" for 6 days ago (boundary)', () => {
      const result = getFreshnessLevel(daysAgo(6));
      expect(result).toBe('fresh');
    });
  });

  describe('Moderate Issues (7-30 days)', () => {
    it('should return "moderate" for 7 days ago (boundary)', () => {
      const result = getFreshnessLevel(daysAgo(7));
      expect(result).toBe('moderate');
    });

    it('should return "moderate" for 14 days ago', () => {
      const result = getFreshnessLevel(daysAgo(14));
      expect(result).toBe('moderate');
    });

    it('should return "moderate" for 21 days ago', () => {
      const result = getFreshnessLevel(daysAgo(21));
      expect(result).toBe('moderate');
    });

    it('should return "moderate" for 29 days ago (boundary)', () => {
      const result = getFreshnessLevel(daysAgo(29));
      expect(result).toBe('moderate');
    });
  });

  describe('Stale Issues (> 30 days)', () => {
    it('should return "stale" for 30 days ago (boundary)', () => {
      const result = getFreshnessLevel(daysAgo(30));
      expect(result).toBe('stale');
    });

    it('should return "stale" for 60 days ago', () => {
      const result = getFreshnessLevel(daysAgo(60));
      expect(result).toBe('stale');
    });

    it('should return "stale" for 180 days ago', () => {
      const result = getFreshnessLevel(daysAgo(180));
      expect(result).toBe('stale');
    });

    it('should return "stale" for 1 year ago', () => {
      const result = getFreshnessLevel(daysAgo(365));
      expect(result).toBe('stale');
    });
  });

  describe('Invalid Input Handling', () => {
    it('should return "stale" for empty string', () => {
      const result = getFreshnessLevel('');
      expect(result).toBe('stale');
    });

    it('should return "stale" for invalid date', () => {
      const result = getFreshnessLevel('not-a-date');
      expect(result).toBe('stale');
    });
  });
});

// ============================================================================
// getDaysSince Tests
// ============================================================================
describe('getDaysSince', () => {
  describe('Valid Calculations', () => {
    it('should return 0 for today', () => {
      const result = getDaysSince(new Date().toISOString());
      expect(result).toBe(0);
    });

    it('should return 1 for yesterday', () => {
      const result = getDaysSince(daysAgo(1));
      expect(result).toBe(1);
    });

    it('should return 7 for a week ago', () => {
      const result = getDaysSince(daysAgo(7));
      expect(result).toBe(7);
    });

    it('should return 30 for a month ago', () => {
      const result = getDaysSince(daysAgo(30));
      expect(result).toBe(30);
    });

    it('should return 365 for a year ago', () => {
      const result = getDaysSince(daysAgo(365));
      expect(result).toBe(365);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should return Infinity for empty string', () => {
      const result = getDaysSince('');
      expect(result).toBe(Infinity);
    });

    it('should return Infinity for invalid date', () => {
      const result = getDaysSince('not-a-date');
      expect(result).toBe(Infinity);
    });

    it('should return Infinity for random text', () => {
      const result = getDaysSince('hello world');
      expect(result).toBe(Infinity);
    });
  });
});
