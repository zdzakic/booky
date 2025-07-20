// components/CheckboxField.jsx
import React from 'react';

const CheckboxField = ({ id, name, checked, onChange, label }) => (
  <div className="flex items-center my-4">
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-neutral-medium text-primary accent-primary focus:ring-primary focus:ring-offset-0"
    />
    <label
      htmlFor={id}
      className="ml-3 block text-sm text-neutral-darker dark:text-neutral-light"
    >
      {label}
    </label>
  </div>
);

export default CheckboxField;