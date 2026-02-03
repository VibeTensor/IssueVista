/**
 * Theme Store
 * Issue #180 - Add light/dark theme toggle
 * Issue #142 - Enhanced Dark Mode with Custom Themes
 *
 * Provides theme state management using Svelte 5 $state runes.
 * Supports multiple theme presets with localStorage persistence.
 */

import { type ThemePreset, DARK_PRESETS, getPresetConfig, isDarkPreset } from './theme-presets';

/**
 * Legacy theme type for backward compatibility
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual applied base theme for UnoCSS)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * localStorage keys
 */
const LEGACY_STORAGE_KEY = 'issuevista-theme';
const PRESET_STORAGE_KEY = 'issuevista-theme-preset';
const OLD_LEGACY_KEY = 'issueflow-theme';
const OLD_PRESET_KEY = 'issueflow-theme-preset';

/**
 * Theme state using Svelte 5 $state rune
 * Uses object wrapper to maintain reactivity on export
 */
export const themeState = $state({
  /** Selected theme preset */
  preset: 'system' as ThemePreset,
  /** Resolved base theme for UnoCSS dark: variant */
  resolved: 'dark' as ResolvedTheme,
  /** Whether system preference is being used */
  useSystemPreference: true
});

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve preset to base theme (light or dark)
 */
function resolvePresetToBase(preset: ThemePreset): ResolvedTheme {
  if (preset === 'system') {
    return getSystemTheme();
  }
  return isDarkPreset(preset) ? 'dark' : 'light';
}

/**
 * Remove all theme-related classes from document
 */
function clearThemeClasses(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.remove('theme-midnight');
  root.classList.remove('theme-ocean');
  root.classList.remove('theme-forest');
  root.classList.remove('theme-sunset');
}

/**
 * Apply theme preset to the document
 * Handles both dark class for UnoCSS and preset-specific classes
 */
function applyPreset(preset: ThemePreset, resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Add transitioning class to disable CSS transitions during switch
  root.classList.add('theme-transitioning');

  // Clear existing theme classes
  clearThemeClasses();

  // Apply dark class for UnoCSS compatibility
  if (resolved === 'dark') {
    root.classList.add('dark');
  }

  // Apply preset-specific class for custom color palettes
  const actualPreset = preset === 'system' ? resolved : preset;
  if (actualPreset !== 'light' && actualPreset !== 'dark') {
    root.classList.add(`theme-${actualPreset}`);
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
 * Get the current theme preset
 */
export function getPreset(): ThemePreset {
  return themeState.preset;
}

/**
 * Get the current theme preference (legacy compatibility)
 */
export function getTheme(): Theme {
  const preset = themeState.preset;
  if (preset === 'light' || preset === 'dark' || preset === 'system') {
    return preset;
  }
  // Map other presets to dark since they're all dark-based
  return 'dark';
}

/**
 * Get the resolved (applied) base theme
 */
export function getResolvedTheme(): ResolvedTheme {
  return themeState.resolved;
}

/**
 * Set theme preset and persist to localStorage
 */
export function setPreset(preset: ThemePreset): void {
  themeState.preset = preset;
  themeState.useSystemPreference = preset === 'system';
  themeState.resolved = resolvePresetToBase(preset);

  // Persist to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
    // Also update legacy key for backward compatibility
    if (preset === 'light' || preset === 'dark' || preset === 'system') {
      localStorage.setItem(LEGACY_STORAGE_KEY, preset);
    } else {
      // For other presets, store 'dark' in legacy key
      localStorage.setItem(LEGACY_STORAGE_KEY, 'dark');
    }
  }

  // Apply to document
  applyPreset(preset, themeState.resolved);
}

/**
 * Set theme preference (legacy compatibility)
 */
export function setTheme(theme: Theme): void {
  setPreset(theme);
}

/**
 * Toggle between light and dark themes
 * If currently on a preset, switches to opposite base theme
 */
export function toggleTheme(): void {
  const newTheme: Theme = themeState.resolved === 'dark' ? 'light' : 'dark';
  setPreset(newTheme);
}

/**
 * Cycle through presets in order
 */
export function cyclePreset(): void {
  const presets: ThemePreset[] = ['light', 'dark', 'midnight', 'ocean', 'forest', 'sunset'];
  const currentIndex = presets.indexOf(themeState.preset);
  const nextIndex = (currentIndex + 1) % presets.length;
  setPreset(presets[nextIndex]);
}

/**
 * Migrate from legacy storage format if needed
 * Handles migration from both old IssueFlow keys and legacy theme format
 */
function migrateLegacyStorage(): ThemePreset | null {
  if (typeof localStorage === 'undefined') return null;

  // Check for new preset key first
  const preset = localStorage.getItem(PRESET_STORAGE_KEY) as ThemePreset | null;
  if (preset) return preset;

  // Check for old IssueFlow preset key and migrate
  const oldPreset = localStorage.getItem(OLD_PRESET_KEY) as ThemePreset | null;
  if (oldPreset) {
    localStorage.setItem(PRESET_STORAGE_KEY, oldPreset);
    localStorage.removeItem(OLD_PRESET_KEY);
    localStorage.removeItem(OLD_LEGACY_KEY);
    return oldPreset;
  }

  // Fall back to legacy key (new naming)
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) as Theme | null;
  if (legacy && ['light', 'dark', 'system'].includes(legacy)) {
    localStorage.setItem(PRESET_STORAGE_KEY, legacy);
    return legacy;
  }

  // Fall back to old IssueFlow legacy key
  const oldLegacy = localStorage.getItem(OLD_LEGACY_KEY) as Theme | null;
  if (oldLegacy && ['light', 'dark', 'system'].includes(oldLegacy)) {
    localStorage.setItem(PRESET_STORAGE_KEY, oldLegacy);
    localStorage.removeItem(OLD_LEGACY_KEY);
    return oldLegacy;
  }

  return null;
}

/**
 * Initialize theme from localStorage or system preference
 * Should be called once when the app mounts.
 * Returns a cleanup function to remove event listeners.
 */
export function initTheme(): () => void {
  if (typeof localStorage === 'undefined') return () => {};

  // Get stored preset with migration support
  const storedPreset = migrateLegacyStorage();

  const validPresets: ThemePreset[] = [
    'light',
    'dark',
    'midnight',
    'ocean',
    'forest',
    'sunset',
    'system'
  ];

  if (storedPreset && validPresets.includes(storedPreset)) {
    themeState.preset = storedPreset;
    themeState.useSystemPreference = storedPreset === 'system';
  } else {
    themeState.preset = 'system';
    themeState.useSystemPreference = true;
  }

  themeState.resolved = resolvePresetToBase(themeState.preset);
  applyPreset(themeState.preset, themeState.resolved);

  // Listen for system preference changes
  let cleanup: () => void = () => {};

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (themeState.useSystemPreference) {
        themeState.resolved = e.matches ? 'dark' : 'light';
        applyPreset(themeState.preset, themeState.resolved);
      }
    };

    mediaQuery.addEventListener('change', handler);
    cleanup = () => mediaQuery.removeEventListener('change', handler);
  }

  return cleanup;
}

// Re-export types and utilities from theme-presets for convenience
export type { ThemePreset };
export { getPresetConfig, isDarkPreset, getAvailablePresets } from './theme-presets';
