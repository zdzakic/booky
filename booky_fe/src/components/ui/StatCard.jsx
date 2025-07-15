// StatCard.jsx
import React from 'react';

const StatCard = ({ value, label, color = 'gray' }) => {
  const cardClasses = `bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`;
  const valueClasses = `text-${color}-600 dark:text-${color}-300`;
  const labelClasses = `text-${color}-500 dark:text-${color}-400`;

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${cardClasses}`}>
      <h3 className={`text-3xl font-bold ${valueClasses}`}>{value}</h3>
      <p className={`text-sm font-medium ${labelClasses}`}>{label}</p>
    </div>
  );
};

export default StatCard;
