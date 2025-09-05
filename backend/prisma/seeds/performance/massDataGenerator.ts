import { ArticleFactory } from '../factories/ArticleFactory';
import { CategoryFactory } from '../factories/CategoryFactory';

export interface MassDataConfig {
  categories: number;
  subcategoriesPerCategory: number;
  articles: number;
  translationRate: number;
  locales: string[];
  batchSize: number;
}

export class MassDataGenerator {
  private config: MassDataConfig;
  private prismaClient: any;
  
  constructor(prismaClient: any, config?: Partial<MassDataConfig>) {
    this.prismaClient = prismaClient;
    this.config = {
      categories: 500,
      subcategoriesPerCategory: 4,
      articles: 10000,
      translationRate: 0.7,
      locales: ['en', 'zh-cn', 'zh-tw', 'ko'],
      batchSize: 100,
      ...config
    };
  }
  
  async generateBenchmarkData(): Promise<void> {
    console.log('🚀 Starting mass data generation...');
    console.log('Configuration:', this.config);
    
    try {
      // Clear existing data
      await this.clearData();
      
      // Generate categories
      await this.generateCategories();
      
      // Generate articles
      await this.generateArticles();
      
      // Generate performance-specific test data
      await this.generatePerformanceTestData();
      
      console.log('✅ Mass data generation completed!');
      await this.printDataSummary();
      
    } catch (error) {
      console.error('❌ Error during mass data generation:', error);
      throw error;
    }
  }
  
  private async clearData(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    // Delete in correct order to avoid foreign key constraints
    await this.prismaClient.articleTag?.deleteMany({});
    await this.prismaClient.articleMetadata?.deleteMany({});
    await this.prismaClient.comment?.deleteMany({});
    
    // Delete translations based on pattern
    const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
    switch (pattern) {
      case 'pattern1':
        await this.prismaClient.articleTranslation?.deleteMany({});
        await this.prismaClient.categoryTranslation?.deleteMany({});
        await this.prismaClient.tagTranslation?.deleteMany({});
        await this.prismaClient.commentTranslation?.deleteMany({});
        break;
      case 'pattern2':
        await this.prismaClient.translation?.deleteMany({});
        break;
      // Pattern3 doesn't have separate translation tables
    }
    
    await this.prismaClient.tag?.deleteMany({});
    await this.prismaClient.article?.deleteMany({});
    await this.prismaClient.category?.deleteMany({});
    
    console.log('✅ Data cleared');
  }
  
  private async generateCategories(): Promise<void> {
    console.log(`📁 Generating ${this.config.categories} categories...`);
    
    const categories = CategoryFactory.createHierarchical(this.config.categories / 5, 3);
    const categoriesWithTranslations = CategoryFactory.createWithTranslations(
      categories.length,
      this.config.translationRate,
      this.config.locales
    );
    
    // Insert categories in batches
    for (let i = 0; i < categoriesWithTranslations.length; i += this.config.batchSize) {
      const batch = categoriesWithTranslations.slice(i, i + this.config.batchSize);
      
      for (const categoryData of batch) {
        const { translations, ...categoryCreateData } = categoryData;
        
        const category = await this.prismaClient.category.create({
          data: categoryCreateData
        });
        
        // Add translations if they exist
        if (translations && translations.length > 0) {
          await this.insertCategoryTranslations(category.id, translations);
        }
      }
      
      console.log(`📁 Created ${Math.min(i + this.config.batchSize, categoriesWithTranslations.length)} / ${categoriesWithTranslations.length} categories`);
    }
    
    console.log('✅ Categories generated');
  }
  
