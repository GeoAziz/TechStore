import React from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSort: (sortType: string) => void;
}

export default function SearchBar({ onSearch, onSort }: SearchBarProps) {
  return (
    <div className="flex items-center gap-4 py-4 px-2 bg-glass rounded-xl shadow-neon sticky top-0 z-40">
      <input
        type="text"
        placeholder="🔍 Search products, brands, specs..."
        className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-neon-blue font-space-mono text-lg shadow-neon"
        onChange={e => onSearch(e.target.value)}
        aria-label="Search products"
      />
      <select
        className="px-2 py-2 bg-slate-800 text-white rounded-lg font-space-mono text-base shadow-neon"
        onChange={e => onSort(e.target.value)}
        title="Sort products"
        aria-label="Sort products"
      >
        <option value="latest">🕒 Latest</option>
        <option value="price-asc">⬇️ Price: Low to High</option>
        <option value="price-desc">⬆️ Price: High to Low</option>
        <option value="rating">⭐ Top Rated</option>
      </select>
      <button
        type="button"
        className="px-3 py-2 bg-neon-blue text-black font-bold rounded-xl shadow-neon hover:bg-neon-violet transition-all font-space-mono"
        title="Grid View"
        aria-label="Grid View"
        style={{ fontSize: '1.2rem' }}
        onClick={() => onSort('grid')}
      >
        🟦
      </button>
      <button
        type="button"
        className="px-3 py-2 bg-card text-accent font-bold rounded-xl shadow-neon hover:bg-neon-blue transition-all font-space-mono"
        title="List View"
        aria-label="List View"
        style={{ fontSize: '1.2rem' }}
        onClick={() => onSort('list')}
      >
        📋
      </button>
    </div>
  );
}
