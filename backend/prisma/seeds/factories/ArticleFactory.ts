import { faker } from '@faker-js/faker';

export interface ArticleCreateInput {
  title: string;
  content: string;
  summary?: string;
  slug: string;
  categoryId: number;
  published: boolean;
  publishedAt?: Date;
  viewCount: number;
}

export interface ArticleWithTranslationsInput extends ArticleCreateInput {
  translations?: {
    locale: string;
    title: string;
    content: string;
    summary?: string;
  }[];
}

export class ArticleFactory {
  private static categories: number[] = [];
  
  static setCategoryIds(categoryIds: number[]) {
    this.categories = categoryIds;
  }
  
  static create(count: number): ArticleCreateInput[] {
    return Array.from({ length: count }, (_, i) => this.createSingle(i));
  }
  
  static createWithTranslations(
    count: number, 
    translationRate: number = 0.7,
    locales: string[] = ['en', 'zh-cn', 'zh-tw', 'ko']
  ): ArticleWithTranslationsInput[] {
    return Array.from({ length: count }, (_, i) => {
      const article = this.createSingle(i) as ArticleWithTranslationsInput;
      
      // Add translations based on translation rate
      if (Math.random() < translationRate) {
        article.translations = [];
        
        // Randomly decide which locales to include
        const includedLocales = locales.filter(() => Math.random() < 0.6);
        
        for (const locale of includedLocales) {
          article.translations.push(this.createTranslation(article, locale));
        }
      }
      
      return article;
    });
  }
  
  private static createSingle(index: number): ArticleCreateInput {
    const title = faker.lorem.sentence(faker.number.int({ min: 3, max: 8 }));
    const publishedDate = faker.date.between({ 
      from: new Date('2023-01-01'), 
      to: new Date() 
    });
    
    return {
      title,
      content: this.generateContent(),
      summary: faker.lorem.sentences(2),
      slug: this.generateSlug(title, index),
      categoryId: this.getRandomCategoryId(),
      published: Math.random() > 0.2, // 80% published
      publishedAt: publishedDate,
      viewCount: faker.number.int({ min: 0, max: 10000 })
    };
  }
  
  private static generateContent(): string {
    const paragraphs = [];
    const paragraphCount = faker.number.int({ min: 3, max: 12 });
    
    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(faker.lorem.paragraph(faker.number.int({ min: 3, max: 8 })));
    }
    
    return paragraphs.join('\n\n');
  }
  
  private static generateSlug(title: string, index: number): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `${baseSlug}-${index + 1}`;
  }
  
  private static getRandomCategoryId(): number {
    if (this.categories.length === 0) {
      return faker.number.int({ min: 1, max: 10 });
    }
    return faker.helpers.arrayElement(this.categories);
  }
  
  private static createTranslation(article: ArticleCreateInput, locale: string) {
    return {
      locale,
      title: this.getTranslatedTitle(article.title, locale),
      content: this.getTranslatedContent(article.content, locale),
      summary: article.summary ? this.getTranslatedSummary(article.summary, locale) : undefined
    };
  }
  
  private static getTranslatedTitle(originalTitle: string, locale: string): string {
    // Simplified translation simulation
    const prefixes = {
      'en': 'EN: ',
      'zh-cn': '中文：',
      'zh-tw': '繁體：',
      'ko': '한국어: '
    };
    
    return (prefixes as any)[locale] + faker.lorem.sentence(faker.number.int({ min: 3, max: 8 }));
  }
  
  private static getTranslatedContent(originalContent: string, locale: string): string {
    // Generate translated content
    const paragraphs = [];
    const paragraphCount = faker.number.int({ min: 2, max: 6 });
    
    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(`[${locale.toUpperCase()}] ${faker.lorem.paragraph()}`);
    }
    
    return paragraphs.join('\n\n');
  }
  
  private static getTranslatedSummary(originalSummary: string, locale: string): string {
    return `[${locale.toUpperCase()}] ${faker.lorem.sentences(2)}`;
  }
  
  // Performance test specific data
  static createPerformanceTestData(count: number): ArticleCreateInput[] {
    return Array.from({ length: count }, (_, i) => ({
      title: `Performance Test Article ${i + 1}`,
      content: `This is performance test content for article ${i + 1}. `.repeat(100), // Larger content
      summary: `Performance test summary ${i + 1}`,
      slug: `perf-test-article-${i + 1}`,
      categoryId: (i % 10) + 1, // Distribute across 10 categories
      published: true,
      publishedAt: new Date(),
      viewCount: i * 10 // Predictable view counts for sorting tests
    }));
  }
  
  // Create articles with specific patterns for index testing
  static createIndexTestData(): ArticleCreateInput[] {
    const articles: ArticleCreateInput[] = [];
    
    // Articles with high view counts (for view count index testing)
    for (let i = 0; i < 100; i++) {
      articles.push({
        title: `High Views Article ${i + 1}`,
        content: `High view count content ${i + 1}`,
        summary: `High view summary ${i + 1}`,
        slug: `high-views-${i + 1}`,
        categoryId: 1,
        published: true,
        publishedAt: new Date(),
        viewCount: 10000 + i
      });
    }
    
    // Articles with specific publication dates (for date range queries)
    const startDate = new Date('2023-01-01');
    for (let i = 0; i < 365; i++) {
      const publishDate = new Date(startDate);
      publishDate.setDate(startDate.getDate() + i);
      
      articles.push({
        title: `Daily Article ${i + 1}`,
        content: `Daily content for ${publishDate.toDateString()}`,
        summary: `Daily summary ${i + 1}`,
        slug: `daily-${i + 1}`,
        categoryId: (i % 5) + 1,
        published: true,
        publishedAt: publishDate,
        viewCount: i
      });
    }
    
    return articles;
  }
}