  private async generateArticles(): Promise<void> {
    console.log(`📝 Generating ${this.config.articles} articles...`);
    
    // Get category IDs for random assignment
    const categories = await this.prismaClient.category.findMany({
      select: { id: true }
    });
    const categoryIds = categories.map((c: any) => c.id);
    
    ArticleFactory.setCategoryIds(categoryIds);
    
    const articlesWithTranslations = ArticleFactory.createWithTranslations(
      this.config.articles,
      this.config.translationRate,
      this.config.locales
    );
    
    // Insert articles in batches
    for (let i = 0; i < articlesWithTranslations.length; i += this.config.batchSize) {
      const batch = articlesWithTranslations.slice(i, i + this.config.batchSize);
      
      for (const articleData of batch) {
        const { translations, ...articleCreateData } = articleData;
        
        const article = await this.prismaClient.article.create({
          data: articleCreateData
        });
        
        // Add translations if they exist
        if (translations && translations.length > 0) {
          await this.insertArticleTranslations(article.id, translations);
        }
      }
      
      console.log(`📝 Created ${Math.min(i + this.config.batchSize, articlesWithTranslations.length)} / ${articlesWithTranslations.length} articles`);
    }
    
    console.log('✅ Articles generated');
  }
  
  private async generatePerformanceTestData(): Promise<void> {
    console.log('🏃‍♂️ Generating performance-specific test data...');
    
    // Get existing category IDs to avoid foreign key constraint errors
    const categories = await this.prismaClient.category.findMany({
      select: { id: true }
    });
    const categoryIds = categories.map((c: any) => c.id);
    
    if (categoryIds.length === 0) {
      console.log('⚠️ No categories found, skipping performance test data generation');
      return;
    }
    
    // Generate articles with existing category IDs
    const performanceArticles = this.createPerformanceTestDataWithValidCategories(1000, categoryIds);
    const indexTestArticles = this.createIndexTestDataWithValidCategories(categoryIds);
    
    const allTestArticles = [...performanceArticles, ...indexTestArticles];
    
    for (let i = 0; i < allTestArticles.length; i += this.config.batchSize) {
      const batch = allTestArticles.slice(i, i + this.config.batchSize);
      
      await this.prismaClient.article.createMany({
        data: batch
      });
      
      console.log(`🏃‍♂️ Created ${Math.min(i + this.config.batchSize, allTestArticles.length)} / ${allTestArticles.length} test articles`);
    }
    
    console.log('✅ Performance test data generated');
  }
  
  private createPerformanceTestDataWithValidCategories(count: number, categoryIds: number[]): any[] {
    return Array.from({ length: count }, (_, i) => ({
      title: `Performance Test Article ${i + 1}`,
      content: `This is performance test content for article ${i + 1}. `.repeat(100),
      summary: `Performance test summary ${i + 1}`,
      slug: `perf-test-article-${i + 1}`,
      categoryId: categoryIds[i % categoryIds.length], // Use existing category IDs
      published: true,
      publishedAt: new Date(),
      viewCount: i * 10
    }));
  }
  
  private createIndexTestDataWithValidCategories(categoryIds: number[]): any[] {
    const articles: any[] = [];
    
    // Articles with high view counts
    for (let i = 0; i < 100; i++) {
      articles.push({
        title: `High Views Article ${i + 1}`,
        content: `High view count content ${i + 1}`,
        summary: `High view summary ${i + 1}`,
        slug: `high-views-${i + 1}`,
        categoryId: categoryIds[0], // Use first category
        published: true,
        publishedAt: new Date(),
        viewCount: 10000 + i
      });
    }
    
    // Articles with specific publication dates
    const startDate = new Date('2023-01-01');
    for (let i = 0; i < 365; i++) {
      const publishDate = new Date(startDate);
      publishDate.setDate(startDate.getDate() + i);
      
      articles.push({
        title: `Daily Article ${i + 1}`,
        content: `Daily content for ${publishDate.toDateString()}`,
        summary: `Daily summary ${i + 1}`,
        slug: `daily-${i + 1}`,
        categoryId: categoryIds[i % categoryIds.length], // Use existing category IDs
        published: true,
        publishedAt: publishDate,
        viewCount: i
      });
    }
    
    return articles;
  }
  
