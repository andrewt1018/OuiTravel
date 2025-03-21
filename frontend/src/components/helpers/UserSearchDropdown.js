import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from "./user-verification";

const UserSearchDropdown = ({ query, setQuery }) => {
  const navigate = useNavigate(); // Hook for navigation

  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState(""); // Store the current user's username

  // Fetch the logged-in user's data
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const user = await getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        setLoggedInUsername(user.username); // Set the username in state
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    };
    verifyUser();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/user/search-users?query=${query}&exclude=${loggedInUsername}`
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
  }, [query, loggedInUsername]);

  // Function to handle when a user is selected
  const handleSelect = (username) => {
    setQuery(username); // Update the search bar with selected username
    navigate(`/profile/${username}`); // Navigate to profile
    setShowDropdown(false); // Hide dropdown after selection
  };

  return (
    showDropdown && (
      <div className="relative w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
        {results.length > 0 ? (
          results.map((user) => (
            <button
              key={user._id}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onMouseDown={() => handleSelect(user.username)}
            >
              {user.username}
            </button>
          ))
        ) : results.length === 0 && query.length > 0 ? (
          <div className="w-full text-center px-4 py-2 text-gray-500">
            No users found
          </div>
        ) : null}
      </div>
    )
  );
};

export default UserSearchDropdown;
