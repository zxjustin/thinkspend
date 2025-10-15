/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Notion-inspired professional color palette
      colors: {
        // Professional grayscale (primary palette)
        notion: {
          bg: '#FFFFFF',
          'bg-secondary': '#FAFAFA',
          'bg-hover': '#F7F7F7',
          'bg-selected': '#F1F1F1',
          border: '#E9E9E9',
          'border-light': '#F1F1F1',
          text: '#171717',
          'text-secondary': '#6B6B6B',
          'text-tertiary': '#9B9B9B',
        },
        // Subtle accent colors (use sparingly)
        accent: {
          blue: '#2383E2',
          'blue-bg': '#EBF5FF',
          green: '#0F7B6C',
          'green-bg': '#DDEDEA',
          red: '#E03E3E',
          'red-bg': '#FBE4E4',
          purple: '#9065B0',
          'purple-bg': '#F5EFFF',
          gray: '#9B9A97',
          'gray-bg': '#F1F1EF',
        },
      },
      // Professional typography
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Notion-style text sizes
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['40px', '48px'],
      },
      // Generous spacing for calm UI
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
