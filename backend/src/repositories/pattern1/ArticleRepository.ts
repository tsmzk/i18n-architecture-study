import { BaseRepository, IArticleRepository, ArticleData } from '../base/BaseRepository';
import { Locale, PaginationParams, PaginationResult, toPrismaLocale } from '../../types/common';

export class Pattern1ArticleRepository extends BaseRepository implements IArticleRepository {
  protected prismaClient: any;
  
  constructor(prismaClient: any) {
    super();
    this.prismaClient = prismaClient;
  }
  
  async findMany(locale: Locale, params?: PaginationParams): Promise<PaginationResult<ArticleData>> {
    const paginationQuery = this.buildPaginationQuery(params || {});
    const prismaLocale = toPrismaLocale(locale);
    
    const [articles, total] = await Promise.all([
      this.prismaClient.article.findMany({
        ...paginationQuery,
        include: {
          translations: locale === 'ja' ? false : {
            where: { locale: prismaLocale }
          },
          category: {
            include: {
              translations: locale === 'ja' ? false : {
                where: { locale: prismaLocale }
              }
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
    const prismaLocale = toPrismaLocale(locale);
    const article = await this.prismaClient.article.findUnique({
      where: { id },
      include: {
        translations: locale === 'ja' ? false : {
          where: { locale: prismaLocale }
        },
        category: {
          include: {
            translations: locale === 'ja' ? false : {
              where: { locale: prismaLocale }
            }
          }
        }
      }
    });
    
    if (!article) return null;
    
    return this.mapToLocalizedArticle(article, locale);
  }
  
  async findBySlug(slug: string, locale: Locale): Promise<ArticleData | null> {
    const prismaLocale = toPrismaLocale(locale);
    const article = await this.prismaClient.article.findUnique({
      where: { slug },
      include: {
        translations: locale === 'ja' ? false : {
          where: { locale: prismaLocale }
        },
        category: {
          include: {
            translations: locale === 'ja' ? false : {
              where: { locale: prismaLocale }
            }
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
      // Update translation if locale is not Japanese
      const prismaLocale = toPrismaLocale(locale);
      await this.prismaClient.articleTranslation.upsert({
        where: {
          articleId_locale: {
            articleId: id,
            locale: prismaLocale
          }
        },
        create: {
          articleId: id,
          locale: prismaLocale,
          title: data.title || '',
          content: data.content || '',
          summary: data.summary
        },
        update: {
          title: data.title,
          content: data.content,
          summary: data.summary
        }
      });
      
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
      // Return translated content if available, fallback to Japanese
      const translation = article.translations?.[0];
      
      return {
        id: article.id,
        title: translation?.title || article.title,
        content: translation?.content || article.content,
        summary: translation?.summary || article.summary,
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