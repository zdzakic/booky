import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../config/theme';

const EmptyState = ({ icon, title, message, buttonText, buttonLink }) => {
  const navigate = useNavigate();

  // Note: For this to work with Tailwind's JIT compiler, you might need to safelist these dynamic classes
  // in your tailwind.config.js if they are not found in your static code.
  const buttonColorClasses = `bg-${theme.colors.primary}-600 hover:bg-${theme.colors.primary}-700`;

  return (
    <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 my-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {buttonText && buttonLink && (
        <div className="mt-6">
          <button
            onClick={() => navigate(buttonLink)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${buttonColorClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.colors.primary}-500`}
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
