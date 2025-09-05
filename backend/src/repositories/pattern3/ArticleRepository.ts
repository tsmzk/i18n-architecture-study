import { BaseRepository, IArticleRepository, ArticleData } from '../base/BaseRepository';
import { Locale, PaginationParams, PaginationResult } from '../../types/common';

interface TranslationMap {
  [key: string]: string;
}

export class Pattern3ArticleRepository extends BaseRepository implements IArticleRepository {
  protected prismaClient: any;
  
  constructor(prismaClient: any) {
    super();
    this.prismaClient = prismaClient;
  }
  
  async findMany(locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>> {
    const paginationQuery = this.buildPaginationQuery(params || {});
    
    const [articles, total] = await Promise.all([
      this.prismaClient.article.findMany({
        ...paginationQuery,
        where: {
          published: true
        }
      }),
      this.prismaClient.article.count({
        where: {
          published: true
        }
      })
    ]);
    
    const localizedArticles = articles.map((article: any) => this.mapToLocalizedArticle(article, locale));
    
    return this.buildPaginationResult(localizedArticles, total, params || {});
  }
  
  async findById(id: number, locale: Locale): Promise<ArticleData | null> {
    const article = await this.prismaClient.article.findUnique({
      where: { id }
    });
    
    if (!article) return null;
    
    return this.mapToLocalizedArticle(article, locale);
  }
  
  async findBySlug(slug: string, locale: Locale): Promise<ArticleData | null> {
    const article = await this.prismaClient.article.findUnique({
      where: { slug }
    });
    
    if (!article) return null;
    
    return this.mapToLocalizedArticle(article, locale);
  }
  
  async create(data: Omit<ArticleData, 'id' | 'createdAt' | 'updatedAt'>, locale?: Locale): Promise<ArticleData> {
    const article = await this.prismaClient.article.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary,
        slug: data.slug,
        categoryId: data.categoryId,
        published: data.published,
        publishedAt: data.publishedAt,
        viewCount: data.viewCount || 0,
        titleTranslations: {},
        contentTranslations: {},
        summaryTranslations: {}
      }
    });
    
    return this.mapToLocalizedArticle(article, locale || 'ja');
  }
  
  async update(id: number, data: Partial<ArticleData>, locale?: Locale): Promise<ArticleData> {
    if (locale && locale !== 'ja') {
      // Update JSON translation columns
      const article = await this.prismaClient.article.findUnique({
        where: { id }
      });
      
      if (!article) throw new Error('Article not found');
      
      const updateData: any = {};
      
      if (data.title) {
        const titleTranslations = article.titleTranslations as TranslationMap || {};
        titleTranslations[locale] = data.title;
        updateData.titleTranslations = titleTranslations;
      }
      
      if (data.content) {
        const contentTranslations = article.contentTranslations as TranslationMap || {};
        contentTranslations[locale] = data.content;
        updateData.contentTranslations = contentTranslations;
      }
      
      if (data.summary) {
        const summaryTranslations = article.summaryTranslations as TranslationMap || {};
        summaryTranslations[locale] = data.summary;
        updateData.summaryTranslations = summaryTranslations;
      }
      
      const updatedArticle = await this.prismaClient.article.update({
        where: { id },
        data: updateData
      });
      
      return this.mapToLocalizedArticle(updatedArticle, locale);
    } else {
      // Update main article fields
      const updatedArticle = await this.prismaClient.article.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          summary: data.summary,
          published: data.published,
          publishedAt: data.publishedAt,
          viewCount: data.viewCount
        }
      });
      
      return this.mapToLocalizedArticle(updatedArticle, locale || 'ja');
    }
  }
  
  async delete(id: number): Promise<void> {
    await this.prismaClient.article.delete({
      where: { id }
    });
  }
  
  private mapToLocalizedArticle(article: any, locale: Locale): ArticleData {
    if (locale === 'ja') {
      // Return Japanese (main) content
      return {
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        slug: article.slug,
        categoryId: article.categoryId,
        published: article.published,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
        locale: 'ja',
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      };
    } else {
      // Get translations from JSON columns
      const titleTranslations = article.titleTranslations as TranslationMap || {};
      const contentTranslations = article.contentTranslations as TranslationMap || {};
      const summaryTranslations = article.summaryTranslations as TranslationMap || {};
      
      return {
        id: article.id,
        title: titleTranslations[locale] || article.title,
        content: contentTranslations[locale] || article.content,
        summary: summaryTranslations[locale] || article.summary,
        slug: article.slug,
        categoryId: article.categoryId,
        published: article.published,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
        locale: locale,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      };
    }
  }
  
  // Additional method to add translation to existing article
  async addTranslation(id: number, locale: Locale, translationData: {
    title?: string;
    content?: string;
    summary?: string;
  }): Promise<ArticleData> {
    const article = await this.prismaClient.article.findUnique({
      where: { id }
    });
    
    if (!article) throw new Error('Article not found');
    
    const updateData: any = {};
    
    if (translationData.title) {
      const titleTranslations = article.titleTranslations as TranslationMap || {};
      titleTranslations[locale] = translationData.title;
      updateData.titleTranslations = titleTranslations;
    }
    
    if (translationData.content) {
      const contentTranslations = article.contentTranslations as TranslationMap || {};
      contentTranslations[locale] = translationData.content;
      updateData.contentTranslations = contentTranslations;
    }
    
    if (translationData.summary) {
      const summaryTranslations = article.summaryTranslations as TranslationMap || {};
      summaryTranslations[locale] = translationData.summary;
      updateData.summaryTranslations = summaryTranslations;
    }
    
    const updatedArticle = await this.prismaClient.article.update({
      where: { id },
      data: updateData
    });
    
    return this.mapToLocalizedArticle(updatedArticle, locale);
  }
  
  // Method to remove translation
  async removeTranslation(id: number, locale: Locale): Promise<ArticleData> {
    const article = await this.prismaClient.article.findUnique({
      where: { id }
    });
    
    if (!article) throw new Error('Article not found');
    
    const titleTranslations = article.titleTranslations as TranslationMap || {};
    const contentTranslations = article.contentTranslations as TranslationMap || {};
    const summaryTranslations = article.summaryTranslations as TranslationMap || {};
    
    delete titleTranslations[locale];
    delete contentTranslations[locale];
    delete summaryTranslations[locale];
    
    const updatedArticle = await this.prismaClient.article.update({
      where: { id },
      data: {
        titleTranslations,
        contentTranslations,
        summaryTranslations
      }
    });
    
    return this.mapToLocalizedArticle(updatedArticle, 'ja');
  }
}