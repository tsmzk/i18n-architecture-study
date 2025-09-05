import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { Locale } from '../types/i18n';

export const useTranslation = () => {
  const { t, i18n, ready } = useI18nTranslation('common');

  const currentLanguage = i18n.language as Locale;

  const changeLanguage = async (language: Locale) => {
    await i18n.changeLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(currentLanguage).format(number);
  };

  const formatCurrency = (amount: number, currency: string = 'JPY'): string => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
  };
};