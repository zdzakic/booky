/**
 * Centralna konfiguracija za vizualni identitet aplikacije.
 * Definiše paletu boja, tipografiju, razmake i druge stilske elemente.
 * Služi kao jedini izvor istine (Single Source of Truth) za dizajn sistem.
 */

// Preporučeni alat za generisanje i pregled paleta: https://uicolors.app/

export const theme = {
  colors: {
    // Glavna boja brenda , zelena
    brand: {
      light: '#4C7765',
      DEFAULT: '#426558',
      dark: '#38584A',
    },

    // Glavna boja brenda za interaktivne elemente (dugmad, linkovi, input polja...)
    primary: {
      light: '#FB923C',   // orange-400
      DEFAULT: '#F97316', // orange-500
      dark: '#EA580C',    // orange-600
    },

    // Sekundarna boja za manje važne akcije ili alternativno isticanje.
    secondary: {
      light: '#60A5FA',   // blue-400
      DEFAULT: '#3B82F6', // blue-500
      dark: '#2563EB',    // blue-600
    },

    // Neutralne boje za pozadine, tekst, kontejnere i obrube.
    neutral: {
      white: '#FFFFFF',
      lightest: '#F9FAFB', // gray-50
      light: '#F3F4F6',    // gray-100
      medium: '#D1D5DB',   // gray-300
      DEFAULT: '#6B7280',   // gray-500
      dark: '#374151',     // gray-700
      darker: '#1F2937',   // gray-800
      darkest: '#111827',  // gray-900
      'even-darker': '#030712', // gray-950
      black: '#000000',
    },

    // Boje za statuse i notifikacije.
    success: {
      light: '#D1FAE5',   // green-100
      DEFAULT: '#10B981', // green-500
      dark: '#047857',    // green-700
    },
    error: {
      light: '#FEE2E2',   // red-100
      DEFAULT: '#EF4444', // red-500
      dark: '#B91C1C',    // red-700
    },
    warning: {
      light: '#FEF3C7',   // amber-100
      DEFAULT: '#F59E0B', // amber-500
      dark: '#B45309',    // amber-700
    },
    info: {
      light: '#E0F2FE',   // sky-100
      DEFAULT: '#38BDF8', // sky-500
      dark: '#0284C7',    // sky-700
    },
  },

  // Ovdje kasnije možemo dodati i druge delove teme
  // kao što su zaobljenost uglova (borderRadius), veličina fonta, itd.
};