  private async insertArticleTranslations(articleId: number, translations: any[]): Promise<void> {
    const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
    
    switch (pattern) {
      case 'pattern1':
        for (const translation of translations) {
          await this.prismaClient.articleTranslation.create({
            data: {
              articleId,
              locale: translation.locale.replace('-', '_'), // Convert to enum format
              title: translation.title,
              content: translation.content,
              summary: translation.summary
            }
          });
        }
        break;
        
      case 'pattern2':
        for (const translation of translations) {
          // Insert title
          await this.prismaClient.translation.create({
            data: {
              entityType: 'ARTICLE',
              entityId: articleId,
              locale: translation.locale.replace('-', '_'),
              fieldName: 'title',
              fieldValue: translation.title
            }
          });
          
          // Insert content
          await this.prismaClient.translation.create({
            data: {
              entityType: 'ARTICLE',
              entityId: articleId,
              locale: translation.locale.replace('-', '_'),
              fieldName: 'content',
              fieldValue: translation.content
            }
          });
          
          // Insert summary if exists
          if (translation.summary) {
            await this.prismaClient.translation.create({
              data: {
                entityType: 'ARTICLE',
                entityId: articleId,
                locale: translation.locale.replace('-', '_'),
                fieldName: 'summary',
                fieldValue: translation.summary
              }
            });
          }
        }
        break;
        
      case 'pattern3':
        // Update JSON columns
        const titleTranslations: Record<string, string> = {};
        const contentTranslations: Record<string, string> = {};
        const summaryTranslations: Record<string, string> = {};
        
        for (const translation of translations) {
          titleTranslations[translation.locale] = translation.title;
          contentTranslations[translation.locale] = translation.content;
          if (translation.summary) {
            summaryTranslations[translation.locale] = translation.summary;
          }
        }
        
        await this.prismaClient.article.update({
          where: { id: articleId },
          data: {
            titleTranslations,
            contentTranslations,
            summaryTranslations
          }
        });
        break;
    }
  }
  
  private async insertCategoryTranslations(categoryId: number, translations: any[]): Promise<void> {
    const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
    
    switch (pattern) {
      case 'pattern1':
        for (const translation of translations) {
          await this.prismaClient.categoryTranslation.create({
            data: {
              categoryId,
              locale: translation.locale.replace('-', '_'),
              name: translation.name,
              description: translation.description
            }
          });
        }
        break;
        
      case 'pattern2':
        for (const translation of translations) {
          await this.prismaClient.translation.createMany({
            data: [
              {
                entityType: 'CATEGORY',
                entityId: categoryId,
                locale: translation.locale.replace('-', '_'),
                fieldName: 'name',
                fieldValue: translation.name
              },
              ...(translation.description ? [{
                entityType: 'CATEGORY',
                entityId: categoryId,
                locale: translation.locale.replace('-', '_'),
                fieldName: 'description',
                fieldValue: translation.description
              }] : [])
            ]
          });
        }
        break;
        
      case 'pattern3':
        const nameTranslations: Record<string, string> = {};
        const descriptionTranslations: Record<string, string> = {};
        
        for (const translation of translations) {
          nameTranslations[translation.locale] = translation.name;
          if (translation.description) {
            descriptionTranslations[translation.locale] = translation.description;
          }
        }
        
        await this.prismaClient.category.update({
          where: { id: categoryId },
          data: {
            nameTranslations,
            descriptionTranslations
          }
        });
        break;
    }
  }
  
  private async printDataSummary(): Promise<void> {
    console.log('\n📊 Data Summary:');
    
    const categoriesCount = await this.prismaClient.category.count();
    const articlesCount = await this.prismaClient.article.count();
    
    console.log(`Categories: ${categoriesCount}`);
    console.log(`Articles: ${articlesCount}`);
    
    const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
    console.log(`Translation Pattern: ${pattern}`);
    
    switch (pattern) {
      case 'pattern1':
        const articleTranslations = await this.prismaClient.articleTranslation?.count() || 0;
        const categoryTranslations = await this.prismaClient.categoryTranslation?.count() || 0;
        console.log(`Article Translations: ${articleTranslations}`);
        console.log(`Category Translations: ${categoryTranslations}`);
        break;
        
      case 'pattern2':
        const translations = await this.prismaClient.translation?.count() || 0;
        console.log(`Total Translations: ${translations}`);
        break;
        
      case 'pattern3':
        console.log('Translations stored in JSON columns');
        break;
    }
    
    console.log('');
  }
}