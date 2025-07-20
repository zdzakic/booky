// StatCard.jsx
import React from 'react';

// Mapa sada koristi semantičke nazive ('primary', 'warning'...) kao ključeve
const colorStyles = {
  primary: { // Odgovara prop-u 'primary'
    border: 'border-orange-200 dark:border-orange-800',
    value: 'text-orange-600 dark:text-orange-300',
    label: 'text-orange-500 dark:text-orange-400',
  },
  warning: { // Odgovara prop-u 'warning'
    border: 'border-amber-200 dark:border-amber-800',
    value: 'text-amber-600 dark:text-amber-300',
    label: 'text-amber-500 dark:text-amber-400',
  },
  info: { // Odgovara prop-u 'info'
    border: 'border-sky-200 dark:border-sky-800',
    value: 'text-sky-600 dark:text-sky-300',
    label: 'text-sky-500 dark:text-sky-400',
  },
  gray: {
    border: 'border-gray-200 dark:border-gray-800',
    value: 'text-gray-600 dark:text-gray-300',
    label: 'text-gray-500 dark:text-gray-400',
  },
};

const StatCard = ({ value, label, color = 'gray' }) => {
  // Koristimo 'color' prop (npr. 'primary') da odaberemo ispravan set stilova
  const styles = colorStyles[color] || colorStyles.gray;

  return (
    <div className={`p-4 rounded-lg shadow-sm border bg-white dark:bg-gray-800/20 ${styles.border}`}>
      <h3 className={`text-3xl font-bold ${styles.value}`}>{value}</h3>
      <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
    </div>
  );
};

export default StatCard;
