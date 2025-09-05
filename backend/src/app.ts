import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import detectPort from 'detect-port';
import { localeMiddleware } from './middleware/locale';
import { ArticleController } from './controllers/ArticleController';
import { getDatabaseInfo, disconnectPrismaClients } from './config/database';

dotenv.config();

const app: Express = express();
const preferredPort = parseInt(process.env.PORT || '4001', 10);


// Middleware
app.use(cors({
  origin: ['http://localhost:5180', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(localeMiddleware);

console.log('✅ All middleware enabled');

// Initialize controllers
console.log('🔧 Creating ArticleController...');
let articleController: ArticleController;
try {
  articleController = new ArticleController();
  console.log('✅ ArticleController created successfully');
} catch (error) {
  console.error('❌ ArticleController creation failed:', error);
  throw error;
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const dbInfo = getDatabaseInfo();
  res.json({ 
    status: 'ok', 
    locale: req.locale,
    timestamp: new Date().toISOString(),
    database: dbInfo
  });
});

// System info endpoint
app.get('/api/system', (req: Request, res: Response) => {
  const dbInfo = getDatabaseInfo();
  res.json({
    success: true,
    data: {
      pattern: dbInfo.pattern,
      description: dbInfo.description,
      supportedLocales: ['ja', 'en', 'zh-cn', 'zh-tw', 'ko'],
      currentLocale: req.locale
    },
    locale: req.locale
  });
});

// Simple test route
app.get('/test', (req: Request, res: Response) => {
  console.log('🧪 Test route accessed');
  res.json({ message: 'Test route works!' });
});

// Article routes (specific routes first, then parameterized)
app.get('/api/articles/popular', articleController.getPopularArticles);
app.get('/api/articles/search', articleController.searchArticles);
app.get('/api/articles/slug/:slug', articleController.getArticleBySlug);
app.get('/api/articles/:id', articleController.getArticleById);
app.get('/api/articles', articleController.getArticles);
app.post('/api/articles', articleController.createArticle);
app.put('/api/articles/:id', articleController.updateArticle);
app.delete('/api/articles/:id', articleController.deleteArticle);

// Legacy sample endpoints (for backward compatibility)
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const sampleProducts = [
      {
        id: 1,
        name: req.locale === 'ja' ? 'サンプル製品1' : 'Sample Product 1',
        description: req.locale === 'ja' ? '高品質な製品です' : 'High quality product',
        price: 1500,
        locale: req.locale
      },
      {
        id: 2,
        name: req.locale === 'ja' ? 'サンプル製品2' : 'Sample Product 2',
        description: req.locale === 'ja' ? '人気の製品です' : 'Popular product',
        price: 2500,
        locale: req.locale
      }
    ];
    
    res.json({
      success: true,
      data: sampleProducts,
      locale: req.locale,
      total: 2
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      locale: req.locale 
    });
  }
});

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const sampleCategories = [
      {
        id: 1,
        name: req.locale === 'ja' ? 'テクノロジー' : 'Technology',
        description: req.locale === 'ja' ? '技術関連の記事' : 'Technology related articles',
        locale: req.locale
      },
      {
        id: 2,
        name: req.locale === 'ja' ? 'ビジネス' : 'Business',
        description: req.locale === 'ja' ? 'ビジネス関連の記事' : 'Business related articles',
        locale: req.locale
      }
    ];
    
    res.json({
      success: true,
      data: sampleCategories,
      locale: req.locale,
      total: 2
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      locale: req.locale 
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    locale: req.locale 
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    locale: req.locale
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await disconnectPrismaClients();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await disconnectPrismaClients();
  process.exit(0);
});

// Start server with automatic port detection
(async () => {
  try {
    const port = await detectPort(preferredPort);
    
    if (port !== preferredPort) {
      console.log(`⚠️  Port ${preferredPort} is in use, using port ${port} instead`);
    }
    
    app.listen(port, () => {
      const dbInfo = getDatabaseInfo();
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
      console.log(`📍[server]: Health check at http://localhost:${port}/health`);
      console.log(`🌐[server]: Multi-language support enabled`);
      console.log(`💾[server]: Using translation pattern: ${dbInfo.pattern} (${dbInfo.description})`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();