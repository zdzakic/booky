import React from 'react';

const InputField = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required = false,
  className = '',
}) => {
  const baseClasses = 'block w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none transition-colors duration-200';
  
  // Uslovno dodavanje klasa za grešku ili normalno stanje
  const stateClasses = error
    ? 'text-error-dark border-error focus:border-error focus:ring-error'
    : 'text-neutral-darker border-neutral-medium focus:border-primary focus:ring-primary';

  return (
    <div className="w-full flex flex-col">
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-neutral-dark mb-1">
          {label}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className={`${baseClasses} ${stateClasses} ${className}`}
      />
      {/* Prikaz error poruke ispod inputa, uvijek rezervisan prostor */}
      <div className="min-h-[20px] mt-1">
        {error && (
          <p className="mt-1.5 text-xs text-error-dark">{error}</p>
        )}
      </div>
    </div>
  );
};

export default InputField;
