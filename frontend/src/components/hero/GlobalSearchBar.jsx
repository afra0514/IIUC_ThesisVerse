import React, { useState } from 'react';
import { Search } from 'lucide-react';
import '../../styles/hero/GlobalSearchBar.css';

export default function GlobalSearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form className="global-search-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          className="search-input-field"
          placeholder="Search topics: NLP, IoT, Blockchain, Computer Vision..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </div>
    </form>
  );
}