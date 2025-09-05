#!/usr/bin/env ts-node

import { MassDataGenerator } from './performance/massDataGenerator';

// Prisma Client Types (will be generated after migration)
type PrismaClient = any;

function getPrismaClient(): PrismaClient {
  const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
  console.log(`📊 Using translation pattern: ${pattern}`);
  
  try {
    switch (pattern) {
      case 'pattern1':
        const { PrismaClient: PrismaClientPattern1 } = require('../../node_modules/.prisma/client-pattern1');
        return new PrismaClientPattern1();
      
      case 'pattern2':
        const { PrismaClient: PrismaClientPattern2 } = require('../../node_modules/.prisma/client-pattern2');
        return new PrismaClientPattern2();
      
      case 'pattern3':
        const { PrismaClient: PrismaClientPattern3 } = require('../../node_modules/.prisma/client-pattern3');
        return new PrismaClientPattern3();
      
      default:
        throw new Error(`Unknown translation pattern: ${pattern}`);
    }
  } catch (error) {
    console.error(`❌ Error loading Prisma client for pattern ${pattern}:`);
    console.error('Make sure to run the appropriate generate command first:');
    console.error(`  npm run db:generate:${pattern}`);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting database seeding...');
  
  const pattern = process.env.TRANSLATION_PATTERN || 'pattern1';
  console.log(`Using translation pattern: ${pattern}`);
  
  const prisma = getPrismaClient();
  
  try {
    await prisma.$connect();
    console.log('📡 Connected to database');
    
    const args = process.argv.slice(2);
    const seedType = args[0] || 'default';
    
    switch (seedType) {
      case 'small':
        await runSmallSeed(prisma);
        break;
      case 'medium':
        await runMediumSeed(prisma);
        break;
      case 'large':
        await runLargeSeed(prisma);
        break;
      case 'benchmark':
        await runBenchmarkSeed(prisma);
        break;
      case 'test':
        await runTestSeed(prisma);
        break;
      default:
        await runDefaultSeed(prisma);
    }
    
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('📡 Disconnected from database');
  }
}

async function runDefaultSeed(prisma: PrismaClient) {
  console.log('🌱 Running default seed (medium dataset)...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 50,
    articles: 500,
    translationRate: 0.6,
    locales: ['en', 'zh-cn'],
    batchSize: 50
  });
  
  await generator.generateBenchmarkData();
}

async function runSmallSeed(prisma: PrismaClient) {
  console.log('🌱 Running small seed...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 10,
    articles: 50,
    translationRate: 0.8,
    locales: ['en'],
    batchSize: 20
  });
  
  await generator.generateBenchmarkData();
}

async function runMediumSeed(prisma: PrismaClient) {
  console.log('🌱 Running medium seed...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 100,
    articles: 1000,
    translationRate: 0.7,
    locales: ['en', 'zh-cn', 'zh-tw'],
    batchSize: 100
  });
  
  await generator.generateBenchmarkData();
}

async function runLargeSeed(prisma: PrismaClient) {
  console.log('🌱 Running large seed...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 500,
    articles: 5000,
    translationRate: 0.7,
    locales: ['en', 'zh-cn', 'zh-tw', 'ko'],
    batchSize: 100
  });
  
  await generator.generateBenchmarkData();
}

async function runBenchmarkSeed(prisma: PrismaClient) {
  console.log('🌱 Running benchmark seed (maximum data for performance testing)...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 500,
    articles: 10000,
    translationRate: 0.7,
    locales: ['en', 'zh-cn', 'zh-tw', 'ko'],
    batchSize: 200
  });
  
  await generator.generateBenchmarkData();
}

async function runTestSeed(prisma: PrismaClient) {
  console.log('🌱 Running test seed (minimal data for testing)...');
  
  const generator = new MassDataGenerator(prisma, {
    categories: 5,
    articles: 20,
    translationRate: 1.0,
    locales: ['en', 'zh-cn'],
    batchSize: 10
  });
  
  await generator.generateBenchmarkData();
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main as seedDatabase };