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
          800: '#0F0F0F',
          700: '#161616',
          600: '#1F1F1F',
        },
        pearl: {
          50: '#FFFFFF',
          DEFAULT: '#F4F2EF',
          100: '#F4F2EF',
          200: '#E6E3DE',
          300: '#D5D0C9',
        },
        coral: {
          DEFAULT: '#C72C41',
          hover: '#B02336',
          light: '#E03D53',
          glow: 'rgba(199, 44, 65, 0.28)',
        },
        cherry: {
          DEFAULT: '#C72C41',
          hover: '#B02336',
          light: '#E03D53',
          glow: 'rgba(199, 44, 65, 0.28)',
        },
        smoke: {
          DEFAULT: '#929292',
          light: '#B4B4B4',
          dark: '#555555',
          muted: '#3A3A3A',
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
