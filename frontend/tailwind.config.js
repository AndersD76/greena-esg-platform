/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D5F4F',
          dark: '#1A3A2E',
        },
        environmental: '#2D5F4F',
        social: '#8B4636',
        governance: '#D4A574',
        status: {
          critical: '#DC2626',
          attention: '#F59E0B',
          good: '#FCD34D',
          'very-good': '#84CC16',
          excellent: '#22C55E',
        },
      },
    },
  },
  plugins: [],
}
