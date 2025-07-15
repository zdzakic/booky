/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'custom-orange': {
          100: '#FFF7ED',
          200: '#FFEDD5',
          700: '#C2410C',
          800: '#9A3412',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(red|green|blue|orange|sky|yellow|custom-orange)-(100|200)/,
    },
    {
      pattern: /text-(red|green|blue|orange|sky|yellow|custom-orange)-(600|700|800)/,
    },
    {
      pattern: /border-(red|green|blue|orange|sky|yellow|custom-orange)-200/,
    },
  ],
}
