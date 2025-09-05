import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../../types/i18n';
import { locales, localeNames } from '../../types/i18n';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value as Locale;
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select">{t('selectLanguage')}: </label>
      <select
        id="language-select"
        value={i18n.language}
        onChange={handleLanguageChange}
        className="language-select"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
};