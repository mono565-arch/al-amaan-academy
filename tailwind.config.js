/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#14365d', dark: '#0d2540' },
        gold: { DEFAULT: '#c9a227', light: '#f4e7b5' },
      },
    },
  },
  plugins: [],
};
