import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  slug: string;
  categoryId: number;
  published: boolean;
  publishedAt: string;
  viewCount: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  locale: string;
}

export const ArticleList: React.FC = () => {
  const { currentLanguage, t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    fetchArticles();
  }, [currentLanguage]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:3001/api/articles?locale=${currentLanguage}&limit=10&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setArticles(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch articles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>{t('loadingArticles')}</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h3>{t('errorLoadingArticles')}</h3>
        <p>{error}</p>
        <button onClick={fetchArticles}>{t('retry')}</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{t('articles')} ({currentLanguage})</h2>
      <p>{t('total')}: {pagination.total} {t('articles')} | {t('page')} {pagination.page} {t('of')} {pagination.totalPages}</p>
      
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {articles.map((article) => (
          <div
            key={article.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#f9f9f9'
            }}
          >
            <h3>{article.title}</h3>
            <p style={{ color: '#666' }}>{article.summary}</p>
            <div style={{ fontSize: '0.9em', color: '#999', marginTop: '0.5rem' }}>
              <span>{t('views')}: {article.viewCount} | </span>
              <span>{t('published')}: {new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={fetchArticles} 
        style={{ 
          marginTop: '2rem', 
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {t('refreshArticles')}
      </button>
    </div>
  );
};