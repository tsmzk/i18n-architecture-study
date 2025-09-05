import { Request, Response, NextFunction } from 'express';
import { Locale } from '../types/common';

declare global {
  namespace Express {
    interface Request {
      locale: Locale;
    }
  }
}

const supportedLocales: Locale[] = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const defaultLocale: Locale = 'ja';

export const localeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`🌍 Locale middleware: ${req.method} ${req.path}`);
  // Check query parameter first
  let locale = req.query.locale as string;
  
  // If not in query, check header
  if (!locale) {
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      // Parse Accept-Language header
      const languages = acceptLanguage.split(',').map(lang => {
        const parts = lang.trim().split(';');
        return parts[0].toLowerCase();
      });
      
      // Find first supported language
      for (const lang of languages) {
        if (supportedLocales.includes(lang as Locale)) {
          locale = lang;
          break;
        }
        // Check for language code without region
        const langCode = lang.split('-')[0];
        if (langCode === 'zh') {
          locale = 'zh-CN'; // Default Chinese to simplified
          break;
        }
        if (supportedLocales.includes(langCode as Locale)) {
          locale = langCode;
          break;
        }
      }
    }
  }
  
  // Validate and set locale
  if (locale && supportedLocales.includes(locale as Locale)) {
    req.locale = locale as Locale;
  } else {
    req.locale = defaultLocale;
  }
  
  next();
};