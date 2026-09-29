/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        obsidian: '#05070c',
        panel: '#0b101c',
        cyanGlow: '#10d9ff',
        redGlow: '#ff3f5f',
        successGlow: '#2dff9d',
        warningGlow: '#ffd166',
      },
      boxShadow: {
        neon: '0 0 28px rgba(16, 217, 255, 0.24)',
        danger: '0 0 28px rgba(255, 63, 95, 0.24)',
        success: '0 0 26px rgba(45, 255, 157, 0.2)',
      },
      backgroundImage: {
        'radial-grid':
          'radial-gradient(circle at center, rgba(16, 217, 255, 0.16) 0, transparent 36%), linear-gradient(rgba(16, 217, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 217, 255, 0.06) 1px, transparent 1px)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
        },
        gridDrift: {
          from: { backgroundPosition: '0 0, 0 0, 0 0' },
          to: { backgroundPosition: '0 0, 0 44px, 44px 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        gridDrift: 'gridDrift 18s linear infinite',
        scan: 'scan 7s linear infinite',
      },
    },
  },
  plugins: [],
};
