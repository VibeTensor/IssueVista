/**
 * Theme Store
 * Issue #180 - Add light/dark theme toggle
 *
 * Provides theme state management using Svelte 5 $state runes.
 * Supports light, dark, and system themes with localStorage persistence.
 */

/**
 * Available theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual applied theme)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * localStorage key for theme persistence
 */
const STORAGE_KEY = 'issueflow-theme';

/**
 * Theme state using Svelte 5 $state rune
 * Uses object wrapper to maintain reactivity on export
 */
export const themeState = $state({
  /** User's selected theme preference */
  current: 'system' as Theme,
  /** Actually applied theme (resolved from current + system preference) */
  resolved: 'light' as ResolvedTheme
});

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve theme preference to actual theme
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to the document
 * Optimized for instant switching without transitions
 */
function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Add transitioning class to disable CSS transitions during switch
  root.classList.add('theme-transitioning');

  // Apply theme class change
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update color-scheme for native UI elements
  root.style.colorScheme = resolved;

  // Remove transitioning class after paint to re-enable transitions
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-transitioning');
    });
  });
}

/**
 * Get the current theme preference
 */
export function getTheme(): Theme {
  return themeState.current;
}

/**
 * Get the resolved (applied) theme
 */
export function getResolvedTheme(): ResolvedTheme {
  return themeState.resolved;
}

/**
 * Set theme preference and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  themeState.current = theme;
  themeState.resolved = resolveTheme(theme);

  // Persist to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Apply to document
  applyTheme(themeState.resolved);
}

/**
 * Toggle between light and dark themes
 * If currently on system, switches to opposite of resolved theme
 */
export function toggleTheme(): void {
  const newTheme: Theme = themeState.resolved === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

/**
 * Initialize theme from localStorage or system preference
 * Should be called once when the app mounts.
 * Returns a cleanup function to remove event listeners.
 */
export function initTheme(): () => void {
  if (typeof localStorage === 'undefined') return () => {};

  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;

  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    themeState.current = stored;
  } else {
    themeState.current = 'system';
  }

  themeState.resolved = resolveTheme(themeState.current);
  applyTheme(themeState.resolved);

  // Listen for system preference changes
  let cleanup: () => void = () => {};

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (themeState.current === 'system') {
        themeState.resolved = e.matches ? 'dark' : 'light';
        applyTheme(themeState.resolved);
      }
    };

    mediaQuery.addEventListener('change', handler);
    cleanup = () => mediaQuery.removeEventListener('change', handler);
  }

  return cleanup;
}
