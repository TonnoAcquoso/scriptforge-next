import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/SearchWeb.module.css';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);

  const resultsPerPage = 10;

  useEffect(() => {
    const stored = localStorage.getItem('recentQueries');
    if (stored) {
      setRecentQueries(JSON.parse(stored));
    }
  }, []);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${(page - 1) * resultsPerPage + 1}`);
      const data = await res.json();
      setResults(prev => [...prev, ...(data.items || [])]);
      setTotalResults(parseInt(data.searchInformation?.totalResults || '0'));
    } catch (err) {
      console.error('Errore nella ricerca:', err);
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => {
    if (query.trim()) {
      fetchResults();
    }
  }, [fetchResults]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults([]);
    setPage(1);
    const updated = [query, ...recentQueries.filter((q) => q !== query)].slice(0, 5);
    setRecentQueries(updated);
    localStorage.setItem('recentQueries', JSON.stringify(updated));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && results.length < totalResults) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [results, loading, totalResults]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🔍 Ricerca Web Intelligente</h1>

      <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Cerca qualcosa..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          <Search size={20} />
        </button>
      </div>

      {loading && page === 1 && <p className={styles.loading}>Caricamento...</p>}

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <div className={styles.results}>
            {results.map((item, index) => (
              <motion.div
                key={index}
                className={styles.resultCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
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
              </motion.div>
            ))}
          </div>

          {loading && page > 1 && (
            <p className={styles.loading}>Caricamento altri risultati...</p>
          )}
          <div ref={observerRef} className={styles.scrollAnchor} />
        </div>

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
                      setResults([]);
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