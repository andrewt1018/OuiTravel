import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import UserSearchDropdown from "./UserSearchDropdown";

const IndexSearchBar = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-1/2 max-w-2xl">
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
        <SearchIcon className="text-gray-500" />
        <input
          type="search"
          className="w-full px-2 py-1 focus:outline-none"
          placeholder="Search!"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <UserSearchDropdown query={query} setQuery={setQuery} />
    </div>
  );
};

export default IndexSearchBar;
