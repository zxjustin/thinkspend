/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Only use dark mode if 'dark' class is added manually
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
