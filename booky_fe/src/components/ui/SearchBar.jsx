// components/ui/SearchBar.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = 'Search...',
  className = '',
  isSearching = false
}) => (
  <div className={`relative w-full ${className}`}>
    <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={onSearchChange}
        className="
            w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 pr-10
            bg-neutral-white border-neutral-light
            focus:ring-primary
            text-neutral-dark
            placeholder-neutral-medium
            dark:bg-neutral-dark
            dark:border-neutral-darker
            dark:placeholder-neutral-light
            dark:text-neutral-lightest
        "
    />

    {isSearching && (
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Loader2 className="h-5 w-5 text-neutral-dark dark:text-neutral-light animate-spin" />
      </div>
    )}
  </div>
);

export default SearchBar;
