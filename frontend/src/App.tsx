import { useState, Suspense } from 'react'
import { useTranslation } from './hooks/useTranslation'
import { LanguageSelector } from './components/common/LanguageSelector'
import { ArticleList } from './components/ArticleList'
import './App.css'

function AppContent() {
  const { t, formatNumber, formatCurrency, formatDate } = useTranslation()
  const [count, setCount] = useState(0)
  const [currentView, setCurrentView] = useState('home')

  return (
    <>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <LanguageSelector />
      </div>
      
      <h1>{t('welcome')}</h1>
      
      <nav style={{ marginBottom: '2rem' }}>
        <button 
          style={{ 
            margin: '0 0.5rem', 
            backgroundColor: currentView === 'home' ? '#007bff' : '',
            color: currentView === 'home' ? 'white' : ''
          }}
          onClick={() => setCurrentView('home')}
        >
          {t('home')}
        </button>
        <button 
          style={{ 
            margin: '0 0.5rem',
            backgroundColor: currentView === 'about' ? '#007bff' : '',
            color: currentView === 'about' ? 'white' : ''
          }}
          onClick={() => setCurrentView('about')}
        >
          {t('about')}
        </button>
        <button 
          style={{ 
            margin: '0 0.5rem',
            backgroundColor: currentView === 'products' ? '#007bff' : '',
            color: currentView === 'products' ? 'white' : ''
          }}
          onClick={() => setCurrentView('products')}
        >
          {t('products')}
        </button>
        <button 
          style={{ 
            margin: '0 0.5rem',
            backgroundColor: currentView === 'articles' ? '#007bff' : '',
            color: currentView === 'articles' ? 'white' : ''
          }}
          onClick={() => setCurrentView('articles')}
        >
          {t('articles')}
        </button>
        <button 
          style={{ 
            margin: '0 0.5rem',
            backgroundColor: currentView === 'contact' ? '#007bff' : '',
            color: currentView === 'contact' ? 'white' : ''
          }}
          onClick={() => setCurrentView('contact')}
        >
          {t('contact')}
        </button>
      </nav>

      {currentView === 'home' && (
        <>
          <div className="card">
            <h2>{t('welcomeToI18nStudy')}</h2>
            <p>{t('appDescription')}</p>
            <ul>
              <li><strong>{t('pattern1Description')}</strong></li>
              <li><strong>{t('pattern2Description')}</strong></li>
              <li><strong>{t('pattern3Description')}</strong></li>
            </ul>
            <p>{t('currentlyUsing')}: <strong>Pattern 1</strong></p>
          </div>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              {t('count')}: {formatNumber(count)}
            </button>
          </div>
        </>
      )}

      {currentView === 'about' && (
        <div className="card">
          <h2>{t('about')}</h2>
          <p>{t('aboutDescription')}</p>
          <p>{t('languageSupport')}</p>
        </div>
      )}

      {currentView === 'products' && (
        <div className="card">
          <h2>{t('products')}</h2>
          <p>{t('samplePrice')}: {formatCurrency(1500)}</p>
          <p>{t('sampleNumber')}: {formatNumber(1234567)}</p>
          <p>{t('todayDate')}: {formatDate(new Date())}</p>
          <div style={{ marginTop: '1rem' }}>
            <button style={{ margin: '0 0.5rem' }}>{t('save')}</button>
            <button style={{ margin: '0 0.5rem' }}>{t('cancel')}</button>
            <button style={{ margin: '0 0.5rem' }}>{t('delete')}</button>
          </div>
        </div>
      )}

      {currentView === 'articles' && (
        <ArticleList />
      )}

      {currentView === 'contact' && (
        <div className="card">
          <h2>{t('contact')}</h2>
          <div className="card">
            <input type="text" placeholder={t('search')} style={{ marginRight: '1rem' }} />
            <button>{t('search')}</button>
          </div>
          <p>{t('contactInfo')}</p>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  )
}

export default App
