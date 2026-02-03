/**
 * Unit Tests for Footer Utilities
 * Tests Issue #21 implementation - Footer component helper functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTwitterShareUrl,
  getLinkedInShareUrl,
  isWebShareSupported,
  isValidUrl,
  createShareData,
  nativeShare,
  REPO_URL,
  ISSUES_URL,
  CONTRIBUTING_URL,
  SITE_URL,
  DEFAULT_SHARE_TEXT,
  DEFAULT_HASHTAGS
} from '../src/lib/footer-utils';

// ============================================================================
// Constants Tests
// ============================================================================
describe('Footer Constants', () => {
  describe('Repository URLs', () => {
    it('should have correct repo URL', () => {
      expect(REPO_URL).toBe('https://github.com/VibeTensor/IssueVista');
    });

    it('should have correct issues URL', () => {
      expect(ISSUES_URL).toBe('https://github.com/VibeTensor/IssueVista/issues');
    });

    it('should have correct contributing URL', () => {
      expect(CONTRIBUTING_URL).toBe(
        'https://github.com/VibeTensor/IssueVista/blob/master/CONTRIBUTING.md'
      );
    });

    it('should have correct site URL', () => {
      expect(SITE_URL).toBe('https://issuevista.vibetensor.com');
    });
  });

  describe('Share Configuration', () => {
    it('should have default share text', () => {
      expect(DEFAULT_SHARE_TEXT).toContain('IssueVista');
      expect(DEFAULT_SHARE_TEXT).toContain('GitHub issues');
    });

    it('should have default hashtags', () => {
      expect(DEFAULT_HASHTAGS).toContain('opensource');
      expect(DEFAULT_HASHTAGS).toContain('github');
      expect(DEFAULT_HASHTAGS).toContain('hacktoberfest');
    });

    it('should have hashtags without # symbol', () => {
      expect(DEFAULT_HASHTAGS).not.toContain('#');
    });
  });
});

// ============================================================================
// getTwitterShareUrl Tests
// ============================================================================
describe('getTwitterShareUrl', () => {
  describe('Default Parameters', () => {
    it('should generate valid Twitter intent URL with defaults', () => {
      const url = getTwitterShareUrl();
      expect(url).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
    });

    it('should include default text parameter', () => {
      const url = getTwitterShareUrl();
      expect(url).toContain('text=');
      expect(url).toContain(encodeURIComponent('IssueVista'));
    });

    it('should include default URL parameter', () => {
      const url = getTwitterShareUrl();
      expect(url).toContain('url=');
      expect(url).toContain(encodeURIComponent(SITE_URL));
    });

    it('should include default hashtags parameter', () => {
      const url = getTwitterShareUrl();
      expect(url).toContain('hashtags=');
      expect(url).toContain('opensource');
    });
  });

  describe('Custom Parameters', () => {
    it('should use custom text', () => {
      const customText = 'My custom share text';
      const url = getTwitterShareUrl(customText);
      // URLSearchParams encodes spaces as '+', so check decoded URL
      const urlObj = new URL(url);
      expect(urlObj.searchParams.get('text')).toBe(customText);
    });

    it('should use custom URL', () => {
      const customUrl = 'https://example.com';
      const url = getTwitterShareUrl(DEFAULT_SHARE_TEXT, customUrl);
      expect(url).toContain(encodeURIComponent(customUrl));
    });

    it('should use custom hashtags', () => {
      const customHashtags = 'test,custom,tags';
      const url = getTwitterShareUrl(DEFAULT_SHARE_TEXT, SITE_URL, customHashtags);
      expect(url).toContain('hashtags=test%2Ccustom%2Ctags');
    });

    it('should handle empty hashtags', () => {
      const url = getTwitterShareUrl(DEFAULT_SHARE_TEXT, SITE_URL, '');
      expect(url).toContain('hashtags=');
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode special characters in text', () => {
      const textWithSpecialChars = 'Check out this & that!';
      const url = getTwitterShareUrl(textWithSpecialChars);
      // URLSearchParams handles encoding, verify via parsed URL
      const urlObj = new URL(url);
      expect(urlObj.searchParams.get('text')).toBe(textWithSpecialChars);
    });

    it('should properly encode URLs with query parameters', () => {
      const urlWithParams = 'https://example.com?foo=bar&baz=qux';
      const url = getTwitterShareUrl(DEFAULT_SHARE_TEXT, urlWithParams);
      expect(url).toContain(encodeURIComponent(urlWithParams));
    });

    it('should handle unicode characters', () => {
      const unicodeText = 'Check out IssueVista! \u2764\uFE0F';
      const url = getTwitterShareUrl(unicodeText);
      expect(url).toBeTruthy();
      expect(url).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
    });
  });

  describe('URL Structure', () => {
    it('should have all three parameters', () => {
      const url = getTwitterShareUrl();
      expect(url).toContain('text=');
      expect(url).toContain('url=');
      expect(url).toContain('hashtags=');
    });

    it('should be a valid URL', () => {
      const url = getTwitterShareUrl();
      expect(() => new URL(url)).not.toThrow();
    });

    it('should use HTTPS protocol', () => {
      const url = getTwitterShareUrl();
      expect(url).toMatch(/^https:\/\//);
    });
  });
});

// ============================================================================
// getLinkedInShareUrl Tests
// ============================================================================
describe('getLinkedInShareUrl', () => {
  describe('Default Parameters', () => {
    it('should generate valid LinkedIn share URL with defaults', () => {
      const url = getLinkedInShareUrl();
      expect(url).toMatch(/^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?/);
    });

    it('should include default URL parameter', () => {
      const url = getLinkedInShareUrl();
      expect(url).toContain('url=');
      expect(url).toContain(encodeURIComponent(SITE_URL));
    });
  });

  describe('Custom Parameters', () => {
    it('should use custom URL', () => {
      const customUrl = 'https://example.com/my-page';
      const url = getLinkedInShareUrl(customUrl);
      expect(url).toContain(encodeURIComponent(customUrl));
    });

    it('should handle URL with query parameters', () => {
      const urlWithParams = 'https://example.com?utm_source=linkedin';
      const url = getLinkedInShareUrl(urlWithParams);
      expect(url).toContain(encodeURIComponent(urlWithParams));
    });

    it('should handle URL with hash fragment', () => {
      const urlWithHash = 'https://example.com/page#section';
      const url = getLinkedInShareUrl(urlWithHash);
      expect(url).toContain(encodeURIComponent(urlWithHash));
    });
  });

  describe('URL Structure', () => {
    it('should only have url parameter (LinkedIn limitation)', () => {
      const url = getLinkedInShareUrl();
      const urlObj = new URL(url);
      expect(urlObj.searchParams.has('url')).toBe(true);
      // LinkedIn only supports url parameter - no title or summary
      expect(urlObj.searchParams.get('title')).toBe(null);
      expect(urlObj.searchParams.get('summary')).toBe(null);
    });

    it('should be a valid URL', () => {
      const url = getLinkedInShareUrl();
      expect(() => new URL(url)).not.toThrow();
    });

    it('should use HTTPS protocol', () => {
      const url = getLinkedInShareUrl();
      expect(url).toMatch(/^https:\/\//);
    });
  });
});

// ============================================================================
// isWebShareSupported Tests
// ============================================================================
describe('isWebShareSupported', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
  });

  it('should return false when navigator is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true
    });
    expect(isWebShareSupported()).toBe(false);
  });

  it('should return false when navigator.share is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: undefined },
      writable: true,
      configurable: true
    });
    expect(isWebShareSupported()).toBe(false);
  });

  it('should return true when navigator.share is available', () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: vi.fn() },
      writable: true,
      configurable: true
    });
    expect(isWebShareSupported()).toBe(true);
  });
});

// ============================================================================
// isValidUrl Tests
// ============================================================================
describe('isValidUrl', () => {
  describe('Valid URLs', () => {
    it('should return true for https URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should return true for http URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should return true for URL with path', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('should return true for URL with query params', () => {
      expect(isValidUrl('https://example.com?foo=bar')).toBe(true);
    });

    it('should return true for URL with hash', () => {
      expect(isValidUrl('https://example.com#section')).toBe(true);
    });

    it('should return true for URL with port', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should return true for localhost', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should return true for SITE_URL', () => {
      expect(isValidUrl(SITE_URL)).toBe(true);
    });

    it('should return true for REPO_URL', () => {
      expect(isValidUrl(REPO_URL)).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should return false for empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('should return false for plain text', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('should return false for URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('should return false for malformed URL', () => {
      expect(isValidUrl('https://')).toBe(false);
    });

    it('should return false for random string', () => {
      expect(isValidUrl('abcdef12345')).toBe(false);
    });
  });
});

// ============================================================================
// createShareData Tests
// ============================================================================
describe('createShareData', () => {
  describe('Default Values', () => {
    it('should create share data with default title', () => {
      const data = createShareData();
      expect(data.title).toBe('IssueVista');
    });

    it('should create share data with default text', () => {
      const data = createShareData();
      expect(data.text).toBe(DEFAULT_SHARE_TEXT);
    });

    it('should create share data with default URL', () => {
      const data = createShareData();
      expect(data.url).toBe(SITE_URL);
    });
  });

  describe('Custom Values', () => {
    it('should use custom title', () => {
      const data = createShareData('Custom Title');
      expect(data.title).toBe('Custom Title');
    });

    it('should use custom text', () => {
      const data = createShareData('Title', 'Custom text');
      expect(data.text).toBe('Custom text');
    });

    it('should use custom URL', () => {
      const data = createShareData('Title', 'Text', 'https://custom.url');
      expect(data.url).toBe('https://custom.url');
    });

    it('should use all custom values', () => {
      const data = createShareData('My Title', 'My Text', 'https://my.url');
      expect(data).toEqual({
        title: 'My Title',
        text: 'My Text',
        url: 'https://my.url'
      });
    });
  });

  describe('Return Structure', () => {
    it('should have title property', () => {
      const data = createShareData();
      expect(data).toHaveProperty('title');
    });

    it('should have text property', () => {
      const data = createShareData();
      expect(data).toHaveProperty('text');
    });

    it('should have url property', () => {
      const data = createShareData();
      expect(data).toHaveProperty('url');
    });
  });
});

// ============================================================================
// nativeShare Tests
// ============================================================================
describe('nativeShare', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
  });

  it('should throw when Web Share API is not supported', async () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true
    });
    await expect(nativeShare()).rejects.toThrow('Web Share API is not supported');
  });

  it('should throw when navigator.share is undefined', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: undefined },
      writable: true,
      configurable: true
    });
    await expect(nativeShare()).rejects.toThrow('Web Share API is not supported');
  });

  it('should call navigator.share with default values', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true
    });

    await nativeShare();

    expect(mockShare).toHaveBeenCalledWith({
      title: 'IssueVista',
      text: DEFAULT_SHARE_TEXT,
      url: SITE_URL
    });
  });

  it('should call navigator.share with custom values', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true
    });

    await nativeShare('Custom Title', 'Custom text', 'https://custom.url');

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Custom Title',
      text: 'Custom text',
      url: 'https://custom.url'
    });
  });

  it('should propagate errors from navigator.share', async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error('User cancelled'));
    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true
    });

    await expect(nativeShare()).rejects.toThrow('User cancelled');
  });

  it('should resolve when share is successful', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true
    });

    await expect(nativeShare()).resolves.toBeUndefined();
  });
});

// ============================================================================
// Integration Tests
// ============================================================================
describe('Footer Utils Integration', () => {
  it('should generate working Twitter URL with SITE_URL', () => {
    const url = getTwitterShareUrl(DEFAULT_SHARE_TEXT, SITE_URL, DEFAULT_HASHTAGS);
    expect(isValidUrl(url)).toBe(true);
  });

  it('should generate working LinkedIn URL with SITE_URL', () => {
    const url = getLinkedInShareUrl(SITE_URL);
    expect(isValidUrl(url)).toBe(true);
  });

  it('should create valid share data for Web Share API', () => {
    const data = createShareData();
    expect(isValidUrl(data.url!)).toBe(true);
    expect(data.title).toBeTruthy();
    expect(data.text).toBeTruthy();
  });

  it('should have consistent SITE_URL across all functions', () => {
    const twitterUrl = getTwitterShareUrl();
    const linkedInUrl = getLinkedInShareUrl();
    const shareData = createShareData();

    expect(twitterUrl).toContain(encodeURIComponent(SITE_URL));
    expect(linkedInUrl).toContain(encodeURIComponent(SITE_URL));
    expect(shareData.url).toBe(SITE_URL);
  });
});
