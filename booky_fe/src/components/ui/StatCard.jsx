// StatCard.jsx
import React from 'react';

const StatCard = ({ value, label, color = 'gray' }) => {
  // Sastavi klase na osnovu prop-a "color"
  // npr. color="warning" -> text-warning-dark, border-warning-light, itd.
  return (
    <div className={`
      p-4 rounded-lg shadow-sm border bg-neutral-white dark:bg-neutral-dark/20
      border-${color}-light dark:border-${color}-dark
    `}>
      <h3 className={`text-3xl font-bold text-${color}-dark dark:text-${color}-light`}>
        {value}
      </h3>
      <p className={`text-sm font-medium text-${color} dark:text-${color}-light`}>
        {label}
      </p>
    </div>
  );
};

export default StatCard;
