import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Semantic surface/text tokens that read from CSS variables
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
          elevated: 'var(--color-surface-elevated)',
          border: 'var(--color-surface-border)',
        },
        content: {
          DEFAULT: 'var(--color-content)',
          secondary: 'var(--color-content-secondary)',
          muted: 'var(--color-content-muted)',
        },
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
