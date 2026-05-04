/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Emerald green theme - primary brand color
        primary: {
          50: '#ecfdf5',   // Lightest emerald (backgrounds, hover states)
          100: '#d1fae5',  // Light emerald (subtle backgrounds)
          200: '#a7f3d0',  // Lighter emerald
          300: '#6ee7b7',  // Medium light emerald
          400: '#34d399',  // Medium emerald
          500: '#10b981',  // Main emerald (buttons, links, primary actions)
          600: '#059669',  // Dark emerald (button hover, active states)
          700: '#047857',  // Darker emerald (pressed states)
          800: '#065f46',  // Darkest emerald (text, headings)
          900: '#064e3b',  // Ultra dark emerald
        },
        // Status colors for alerts, badges, notifications
        status: {
          critical: '#ef4444',  // Red (errors, delete, critical alerts)
          warning: '#f59e0b',   // Amber (warnings, pending actions)
          info: '#3b82f6',      // Blue (information, neutral)
          success: '#10b981',   // Green/Emerald (success, completed)
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--font-plus-jakarta-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
    screens: {
      'sm': '640px',   // Mobile landscape, tablet portrait
      'md': '768px',   // Tablet landscape
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
