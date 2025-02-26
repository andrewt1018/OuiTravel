import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserSearchDropdown = ({ query, setQuery }) => {
  const navigate = useNavigate(); // Hook for navigation

  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState(""); // Store the current user's username

  // Fetch the logged-in user's data
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/user/get-user",
          {
            headers: {
              "x-access-token": localStorage.getItem("token"), // Get token from local storage
            },
          }
        );
        setLoggedInUsername(response.data.user.username); // Set the username in state
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
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
    showDropdown &&
    results.length > 0 && (
      <div className="relative w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
        {results.map((user) => (
          <button
            key={user._id}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onMouseDown={() => handleSelect(user.username)}
          >
            {user.username}
          </button>
        ))}
      </div>
    )
  );
};

export default UserSearchDropdown;
