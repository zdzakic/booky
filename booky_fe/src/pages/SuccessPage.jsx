// src/pages/SuccessPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { translations } from '../utils/translations';

const SuccessPage = () => {
  const location = useLocation();
  const lang = location.state?.lang || 'de';
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-lightest dark:bg-neutral-darkest p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg dark:bg-neutral-dark">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-lighter">
          <CheckCircle className="h-6 w-6 text-success-dark" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-neutral-darkest dark:text-neutral-lightest">
          {t.successTitle}
        </h2>
        <p className="mt-2 text-neutral-darker dark:text-neutral-light">
          {t.successMsg}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-primary hover:bg-primary-dark focus:ring-primary"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
