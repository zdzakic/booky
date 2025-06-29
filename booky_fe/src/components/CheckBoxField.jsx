// components/CheckboxField.jsx
import React from 'react';

const CheckboxField = ({ id, name, checked, onChange, label }) => (
  <div className="flex items-center">
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-0"
    />
    <label
      htmlFor={id}
      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
  </div>
);

export default CheckboxField;