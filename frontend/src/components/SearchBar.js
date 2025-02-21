import React from 'react';

const SearchBar = () => {
  return (
    <div className="relative w-1/2 max-w-2xl">
      <input
        type="search"
        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
        placeholder="Search..."
      />
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
        🔍
      </button>
    </div>
  );
};

export default SearchBar;
