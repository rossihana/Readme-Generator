import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  isDark?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isDark = true }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLng = i18n.language.split('-')[0];

  const containerCls = isDark
    ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700'
    : 'bg-white border-gray-200 shadow-sm';
  const activeCls = isDark
    ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-lg'
    : 'bg-purple-600 text-white shadow-sm';
  const inactiveCls = isDark
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-500 hover:text-gray-700';

  return (
    <div className={`flex p-1 rounded-lg border ${containerCls}`}>
      <button
        onClick={() => changeLanguage('id')}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currentLng === 'id' ? activeCls : inactiveCls}`}
      >
        ID
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currentLng === 'en' ? activeCls : inactiveCls}`}
      >
        EN
      </button>
    </div>
  );
};
