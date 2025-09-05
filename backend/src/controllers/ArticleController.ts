import { Request, Response } from 'express';
import { ArticleService } from '../services/ArticleService';
import { createArticleRepository } from '../config/database';
import { Locale, PaginationParams } from '../types/common';

export class ArticleController {
  private articleService: ArticleService;
  
  constructor() {
    const articleRepository = createArticleRepository();
    this.articleService = new ArticleService(articleRepository);
  }
  
  // GET /api/articles
  getArticles = async (req: Request, res: Response) => {
    try {
      const locale = req.locale as Locale;
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await this.articleService.getArticles(locale, params);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        },
        locale
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles',
        locale: req.locale
      });
    }
  };
  
  // GET /api/articles/:id
  getArticleById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const locale = req.locale as Locale;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid article ID',
          locale
        });
      }
      
      const article = await this.articleService.getArticleById(id, locale);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          locale
        });
      }
      
      res.json({
        success: true,
        data: article,
        locale
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article',
        locale: req.locale
      });
    }
  };
  
  // GET /api/articles/slug/:slug
  getArticleBySlug = async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const locale = req.locale as Locale;
      
      const article = await this.articleService.getArticleBySlug(slug, locale);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          locale
        });
      }
      
      res.json({
        success: true,
        data: article,
        locale
      });
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article',
        locale: req.locale
      });
    }
  };
  
  // GET /api/articles/popular
  getPopularArticles = async (req: Request, res: Response) => {
    try {
      const locale = req.locale as Locale;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const articles = await this.articleService.getPopularArticles(locale, limit);
      
      res.json({
        success: true,
        data: articles,
        locale
      });
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular articles',
        locale: req.locale
      });
    }
  };
  
  // GET /api/articles/search
  searchArticles = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const locale = req.locale as Locale;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          locale
        });
      }
      
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };
      
      const result = await this.articleService.searchArticles(query, locale, params);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        },
        query,
        locale
      });
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search articles',
        locale: req.locale
      });
    }
  };
  
  // POST /api/articles
  createArticle = async (req: Request, res: Response) => {
    try {
      const locale = req.locale as Locale;
      const articleData = req.body;
      
      // Basic validation
      if (!articleData.title || !articleData.content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required',
          locale
        });
      }
      
      const article = await this.articleService.createArticle(articleData, locale);
      
      res.status(201).json({
        success: true,
        data: article,
        locale
      });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create article',
        locale: req.locale
      });
    }
  };
  
  // PUT /api/articles/:id
  updateArticle = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const locale = req.locale as Locale;
      const updateData = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid article ID',
          locale
        });
      }
      
      const article = await this.articleService.updateArticle(id, updateData, locale);
      
      res.json({
        success: true,
        data: article,
        locale
      });
    } catch (error) {
      console.error('Error updating article:', error);
      
      if ((error as Error).message === 'Article not found') {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          locale: req.locale
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update article',
        locale: req.locale
      });
    }
  };
  
  // DELETE /api/articles/:id
  deleteArticle = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const locale = req.locale as Locale;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid article ID',
          locale
        });
      }
      
      await this.articleService.deleteArticle(id);
      
      res.json({
        success: true,
        message: 'Article deleted successfully',
        locale
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      
      if ((error as Error).message === 'Article not found') {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          locale: req.locale
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete article',
        locale: req.locale
      });
    }
  };
}