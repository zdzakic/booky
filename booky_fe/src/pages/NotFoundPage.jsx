import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
          <SearchX className="h-6 w-6 text-orange-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sorry, the page you are looking for does not exist. You might have mistyped the address or the page may have moved.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
