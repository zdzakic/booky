// components/SubmitButton.jsx
import React from 'react';

const SubmitButton = ({ disabled, children, ...props }) => (
  <button
    type="submit"
    disabled={disabled}
    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

export default SubmitButton;
