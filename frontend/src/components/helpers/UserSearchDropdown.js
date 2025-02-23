import React, { useState, useEffect } from "react";
import axios from "axios";

const UserSearchDropdown = ({ query, setQuery }) => {
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/user/search-users?query=${query}`
        );
        setResults(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
        console.log("wtf");
      }
    };

    const debounceTimeout = setTimeout(fetchUsers, 300); // Debounce API call
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  return (
    showDropdown &&
    results.length > 0 && (
      <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
        {results.map((user) => (
          <button
            key={user._id}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onMouseDown={() => setQuery(user.username)}
          >
            {user.username}
          </button>
        ))}
      </div>
    )
  );
};

export default UserSearchDropdown;
