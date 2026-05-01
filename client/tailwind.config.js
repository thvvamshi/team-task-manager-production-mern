/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        river: '#2563eb',
        mint: '#0f9f6e',
        amber: '#b7791f',
        rose: '#e11d48'
      },
      boxShadow: {
        soft: '0 10px 24px rgba(23, 32, 42, 0.08)'
      }
    }
  },
  plugins: []
};
