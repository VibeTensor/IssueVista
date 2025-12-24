import { defineConfig, presetUno, presetTypography } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  theme: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      danger: '#ef4444',
      dark: '#1e293b',
      light: '#f1f5f9'
    }
  }
});
