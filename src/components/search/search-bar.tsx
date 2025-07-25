import React from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSort: (sortType: string) => void;
}

export default function SearchBar({ onSearch, onSort }: SearchBarProps) {
  return (
    <div className="flex items-center gap-4 py-4 px-2 bg-glass rounded-xl shadow-neon">
      <input
        type="text"
        placeholder="Search products..."
        className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-neon-blue"
        onChange={e => onSearch(e.target.value)}
      />
      <select
        className="px-2 py-2 bg-slate-800 text-white rounded-lg"
        onChange={e => onSort(e.target.value)}
        title="Sort products" // Added for accessibility
      >
        <option value="latest">Latest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
