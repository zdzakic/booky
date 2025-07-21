import { theme } from './src/config/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Učitavamo sve boje definisane u našem centralnom theme.js fajlu
        ...theme.colors,
      },
    },
  },
  plugins: [],
  // Ažurirana safelist-a koja prepoznaje naš novi semantički sistem boja.
  // Ovo osigurava da Tailwind ne ukloni klase koje dinamički generišemo.
  safelist: [
    {
      // Primer: bg-primary, text-neutral-dark, border-success-light
      pattern: /^(bg|text|border|ring)-(brand|primary|secondary|neutral|success|error|warning|info)(-(light|dark|lightest|darker|medium|even-darker))?$/,
    },
  ],
}
