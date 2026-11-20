/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#040404',
          DEFAULT: '#080808',
          900: '#080808',
          800: '#0D1524',
          700: '#141D2E',
          600: '#1F2A3F',
        },
        pearl: {
          50: '#FFFFFF',
          DEFAULT: '#F7F5F0',
          100: '#F7F5F0',
          200: '#EDE9E0',
          300: '#DED8CB',
        },
        coral: {
          DEFAULT: '#F45D48',
          hover: '#E04B36',
          light: '#FF7A66',
          glow: 'rgba(244, 93, 72, 0.25)',
        },
        smoke: {
          DEFAULT: '#8C96A3',
          light: '#A3ADB8',
          dark: '#68727F',
          muted: '#4B5563',
        },
        orbital: {
          DEFAULT: '#16B8B0',
          hover: '#139C95',
          light: '#32D4CC',
          glow: 'rgba(22, 184, 176, 0.25)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      animation: {
        'orbit-slow': 'orbit 60s linear infinite',
        'orbit-mid': 'orbit 38s linear infinite reverse',
        'orbit-fast': 'orbit 22s linear infinite',
        'pulse-subtle': 'pulseGlow 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.04)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      boxShadow: {
        'glow-coral': '0 0 25px -4px rgba(244, 93, 72, 0.35)',
        'glow-orbital': '0 0 25px -4px rgba(22, 184, 176, 0.35)',
        'surface-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
