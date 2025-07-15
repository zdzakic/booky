// components/SubmitButton.jsx
import React from 'react';
import { theme } from '../config/theme';

const SubmitButton = ({ disabled, children, ...props }) => {
  // Dinamički kreiramo klase na osnovu teme.
  // Tailwind JIT će prepoznati ove klase jer su kompletni stringovi.
  const baseClasses = 'w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed';
  const colorClasses = `bg-${theme.colors.primary}-600 hover:bg-${theme.colors.primary}-700`;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${baseClasses} ${colorClasses}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SubmitButton;
