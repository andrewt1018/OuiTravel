import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

const IndexSearchBar = () => {
  return (
    <div className="relative w-1/2 max-w-2xl">
      <input
        type="search"
        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-slate-500"
        placeholder="Search..."
      />

    </div>
  );
};

export default IndexSearchBar;
