import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback(async (term) => {
    if (term.length < 2) { setResults([]); setIsOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(term)}`);
      setResults(res.data || []);
      setIsOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setIsOpen(false); }
  };

  const handleSelect = (result) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/course/${result.id}`);
  };

  return (
    <div className="search-bar" ref={ref}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="search-input"
          aria-label="Buscar cursos"
        />
        {loading && <span className="search-spinner" />}
      </div>
      {isOpen && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-empty">Sin resultados para "{query}"</div>
          ) : (
            results.map(r => (
              <div key={r.id} className="search-result" onClick={() => handleSelect(r)}>
                <div className="search-result-title">{r.title}</div>
                <div className="search-result-desc">{r.description}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
