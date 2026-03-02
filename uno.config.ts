import { defineConfig, presetUno, presetTypography } from 'unocss';

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class'
    }),
    presetTypography()
  ],
  theme: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      danger: '#ef4444',
      dark: '#1e293b',
      light: '#f1f5f9'
    },
    animation: {
      keyframes: {
        aurora: `{
          0% { background-position: 0% 50%; transform: rotate(-5deg) scale(0.9); }
          25% { background-position: 50% 100%; transform: rotate(5deg) scale(1.1); }
          50% { background-position: 100% 50%; transform: rotate(-3deg) scale(0.95); }
          75% { background-position: 50% 0%; transform: rotate(3deg) scale(1.05); }
          100% { background-position: 0% 50%; transform: rotate(-5deg) scale(0.9); }
        }`,
        ripple: `{
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
        }`,
        orbit: `{
          0% { transform: rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg); }
          100% { transform: rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg); }
        }`,
        'fade-in-up': `{
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }`
      },
      durations: {
        aurora: '8s',
        ripple: '2s',
        orbit: '20s',
        'fade-in-up': '0.6s'
      },
      timingFns: {
        aurora: 'ease-in-out',
        ripple: 'ease',
        orbit: 'linear',
        'fade-in-up': 'ease-out'
      },
      counts: {
        aurora: 'infinite',
        ripple: 'infinite',
        orbit: 'infinite',
        'fade-in-up': '1'
      }
    }
  }
});
