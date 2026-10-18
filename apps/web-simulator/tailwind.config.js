/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tesla-red': '#E82127',
        'tesla-dark': '#0B0F19',
        'space-black': '#05070B',
        'ano-white': '#F8FAFC',
        'gold-glaze': '#D97706',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
