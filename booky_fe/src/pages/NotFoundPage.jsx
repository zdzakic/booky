import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { translations } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

const NotFoundPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-lightest dark:bg-neutral-darkest p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg dark:bg-neutral-dark relative">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-lighter">
          <SearchX className="h-6 w-6 text-primary-dark" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-neutral-darkest dark:text-neutral-lightest">
          {t.notFoundTitle}
        </h2>
        <p className="mt-2 text-neutral-darker dark:text-neutral-light">
          {t.notFoundMsg}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-primary hover:bg-primary-dark focus:ring-primary"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
