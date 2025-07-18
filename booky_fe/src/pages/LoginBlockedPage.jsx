import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { theme } from '../config/theme';

const LoginBlockedPage = () => {
  const pageBgColor = `bg-${theme.colors.error}-50`;
  const iconBgColor = `bg-${theme.colors.error}-100`;
  const iconColor = `text-${theme.colors.error}-600`;
  const textColor = `text-${theme.colors.error}-900`;
  const darkTextColor = `dark:text-${theme.colors.error}-100`;

  return (
    <div className={`min-h-screen flex items-center justify-center ${pageBgColor} dark:bg-gray-900`}>
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor}`}>
          <ShieldAlert className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h2 className={`mt-6 text-2xl font-bold ${textColor} ${darkTextColor}`}>
          Too Many Failed Login Attempts
        </h2>
        <p className={`mt-2 ${textColor} ${darkTextColor}`}>
          For your security, access from your IP address has been temporarily blocked. Please try again later or contact support.
        </p>
      </div>
    </div>
  );
};

export default LoginBlockedPage;
