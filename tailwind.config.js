/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        'bg-card': '#13131a',
        'bg-card-hover': '#1a1a24',
        primary: '#6c63ff',
        accent: '#ff6584',
        'text-secondary': '#8888aa',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
