/**
 * Theme Presets Configuration
 * Issue #142 - Enhanced Dark Mode with Custom Themes
 *
 * Defines available theme presets with their color configurations.
 * Each preset includes semantic color tokens for consistent theming.
 */

/**
 * Available theme preset identifiers
 */
export type ThemePreset = 'light' | 'dark' | 'midnight' | 'ocean' | 'forest' | 'sunset' | 'system';

/**
 * Color configuration for a theme
 * Uses semantic naming for flexibility
 */
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgInput: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  shadow: string;
  accent: string;
  accentHover: string;
}

/**
 * Full theme preset configuration
 */
export interface ThemePresetConfig {
  id: ThemePreset;
  name: string;
  icon: 'sun' | 'moon' | 'star' | 'wave' | 'tree' | 'sunset' | 'system';
  isDark: boolean;
  colors: ThemeColors;
}

/**
 * Theme preset definitions
 */
export const THEME_PRESETS: Record<Exclude<ThemePreset, 'system'>, ThemePresetConfig> = {
  light: {
    id: 'light',
    name: 'Light',
    icon: 'sun',
    isDark: false,
    colors: {
      bgPrimary: '#f8fafc',
      bgSecondary: '#ffffff',
      bgTertiary: '#f1f5f9',
      bgCard: '#ffffff',
      bgInput: '#ffffff',
      textPrimary: '#1e293b',
      textSecondary: '#334155',
      textMuted: '#64748b',
      border: 'rgba(203, 213, 225, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.08)',
      accent: '#0d9488',
      accentHover: '#0f766e'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: 'moon',
    isDark: true,
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      bgCard: 'rgba(30, 41, 59, 0.7)',
      bgInput: 'rgba(30, 41, 59, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      border: 'rgba(148, 163, 184, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.4)',
      accent: '#14b8a6',
      accentHover: '#2dd4bf'
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    icon: 'star',
    isDark: true,
    colors: {
      bgPrimary: '#0a0a1a',
      bgSecondary: '#12122a',
      bgTertiary: '#1a1a3a',
      bgCard: 'rgba(18, 18, 42, 0.8)',
      bgInput: 'rgba(18, 18, 42, 0.9)',
      textPrimary: '#e8e8f0',
      textSecondary: '#c8c8d8',
      textMuted: '#8888aa',
      border: 'rgba(136, 136, 170, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      accent: '#6366f1',
      accentHover: '#818cf8'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    icon: 'wave',
    isDark: true,
    colors: {
      bgPrimary: '#0a1628',
      bgSecondary: '#0f2744',
      bgTertiary: '#163860',
      bgCard: 'rgba(15, 39, 68, 0.8)',
      bgInput: 'rgba(15, 39, 68, 0.9)',
      textPrimary: '#e0f2fe',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      border: 'rgba(125, 211, 252, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      accent: '#0ea5e9',
      accentHover: '#38bdf8'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    icon: 'tree',
    isDark: true,
    colors: {
      bgPrimary: '#0a1a0f',
      bgSecondary: '#0f2a16',
      bgTertiary: '#163a20',
      bgCard: 'rgba(15, 42, 22, 0.8)',
      bgInput: 'rgba(15, 42, 22, 0.9)',
      textPrimary: '#dcfce7',
      textSecondary: '#bbf7d0',
      textMuted: '#86efac',
      border: 'rgba(134, 239, 172, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      accent: '#22c55e',
      accentHover: '#4ade80'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    icon: 'sunset',
    isDark: true,
    colors: {
      bgPrimary: '#1a0a0a',
      bgSecondary: '#2a1010',
      bgTertiary: '#3a1818',
      bgCard: 'rgba(42, 16, 16, 0.8)',
      bgInput: 'rgba(42, 16, 16, 0.9)',
      textPrimary: '#fef2f2',
      textSecondary: '#fecaca',
      textMuted: '#fca5a5',
      border: 'rgba(252, 165, 165, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      accent: '#f97316',
      accentHover: '#fb923c'
    }
  }
};

/**
 * List of all dark presets (for UnoCSS dark: variant)
 */
export const DARK_PRESETS: ThemePreset[] = ['dark', 'midnight', 'ocean', 'forest', 'sunset'];

/**
 * Get preset configuration by ID
 */
export function getPresetConfig(preset: ThemePreset): ThemePresetConfig | null {
  if (preset === 'system') return null;
  return THEME_PRESETS[preset] ?? null;
}

/**
 * Check if a preset is a dark theme
 */
export function isDarkPreset(preset: ThemePreset): boolean {
  return DARK_PRESETS.includes(preset);
}

/**
 * Get all available presets for UI display
 */
export function getAvailablePresets(): ThemePresetConfig[] {
  return Object.values(THEME_PRESETS);
}
