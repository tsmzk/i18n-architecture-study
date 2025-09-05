export type Locale = 'ja' | 'en' | 'zh-CN' | 'zh-TW' | 'ko';
export type PrismaLocale = 'ja' | 'en' | 'zh_cn' | 'zh_tw' | 'ko';

// Convert frontend locale format to Prisma enum format
export const toPrismaLocale = (locale: Locale): PrismaLocale => {
  switch (locale) {
    case 'zh-CN':
      return 'zh_cn';
    case 'zh-TW':
      return 'zh_tw';
    default:
      return locale as PrismaLocale;
  }
};

// Convert Prisma enum format to frontend locale format
export const fromPrismaLocale = (locale: PrismaLocale): Locale => {
  switch (locale) {
    case 'zh_cn':
      return 'zh-CN';
    case 'zh_tw':
      return 'zh-TW';
    default:
      return locale as Locale;
  }
};

export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Translatable {
  locale?: Locale;
}

export interface Translation {
  id: number;
  locale: Locale;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}