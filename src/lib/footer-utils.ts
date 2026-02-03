/**
 * Footer Utility Functions
 * Issue #21 - Helper functions for Footer component
 *
 * Extracted for testability and reusability
 */

// Configuration constants
export const REPO_URL = 'https://github.com/VibeTensor/IssueVista';
export const ISSUES_URL = `${REPO_URL}/issues`;
export const CONTRIBUTING_URL = `${REPO_URL}/blob/master/CONTRIBUTING.md`;
export const SITE_URL = 'https://issuevista.vibetensor.com';

// Company Information - VibeTensor Private Limited (India)
export const COMPANY_NAME = 'VibeTensor Private Limited';
export const COMPANY_SHORT = 'VibeTensor';
export const COMPANY_GITHUB = 'https://github.com/VibeTensor';
export const COMPANY_WEBSITE = 'https://vibetensor.com';
export const COMPANY_EMAIL = 'info@vibetensor.com';

// Legal/Compliance - Indian Companies Act 2013
export const COMPANY_COUNTRY = 'India';

// Default sharing configuration
export const DEFAULT_SHARE_TEXT =
  'Check out IssueVista - Find unassigned GitHub issues for open-source contributions!';
export const DEFAULT_HASHTAGS = 'opensource,github,hacktoberfest';

/**
 * Generate Twitter/X share URL
 * Reference: https://developer.x.com/en/docs/x-for-websites/tweet-button/guides/web-intent
 *
 * @param text - The text to share
 * @param url - The URL to share
 * @param hashtags - Comma-separated hashtags (without #)
 * @returns Full Twitter intent URL
 */
export function getTwitterShareUrl(
  text: string = DEFAULT_SHARE_TEXT,
  url: string = SITE_URL,
  hashtags: string = DEFAULT_HASHTAGS
): string {
  const params = new URLSearchParams({
    text,
    url,
    hashtags
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL
 * Note: LinkedIn only supports 'url' parameter now, title/summary come from Open Graph tags
 * Reference: https://stackoverflow.com/questions/33426752/linkedin-share-post-url
 *
 * @param url - The URL to share
 * @returns Full LinkedIn share URL
 */
export function getLinkedInShareUrl(url: string = SITE_URL): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/**
 * Check if Web Share API is available in the browser
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
 *
 * @returns true if Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Share content using the native Web Share API
 *
 * @param title - Share dialog title
 * @param text - Share text content
 * @param url - URL to share
 * @returns Promise that resolves when share completes or rejects on error/cancel
 */
export async function nativeShare(
  title: string = 'IssueVista',
  text: string = DEFAULT_SHARE_TEXT,
  url: string = SITE_URL
): Promise<void> {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API is not supported');
  }

  await navigator.share({ title, text, url });
}

/**
 * Validate a URL string
 *
 * @param url - URL string to validate
 * @returns true if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate share data object for Web Share API
 *
 * @param title - Share dialog title
 * @param text - Share text content
 * @param url - URL to share
 * @returns ShareData object
 */
export function createShareData(
  title: string = 'IssueVista',
  text: string = DEFAULT_SHARE_TEXT,
  url: string = SITE_URL
): ShareData {
  return { title, text, url };
}
