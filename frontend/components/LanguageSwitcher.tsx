import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLng = i18n.language.split('-')[0]; // Handle cases like 'id-ID'

  return (
    <div className="flex bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg border border-gray-700 shadow-lg">
      <button
        onClick={() => changeLanguage('id')}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
          currentLng === 'id' 
            ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-lg' 
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        ID
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
          currentLng === 'en' 
            ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-lg' 
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        EN
      </button>
    </div>
  );
};
