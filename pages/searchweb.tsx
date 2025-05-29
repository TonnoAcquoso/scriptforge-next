import { useState, useEffect } from 'react';
import styles from '../styles/SearchWeb.module.css';
import { Search, BadgeCheck } from 'lucide-react';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

export default function SearchWeb() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'news' | 'forum'>('all');
  const trustedDomains = ['wikipedia.org', 'onepiece.fandom.com', 'youtube.com'];
  const newsDomains = ['ansa.it', 'nytimes.com', 'bbc.com', 'repubblica.it', 'cnn.com'];
  const forumDomains = ['reddit.com', 'quora.com', 'stackexchange.com', 'stackoverflow.com'];
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'video' | 'image' | 'news'>('all');
  const videoDomains = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
  const imageDomains = ['unsplash.com', 'pixabay.com', 'pexels.com'];
  

  const resultsPerPage = 10;


  useEffect(() => {
    if (query.trim()) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
  const stored = localStorage.getItem('recentQueries');
  if (stored) {
    setRecentQueries(JSON.parse(stored));
  }
}, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${(page - 1) * resultsPerPage + 1}`);
      const data = await res.json();
      setResults(data.items || []);
      setTotalResults(parseInt(data.searchInformation?.totalResults || '0'));
    } catch (err) {
      console.error('Errore nella ricerca:', err);
    }

    setRecentQueries((prev) => {
  const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
  localStorage.setItem('recentQueries', JSON.stringify(updated));
  return updated;
});
    setLoading(false);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    setPage((prev) => Math.max(1, direction === 'next' ? prev + 1 : prev - 1));
  };

  const filteredResults = results.filter((item) => {
  if (!item.displayLink) return false;

  const domain = item.displayLink;

  // 🔎 Filtro tab attivo
  if (selectedTab === 'video' && !videoDomains.includes(domain)) return false;
  if (selectedTab === 'image' && !imageDomains.includes(domain)) return false;
  if (selectedTab === 'news' && !newsDomains.includes(domain)) return false;

  // ✅ Filtro verifica (dalla barra dei filtri)
  if (selectedFilter === 'verified' && !trustedDomains.includes(domain)) return false;
  if (selectedFilter === 'news' && !newsDomains.includes(domain)) return false;
  if (selectedFilter === 'forum' && !forumDomains.includes(domain)) return false;

  return true;
});

  return (
  <div className={styles.container}>
    <h1 className={styles.title}>🔍 Ricerca Web Intelligente</h1>

    {/* 🔍 Barra di ricerca */}
    <div className={styles.searchBarContainer}>
      <input
        type="text"
        placeholder="Cerca qualcosa..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        className={styles.searchInput}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        <Search size={20} />
      </button>
    </div>

    {loading && <p className={styles.loading}>Caricamento...</p>}

    {/* 📐 Layout a due colonne: risultati + sidebar */}
    <div className={styles.layout}>
      {/* 📄 Colonna principale: risultati */}
      <div className={styles.mainColumn}>
        <div className={styles.results}>
          {results.map((item, index) => (
            <div key={index} className={styles.resultCard}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resultTitle}
              >
                {item.title}
              </a>
              <p className={styles.resultSnippet}>{item.snippet}</p>
              {item.displayLink && (
                <p className={styles.resultSource}>
                  <img
                    src={`https://${item.displayLink}/favicon.ico`}
                    alt={`${item.displayLink} icon`}
                    className={styles.favicon}
                  />
                  {item.displayLink}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 🔁 Paginazione */}
        {results.length > 0 && (
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange('prev')} disabled={page === 1}>
              ← Precedente
            </button>
            <span>Pagina {page}</span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={page * resultsPerPage >= totalResults}
            >
              Successiva →
            </button>
          </div>
        )}
      </div>

      {/* 📦 Sidebar: ricerche recenti */}
      <aside className={styles.sidebar}>
        {recentQueries.length > 0 && (
          <div className={styles.recentSearches}>
            <p className={styles.recentTitle}>🔁 Ricerche recenti</p>
            <div className={styles.recentList}>
              {recentQueries.map((q, i) => (
                <button
                  key={i}
                  className={styles.recentButton}
                  onClick={() => {
                    setQuery(q);
                    setPage(1);
                    handleSearch();
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  </div>
);
}