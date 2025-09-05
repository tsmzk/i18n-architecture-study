import { PrismaClient as PrismaClientPattern1 } from '../../node_modules/.prisma/client-pattern1';
import { PrismaClient as PrismaClientPattern2 } from '../../node_modules/.prisma/client-pattern2';
import { PrismaClient as PrismaClientPattern3 } from '../../node_modules/.prisma/client-pattern3';

import { Pattern1ArticleRepository } from '../repositories/pattern1/ArticleRepository';
import { Pattern2ArticleRepository } from '../repositories/pattern2/ArticleRepository';
import { Pattern3ArticleRepository } from '../repositories/pattern3/ArticleRepository';

import { IArticleRepository } from '../repositories/base/BaseRepository';

export const TRANSLATION_PATTERN = process.env.TRANSLATION_PATTERN || 'pattern1';

// Prisma client instances
let prismaPattern1: PrismaClientPattern1;
let prismaPattern2: PrismaClientPattern2;
let prismaPattern3: PrismaClientPattern3;

// Initialize Prisma clients based on pattern
export function initializePrismaClients() {
  switch (TRANSLATION_PATTERN) {
    case 'pattern1':
      prismaPattern1 = new PrismaClientPattern1();
      break;
    case 'pattern2':
      prismaPattern2 = new PrismaClientPattern2();
      break;
    case 'pattern3':
      prismaPattern3 = new PrismaClientPattern3();
      break;
    default:
      throw new Error(`Unknown translation pattern: ${TRANSLATION_PATTERN}`);
  }
}

// Repository factory
export function createArticleRepository(): IArticleRepository {
  switch (TRANSLATION_PATTERN) {
    case 'pattern1':
      if (!prismaPattern1) {
        prismaPattern1 = new PrismaClientPattern1();
      }
      return new Pattern1ArticleRepository(prismaPattern1);
    
    case 'pattern2':
      if (!prismaPattern2) {
        prismaPattern2 = new PrismaClientPattern2();
      }
      return new Pattern2ArticleRepository(prismaPattern2);
    
    case 'pattern3':
      if (!prismaPattern3) {
        prismaPattern3 = new PrismaClientPattern3();
      }
      return new Pattern3ArticleRepository(prismaPattern3);
    
    default:
      throw new Error(`Unknown translation pattern: ${TRANSLATION_PATTERN}`);
  }
}

// Cleanup function for graceful shutdown
export async function disconnectPrismaClients() {
  try {
    if (prismaPattern1) {
      await prismaPattern1.$disconnect();
    }
    if (prismaPattern2) {
      await prismaPattern2.$disconnect();
    }
    if (prismaPattern3) {
      await prismaPattern3.$disconnect();
    }
  } catch (error) {
    console.error('Error disconnecting Prisma clients:', error);
  }
}

// Get current prisma client for direct queries (if needed)
export function getCurrentPrismaClient() {
  switch (TRANSLATION_PATTERN) {
    case 'pattern1':
      return prismaPattern1 || new PrismaClientPattern1();
    case 'pattern2':
      return prismaPattern2 || new PrismaClientPattern2();
    case 'pattern3':
      return prismaPattern3 || new PrismaClientPattern3();
    default:
      throw new Error(`Unknown translation pattern: ${TRANSLATION_PATTERN}`);
  }
}

// Database configuration info
export const getDatabaseInfo = () => ({
  pattern: TRANSLATION_PATTERN,
  description: getPatternDescription(TRANSLATION_PATTERN),
  databaseUrl: getDatabaseUrl(TRANSLATION_PATTERN)
});

function getPatternDescription(pattern: string): string {
  switch (pattern) {
    case 'pattern1':
      return 'Main + Dedicated Translation Tables';
    case 'pattern2':
      return 'Unified Translation Table';
    case 'pattern3':
      return 'JSON Column Management';
    default:
      return 'Unknown Pattern';
  }
}

function getDatabaseUrl(pattern: string): string {
  switch (pattern) {
    case 'pattern1':
      return process.env.DATABASE_URL_PATTERN1 || '';
    case 'pattern2':
      return process.env.DATABASE_URL_PATTERN2 || '';
    case 'pattern3':
      return process.env.DATABASE_URL_PATTERN3 || '';
    default:
      return '';
  }
}