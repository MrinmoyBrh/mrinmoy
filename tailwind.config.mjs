/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jet: '#0A0A0B',
        charcoal: '#171719',
        softwhite: '#F4F2EF',
        smokegrey: '#929297',
        cherry: {
          DEFAULT: '#C72C41',
          hover: '#B22336',
          light: '#D94558',
          muted: 'rgba(199, 44, 65, 0.12)',
        },
        ink: {
          950: '#070708',
          DEFAULT: '#0A0A0B',
          900: '#0A0A0B',
          800: '#171719',
          700: '#212124',
          600: '#2C2C30',
        },
        pearl: {
          50: '#FFFFFF',
          DEFAULT: '#F4F2EF',
          100: '#F4F2EF',
          200: '#E6E4E0',
          300: '#D5D3CF',
        },
        coral: {
          DEFAULT: '#C72C41',
          hover: '#B22336',
          light: '#D94558',
          glow: 'rgba(199, 44, 65, 0.12)',
        },
        smoke: {
          DEFAULT: '#929297',
          light: '#B5B5BA',
          dark: '#68686E',
          muted: '#48484E',
        },
        orbital: {
          DEFAULT: '#C72C41',
          hover: '#B22336',
          light: '#D94558',
          glow: 'rgba(199, 44, 65, 0.12)',
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
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'surface-elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        'minimal-border': '0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
};
