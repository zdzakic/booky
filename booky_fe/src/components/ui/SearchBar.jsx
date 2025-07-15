// components/ui/SearchBar.jsx
import React from 'react';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = 'Search...',
  className = ''
}) => (
  <div className={`max-w-7xl w-full mx-auto ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={onSearchChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);

export default SearchBar;
