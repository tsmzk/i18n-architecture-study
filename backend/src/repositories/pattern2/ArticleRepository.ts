import { BaseRepository, IArticleRepository, ArticleData } from '../base/BaseRepository';
import { Locale, PaginationParams, PaginationResult } from '../../types/common';

export class Pattern2ArticleRepository extends BaseRepository implements IArticleRepository {
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
        include: {
          translations: locale === 'ja' ? false : {
            where: { 
              locale: locale,
              entityType: 'ARTICLE'
            }
          }
        },
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
      where: { id },
      include: {
        translations: locale === 'ja' ? false : {
          where: { 
            locale: locale,
            entityType: 'ARTICLE'
          }
        }
      }
    });
    
    if (!article) return null;
    
    return this.mapToLocalizedArticle(article, locale);
  }
  
  async findBySlug(slug: string, locale: Locale): Promise<ArticleData | null> {
    const article = await this.prismaClient.article.findUnique({
      where: { slug },
      include: {
        translations: locale === 'ja' ? false : {
          where: { 
            locale: locale,
            entityType: 'ARTICLE'
          }
        }
      }
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
        viewCount: data.viewCount || 0
      }
    });
    
    return this.mapToLocalizedArticle(article, locale || 'ja');
  }
  
  async update(id: number, data: Partial<ArticleData>, locale?: Locale): Promise<ArticleData> {
    if (locale && locale !== 'ja') {
      // Update translations using unified translation table
      const translationUpdates = [];
      
      if (data.title) {
        translationUpdates.push(
          this.prismaClient.translation.upsert({
            where: {
              entityType_entityId_locale_fieldName: {
                entityType: 'ARTICLE',
                entityId: id,
                locale: locale,
                fieldName: 'title'
              }
            },
            create: {
              entityType: 'ARTICLE',
              entityId: id,
              locale: locale,
              fieldName: 'title',
              fieldValue: data.title
            },
            update: {
              fieldValue: data.title
            }
          })
        );
      }
      
      if (data.content) {
        translationUpdates.push(
          this.prismaClient.translation.upsert({
            where: {
              entityType_entityId_locale_fieldName: {
                entityType: 'ARTICLE',
                entityId: id,
                locale: locale,
                fieldName: 'content'
              }
            },
            create: {
              entityType: 'ARTICLE',
              entityId: id,
              locale: locale,
              fieldName: 'content',
              fieldValue: data.content
            },
            update: {
              fieldValue: data.content
            }
          })
        );
      }
      
      if (data.summary) {
        translationUpdates.push(
          this.prismaClient.translation.upsert({
            where: {
              entityType_entityId_locale_fieldName: {
                entityType: 'ARTICLE',
                entityId: id,
                locale: locale,
                fieldName: 'summary'
              }
            },
            create: {
              entityType: 'ARTICLE',
              entityId: id,
              locale: locale,
              fieldName: 'summary',
              fieldValue: data.summary
            },
            update: {
              fieldValue: data.summary
            }
          })
        );
      }
      
      await Promise.all(translationUpdates);
      
      const article = await this.findById(id, locale);
      if (!article) throw new Error('Article not found');
      return article;
    } else {
      // Update main article
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
    // Delete translations first (should cascade automatically)
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
      // Get translations from unified translation table
      const translations = article.translations || [];
      const titleTranslation = translations.find((t: any) => t.fieldName === 'title');
      const contentTranslation = translations.find((t: any) => t.fieldName === 'content');
      const summaryTranslation = translations.find((t: any) => t.fieldName === 'summary');
      
      return {
        id: article.id,
        title: titleTranslation?.fieldValue || article.title,
        content: contentTranslation?.fieldValue || article.content,
        summary: summaryTranslation?.fieldValue || article.summary,
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
}