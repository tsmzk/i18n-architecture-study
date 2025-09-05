import { Locale, PaginationParams, PaginationResult } from '../../types/common';

export interface LocalizedContent {
  id: number;
  locale?: Locale;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleData extends LocalizedContent {
  title: string;
  content: string;
  summary?: string;
  slug: string;
  categoryId: number;
  published: boolean;
  publishedAt?: Date;
  viewCount: number;
}

export interface CategoryData extends LocalizedContent {
  name: string;
  description?: string;
  slug: string;
  parentId?: number;
  displayOrder: number;
}

export interface TagData extends LocalizedContent {
  name: string;
  description?: string;
}

export abstract class BaseRepository {
  protected abstract prismaClient: any;
  
  protected buildPaginationQuery(params: PaginationParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    
    return {
      skip,
      take: limit,
      orderBy: params.sortBy ? {
        [params.sortBy]: params.sortOrder || 'desc'
      } : undefined
    };
  }
  
  protected buildPaginationResult<T>(
    data: T[], 
    total: number, 
    params: PaginationParams
  ): PaginationResult<T> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }
}

// Repository interfaces for each pattern
export interface IArticleRepository {
  findMany(locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>>;
  findById(id: number, locale: Locale): Promise<ArticleData | null>;
  findBySlug(slug: string, locale: Locale): Promise<ArticleData | null>;
  create(data: Omit<ArticleData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<ArticleData>;
  update(id: number, data: Partial<ArticleData>, locale?: Locale): Promise<ArticleData>;
  delete(id: number): Promise<void>;
}

export interface ICategoryRepository {
  findMany(locale: Locale, params?: PaginationParams): Promise<PaginationResult<CategoryData>>;
  findById(id: number, locale: Locale): Promise<CategoryData | null>;
  findBySlug(slug: string, locale: Locale): Promise<CategoryData | null>;
  create(data: Omit<CategoryData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<CategoryData>;
  update(id: number, data: Partial<CategoryData>, locale?: Locale): Promise<CategoryData>;
  delete(id: number): Promise<void>;
}

export interface ITagRepository {
  findMany(locale: Locale, params?: PaginationParams): Promise<PaginationResult<TagData>>;
  findById(id: number, locale: Locale): Promise<TagData | null>;
  create(data: Omit<TagData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<TagData>;
  update(id: number, data: Partial<TagData>, locale?: Locale): Promise<TagData>;
  delete(id: number): Promise<void>;
}