// Locale type definition
export type Locale = 'ja' | 'en' | 'zh-CN' | 'zh-TW' | 'ko';

export interface TranslationResource {
  common: {
    welcome: string;
    language: string;
    selectLanguage: string;
    home: string;
    about: string;
    products: string;
    articles: string;
    contact: string;
    loading: string;
    error: string;
    retry: string;
    search: string;
    noResults: string;
    viewMore: string;
    back: string;
    next: string;
    previous: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirmDelete: string;
    success: string;
    failed: string;
  };
}

export const locales: Locale[] = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];

export const localeNames: Record<Locale, string> = {
  'ja': '日本語',
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ko': '한국어',
};

// Explicit re-export to ensure module resolution
export { type Locale };