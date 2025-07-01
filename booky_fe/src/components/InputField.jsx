import React from 'react';

const InputField = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  className = '',
}) => (
  <div className="w-full flex flex-col">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`
        w-full px-4 py-3 rounded-xl border
        border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:border-orange-400 focus:ring-0
        transition
        ${error ? 'border-orange-500' : ''}
        ${className}
      `}
      aria-invalid={!!error}
    />
    {/* Prikaz error poruke ispod inputa, uvijek rezervisan prostor */}
    <div className="min-h-[20px] mt-1">
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  </div>
);

export default InputField;
