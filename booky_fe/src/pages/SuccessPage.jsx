// src/pages/SuccessPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { translations } from '../utils/translations';
import { theme } from '../config/theme';

const SuccessPage = () => {
  const location = useLocation();
  const lang = location.state?.lang || 'de';
  const t = translations[lang];
  const navigate = useNavigate();

  const bgColor = `bg-${theme.colors.success}-100`;
  const textColor = `text-${theme.colors.success}-700`;
  const buttonBgColor = `bg-${theme.colors.primary}-700`;
  const buttonHoverBgColor = `hover:bg-${theme.colors.primary}-800`;
  const ringColor = `focus:ring-${theme.colors.primary}-700`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${bgColor}`}>
          <CheckCircle className={`h-6 w-6 ${textColor}`} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          {t.successTitle}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.successMsg}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className={`inline-flex items-center px-4 py-2 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonBgColor} ${buttonHoverBgColor} ${ringColor}`}
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
