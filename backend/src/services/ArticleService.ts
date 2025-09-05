import { IArticleRepository, ArticleData } from '../repositories/base/BaseRepository';
import { Locale, PaginationParams, PaginationResult } from '../types/common';

export interface IArticleService {
  getArticles(locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>>;
  getArticleById(id: number, locale: Locale): Promise<ArticleData | null>;
  getArticleBySlug(slug: string, locale: Locale): Promise<ArticleData | null>;
  createArticle(data: Omit<ArticleData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<ArticleData>;
  updateArticle(id: number, data: Partial<ArticleData>, locale?: Locale): Promise<ArticleData>;
  deleteArticle(id: number): Promise<void>;
  getPopularArticles(locale: Locale, limit?: number): Promise<ArticleData[]>;
  searchArticles(query: string, locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>>;
}

export class ArticleService implements IArticleService {
  private articleRepository: IArticleRepository;
  
  constructor(articleRepository: IArticleRepository) {
    this.articleRepository = articleRepository;
  }
  
  async getArticles(locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>> {
    return await this.articleRepository.findMany(locale, params);
  }
  
  async getArticleById(id: number, locale: Locale): Promise<ArticleData | null> {
    const article = await this.articleRepository.findById(id, locale);
    
    if (article) {
      // Increment view count (only for main article)
      await this.articleRepository.update(id, { 
        viewCount: article.viewCount + 1 
      }, 'ja');
    }
    
    return article;
  }
  
  async getArticleBySlug(slug: string, locale: Locale): Promise<ArticleData | null> {
    return await this.articleRepository.findBySlug(slug, locale);
  }
  
  async createArticle(data: Omit<ArticleData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<ArticleData> {
    // Validate required fields
    if (!data.title || !data.content) {
      throw new Error('Title and content are required');
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.title);
    }
    
    // Ensure slug is unique
    const existingArticle = await this.articleRepository.findBySlug(data.slug, 'ja');
    if (existingArticle) {
      data.slug = `${data.slug}-${Date.now()}`;
    }
    
    return await this.articleRepository.create(data, locale);
  }
  
  async updateArticle(id: number, data: Partial<ArticleData>, locale?: Locale): Promise<ArticleData> {
    const existingArticle = await this.articleRepository.findById(id, locale || 'ja');
    if (!existingArticle) {
      throw new Error('Article not found');
    }
    
    // If slug is being updated, ensure it's unique
    if (data.slug && data.slug !== existingArticle.slug) {
      const existingWithSlug = await this.articleRepository.findBySlug(data.slug, 'ja');
      if (existingWithSlug && existingWithSlug.id !== id) {
        throw new Error('Slug already exists');
      }
    }
    
    return await this.articleRepository.update(id, data, locale);
  }
  
  async deleteArticle(id: number): Promise<void> {
    const existingArticle = await this.articleRepository.findById(id, 'ja');
    if (!existingArticle) {
      throw new Error('Article not found');
    }
    
    await this.articleRepository.delete(id);
  }
  
  async getPopularArticles(locale: Locale, limit: number = 10): Promise<ArticleData[]> {
    const result = await this.articleRepository.findMany(locale, {
      limit,
      sortBy: 'viewCount',
      sortOrder: 'desc'
    });
    
    return result.data;
  }
  
  async searchArticles(query: string, locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>> {
    // This is a simplified implementation
    // In a real app, you'd want to use full-text search or a search engine like Elasticsearch
    const allArticles = await this.articleRepository.findMany(locale, {
      ...params,
      limit: 1000 // Get more articles to search through
    });
    
    const filteredArticles = allArticles.data.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Apply pagination to filtered results
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedResults = filteredArticles.slice(startIndex, endIndex);
    
    return {
      data: paginatedResults,
      total: filteredArticles.length,
      page,
      limit,
      totalPages: Math.ceil(filteredArticles.length / limit)
    };
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }
}