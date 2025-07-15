// src/config/theme.js

/**
 * Centralna konfiguracija za izgled aplikacije.
 * Definisanjem boja i stilova na jednom mestu, omogućavamo laku i brzu
 * promenu kompletnog vizuelnog identiteta aplikacije za nove klijente.
 *
 * Princip: Ne hardkodujemo boje (npr. 'bg-blue-500') u komponentama,
 * već se pozivamo na ove vrednosti.
 */
export const theme = {
  colors: {
    // Glavna boja brenda za dugmad, linkove i aktivne elemente
    primary: 'orange',

    // Sekundarna boja za manje važne akcije ili alternativno isticanje
    secondary: 'blue',

    // Boje za statuse i notifikacije
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'sky', // Neutralna plava za informativne poruke
  },

  // Ovde kasnije možemo dodati i druge delove teme
  // kao što su zaobljenost uglova (borderRadius), veličina fonta, itd.
  // borderRadius: 'rounded-lg',
};
