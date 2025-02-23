import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/general.css";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";

export default function UserProfile() {
  const { username } = useParams(); // Get username from URL
  const [userData, setUserData] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef(null);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // backend not implemented
  };

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/profile/${username}`
        );
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    fetchUserProfile();
  }, [username]);

  return (
    <div className="min-h-screen bg-[#f7fbfc] text-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-96 bg-gradient-to-r from-blue-100 to-indigo-100 p-8 flex items-center gap-8 shadow-md">
        {/* Profile Picture */}
        <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-gray-500 text-lg">Profile</span>
        </div>
        {/* User Info */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-5xl font-bold pb-4">{userData.fullName}</h1>
          <p className="text-2xl text-gray-700">@{userData.username}</p>
          <p className="mt-3 text-lg text-gray-600 max-w-lg leading-relaxed">
            {userData.bio}
          </p>
          {/* Followers & Following */}
          <div className="flex gap-6 mt-4 text-lg text-gray-600">
            <div className="flex items-center gap-2">
              <strong className="text-gray-900">
                {userData.followerCount}
              </strong>
              <span>Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <strong className="text-gray-900">
                {userData.followingCount}
              </strong>
              <span>Following</span>
            </div>

            <button
              className="mt-2 px-3 py-1 text-lg text-gray-600 border border-gray-400 rounded-md hover:bg-gray-100 transition"
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 p-8 gap-8">
        {/* Left Content */}
        <div className="w-3/5">
          <h2 className="text-xl font-semibold mb-3">User's Content</h2>
          {/* Add user-specific posts or activities here */}
        </div>
      </div>
    </div>
  );
}
