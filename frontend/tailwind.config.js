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
          DEFAULT: '#152F27',
          light: '#7B9965',
          dark: '#0a1a14',
        },
        brand: {
          900: '#152F27',
          700: '#7B9965',
          300: '#e2f7d0',
          100: '#f5ffeb',
        },
        environmental: '#7B9965',
        social: '#924131',
        governance: '#EFD4A8',
        status: {
          critical: '#DC2626',
          attention: '#F59E0B',
          good: '#FCD34D',
          'very-good': '#84CC16',
          excellent: '#22C55E',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
