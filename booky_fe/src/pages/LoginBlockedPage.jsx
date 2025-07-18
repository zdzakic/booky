import React from 'react';
import { ShieldAlert } from 'lucide-react';

const LoginBlockedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <ShieldAlert className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Too Many Failed Login Attempts
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          For your security, access from your IP address has been temporarily blocked. Please try again later or contact support.
        </p>
      </div>
    </div>
  );
};

export default LoginBlockedPage;
