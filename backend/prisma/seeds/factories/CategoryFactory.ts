import { faker } from '@faker-js/faker';

export interface CategoryCreateInput {
  name: string;
  description?: string;
  slug: string;
  parentId?: number;
  displayOrder: number;
}

export interface CategoryWithTranslationsInput extends CategoryCreateInput {
  translations?: {
    locale: string;
    name: string;
    description?: string;
  }[];
}

export class CategoryFactory {
  static create(count: number): CategoryCreateInput[] {
    return Array.from({ length: count }, (_, i) => this.createSingle(i));
  }
  
  static createWithTranslations(
    count: number,
    translationRate: number = 0.8,
    locales: string[] = ['en', 'zh-cn', 'zh-tw', 'ko']
  ): CategoryWithTranslationsInput[] {
    return Array.from({ length: count }, (_, i) => {
      const category = this.createSingle(i) as CategoryWithTranslationsInput;
      
      if (Math.random() < translationRate) {
        category.translations = [];
        
        const includedLocales = locales.filter(() => Math.random() < 0.7);
        
        for (const locale of includedLocales) {
          category.translations.push(this.createTranslation(category, locale));
        }
      }
      
      return category;
    });
  }
  
  static createHierarchical(topLevelCount: number, maxDepth: number = 2): CategoryCreateInput[] {
    const categories: CategoryCreateInput[] = [];
    let currentOrder = 0;
    
    // Create top-level categories
    for (let i = 0; i < topLevelCount; i++) {
      const topLevel = this.createSingle(i, undefined, currentOrder++);
      categories.push(topLevel);
      
      // Create subcategories
      const subCategoryCount = faker.number.int({ min: 2, max: 5 });
      for (let j = 0; j < subCategoryCount && maxDepth > 1; j++) {
        const subCategory = this.createSingle(
          i * 100 + j,
          i + 1, // parentId (assuming 1-based IDs)
          currentOrder++
        );
        categories.push(subCategory);
        
        // Create sub-subcategories
        if (maxDepth > 2) {
          const subSubCategoryCount = faker.number.int({ min: 0, max: 3 });
          for (let k = 0; k < subSubCategoryCount; k++) {
            const subSubCategory = this.createSingle(
              i * 10000 + j * 100 + k,
              categories.length, // Current subcategory ID
              currentOrder++
            );
            categories.push(subSubCategory);
          }
        }
      }
    }
    
    return categories;
  }
  
  private static createSingle(
    index: number, 
    parentId?: number,
    displayOrder: number = index
  ): CategoryCreateInput {
    const name = this.generateCategoryName(index, parentId !== undefined);
    
    return {
      name,
      description: faker.lorem.sentence(faker.number.int({ min: 5, max: 15 })),
      slug: this.generateSlug(name, index),
      parentId,
      displayOrder
    };
  }
  
  private static generateCategoryName(index: number, isSubCategory: boolean): string {
    const mainCategories = [
      'Technology', 'Business', 'Science', 'Health', 'Education',
      'Entertainment', 'Sports', 'Travel', 'Food', 'Fashion',
      'Art', 'Music', 'Politics', 'Environment', 'Finance'
    ];
    
    const subCategories = [
      'Web Development', 'Mobile Apps', 'AI & ML', 'Cybersecurity',
      'Marketing', 'Management', 'Startups', 'E-commerce',
      'Physics', 'Chemistry', 'Biology', 'Medicine',
      'Fitness', 'Nutrition', 'Mental Health', 'Research'
    ];
    
    if (isSubCategory) {
      return faker.helpers.arrayElement(subCategories);
    } else {
      return faker.helpers.arrayElement(mainCategories);
    }
  }
  
  private static generateSlug(name: string, index: number): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `${baseSlug}-${index + 1}`;
  }
  
  private static createTranslation(category: CategoryCreateInput, locale: string) {
    return {
      locale,
      name: this.getTranslatedName(category.name, locale),
      description: category.description ? this.getTranslatedDescription(category.description, locale) : undefined
    };
  }
  
  private static getTranslatedName(originalName: string, locale: string): string {
    const translations: Record<string, Record<string, string>> = {
      'Technology': {
        'en': 'Technology',
        'zh-cn': '技术',
        'zh-tw': '技術',
        'ko': '기술'
      },
      'Business': {
        'en': 'Business',
        'zh-cn': '商业',
        'zh-tw': '商業',
        'ko': '비즈니스'
      },
      'Science': {
        'en': 'Science',
        'zh-cn': '科学',
        'zh-tw': '科學',
        'ko': '과학'
      },
      'Health': {
        'en': 'Health',
        'zh-cn': '健康',
        'zh-tw': '健康',
        'ko': '건강'
      }
    };
    
    return translations[originalName]?.[locale] || `[${locale.toUpperCase()}] ${originalName}`;
  }
  
  private static getTranslatedDescription(originalDescription: string, locale: string): string {
    return `[${locale.toUpperCase()}] ${faker.lorem.sentence()}`;
  }
  
  // Create categories optimized for performance testing
  static createPerformanceTestData(): CategoryCreateInput[] {
    const categories: CategoryCreateInput[] = [];
    
    // Create 50 top-level categories
    for (let i = 0; i < 50; i++) {
      categories.push({
        name: `Performance Category ${i + 1}`,
        description: `Performance test description ${i + 1}`,
        slug: `perf-cat-${i + 1}`,
        parentId: undefined,
        displayOrder: i
      });
      
      // Add 10 subcategories for each top-level category
      for (let j = 0; j < 10; j++) {
        categories.push({
          name: `Performance Subcategory ${i + 1}-${j + 1}`,
          description: `Performance test subdescription ${i + 1}-${j + 1}`,
          slug: `perf-subcat-${i + 1}-${j + 1}`,
          parentId: i + 1, // Reference to parent (1-based)
          displayOrder: j
        });
      }
    }
    
    return categories;
  }
}