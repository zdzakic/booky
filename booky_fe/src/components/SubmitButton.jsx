// components/SubmitButton.jsx
import React from 'react';

const SubmitButton = ({ disabled, children, ...props }) => {
  // Koristimo statičke, semantičke klase koje Tailwind može prepoznati.
  // Ovo osigurava da se primarna boja (narančasta) ispravno primijeni.
  const buttonClasses = 'w-full text-white font-semibold py-3 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary';

  return (
    <button
      type="submit"
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default SubmitButton;
