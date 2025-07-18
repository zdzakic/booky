import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { theme } from '../config/theme';

const NotFoundPage = () => {
  const bgColor = `bg-${theme.colors.info}-100`;
  const textColor = `text-${theme.colors.info}-700`;
  const buttonBgColor = `bg-${theme.colors.primary}-700`;
  const buttonHoverBgColor = `hover:bg-${theme.colors.primary}-800`;
  const ringColor = `focus:ring-${theme.colors.primary}-700`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${bgColor}`}>
          <SearchX className={`h-6 w-6 ${textColor}`} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sorry, the page you are looking for does not exist. You might have mistyped the address or the page may have moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className={`inline-flex items-center px-4 py-2 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonBgColor} ${buttonHoverBgColor} ${ringColor}`}
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
