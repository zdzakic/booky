import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword = () => {},
}) => {
  const baseClasses =
    'block w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none transition-colors duration-200';

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
      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={`${baseClasses} ${stateClasses} ${showPasswordToggle ? 'pr-12' : ''} ${className}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-4 flex items-center text-neutral-dark"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <div className="min-h-[20px] mt-1">
        {error && <p className="mt-1.5 text-xs text-error-dark">{error}</p>}
      </div>
    </div>
  );
};

export default InputField;
