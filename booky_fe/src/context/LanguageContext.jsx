import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    // Try to get the language from localStorage, default to 'de'
    const storedLang = localStorage.getItem('appLanguage');
    return storedLang || 'de';
  });

  // Update localStorage whenever the language changes
  useEffect(() => {
    localStorage.setItem('appLanguage', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
