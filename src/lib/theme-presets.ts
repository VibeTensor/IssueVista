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
      accent: 'oklch(0.78 0.13 291)',
      accentHover: 'oklch(0.68 0.13 291)'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: 'moon',
    isDark: true,
    colors: {
      bgPrimary: 'oklch(0.1648 0.0075 270.93)',
      bgSecondary: 'oklch(0.22 0.01 270)',
      bgTertiary: 'oklch(0.28 0.012 270)',
      bgCard: 'oklch(0.22 0.01 270 / 0.7)',
      bgInput: 'oklch(0.22 0.01 270 / 0.8)',
      textPrimary: 'oklch(0.98 0.004 264)',
      textSecondary: 'oklch(0.9 0.008 264)',
      textMuted: 'oklch(0.65 0.01 264)',
      border: 'oklch(0.4 0.01 264 / 0.3)',
      shadow: 'oklch(0 0 0 / 0.4)',
      accent: 'oklch(0.78 0.13 291)',
      accentHover: 'oklch(0.83 0.13 291)'
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    icon: 'star',
    isDark: true,
    colors: {
      bgPrimary: 'oklch(0.13 0.03 280)',
      bgSecondary: 'oklch(0.17 0.035 280)',
      bgTertiary: 'oklch(0.22 0.04 280)',
      bgCard: 'oklch(0.17 0.035 280 / 0.8)',
      bgInput: 'oklch(0.17 0.035 280 / 0.9)',
      textPrimary: 'oklch(0.93 0.01 280)',
      textSecondary: 'oklch(0.82 0.015 280)',
      textMuted: 'oklch(0.6 0.03 280)',
      border: 'oklch(0.6 0.03 280 / 0.25)',
      shadow: 'oklch(0 0 0 / 0.5)',
      accent: 'oklch(0.55 0.24 285)',
      accentHover: 'oklch(0.65 0.22 285)'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    icon: 'wave',
    isDark: true,
    colors: {
      bgPrimary: 'oklch(0.16 0.03 250)',
      bgSecondary: 'oklch(0.22 0.04 250)',
      bgTertiary: 'oklch(0.28 0.05 250)',
      bgCard: 'oklch(0.22 0.04 250 / 0.8)',
      bgInput: 'oklch(0.22 0.04 250 / 0.9)',
      textPrimary: 'oklch(0.95 0.01 230)',
      textSecondary: 'oklch(0.85 0.03 230)',
      textMuted: 'oklch(0.72 0.08 230)',
      border: 'oklch(0.72 0.08 230 / 0.25)',
      shadow: 'oklch(0 0 0 / 0.5)',
      accent: 'oklch(0.65 0.17 230)',
      accentHover: 'oklch(0.72 0.14 230)'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    icon: 'tree',
    isDark: true,
    colors: {
      bgPrimary: 'oklch(0.15 0.03 145)',
      bgSecondary: 'oklch(0.2 0.04 145)',
      bgTertiary: 'oklch(0.26 0.05 145)',
      bgCard: 'oklch(0.2 0.04 145 / 0.8)',
      bgInput: 'oklch(0.2 0.04 145 / 0.9)',
      textPrimary: 'oklch(0.95 0.02 145)',
      textSecondary: 'oklch(0.85 0.05 145)',
      textMuted: 'oklch(0.72 0.1 145)',
      border: 'oklch(0.72 0.1 145 / 0.25)',
      shadow: 'oklch(0 0 0 / 0.5)',
      accent: 'oklch(0.65 0.19 150)',
      accentHover: 'oklch(0.72 0.17 150)'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    icon: 'sunset',
    isDark: true,
    colors: {
      bgPrimary: 'oklch(0.15 0.03 25)',
      bgSecondary: 'oklch(0.2 0.035 25)',
      bgTertiary: 'oklch(0.26 0.04 25)',
      bgCard: 'oklch(0.2 0.035 25 / 0.8)',
      bgInput: 'oklch(0.2 0.035 25 / 0.9)',
      textPrimary: 'oklch(0.97 0.005 25)',
      textSecondary: 'oklch(0.87 0.03 25)',
      textMuted: 'oklch(0.75 0.06 25)',
      border: 'oklch(0.75 0.06 25 / 0.25)',
      shadow: 'oklch(0 0 0 / 0.5)',
      accent: 'oklch(0.72 0.17 55)',
      accentHover: 'oklch(0.78 0.14 55)'
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
