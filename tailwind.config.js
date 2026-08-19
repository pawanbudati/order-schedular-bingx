/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bingx: {
          blue: '#1E6091',
          cyan: '#00B4D8',
          accent: '#2A6F97',
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
        },
      },
    },
  },
  plugins: [],
};
