// StatCard.jsx
import React from 'react';

const StatCard = ({ value, label, className = '' }) => (
  <div className={`bg-white p-4 rounded-lg shadow border ${className}`}>
    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    <p className="text-sm font-medium text-gray-500">{label}</p>
  </div>
);

export default StatCard;