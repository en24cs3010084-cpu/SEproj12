/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0f1d',
          900: '#0F172A',
          850: '#131c33',
          800: '#1e293b',
          700: '#334155',
        },
        neon: {
          green: '#22C55E',
          greenDim: '#16a34a',
          purple: '#A855F7',
          purpleDim: '#9333ea',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 24px -4px rgba(34, 197, 94, 0.45)',
        'glow-purple': '0 0 24px -4px rgba(168, 85, 247, 0.45)',
        glass: '0 8px 32px -8px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(168,85,247,0.10), transparent 55%), radial-gradient(circle at 100% 100%, rgba(34,197,94,0.08), transparent 45%)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.65', filter: 'brightness(1.4)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.25s ease-out',
        'marquee': 'marquee 18s linear infinite',
      },
    },
  },
  plugins: [],
};
