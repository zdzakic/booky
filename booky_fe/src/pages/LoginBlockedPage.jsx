import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { translations } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

const LoginBlockedPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-lightest dark:bg-neutral-darkest p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg dark:bg-neutral-dark relative">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-lighter">
          <ShieldAlert className="h-6 w-6 text-error-dark" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-neutral-darkest dark:text-neutral-lightest">
          {t.loginBlockedTitle}
        </h2>
        <p className="mt-2 text-neutral-darker dark:text-neutral-light">
          {t.loginBlockedMsg}
        </p>
      </div>
    </div>
  );
};

export default LoginBlockedPage;
