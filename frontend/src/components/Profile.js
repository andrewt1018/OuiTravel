//DON"T USE THIS ANYMORE

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "./helpers/user-verification";
import axios from "axios";
import "./styles/general.css";
import {
  FormGroup,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from "@mui/material";

export default function UserProfile() {
  const [userData, setUserData] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/settings");
  };

  const [isPrivate, setIsPrivate] = useState(true);

  const handleChange = async (event) => {
    try {
      const newVisibility = event.target.checked ? "Private" : "Public";
      setIsPrivate(event.target.checked); // Update state before API call

      const userToken = localStorage.getItem("token");
      console.log("User token:", userToken);
      console.log("new visibility is ", newVisibility);

      await axios.post(
        "http://localhost:3001/api/user/update-visibility",
        { visibility: newVisibility },
        { headers: { "x-access-token": userToken } }
      );

      console.log("Visibility updated successfully");
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Add event listener when the menu is open
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener when the component unmounts or the menu closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    /** Verify user first */
    const verifyUser = async () => {
      const user = await getUser();
      if (!user) {
        alert("User not logged in!");
        navigate("/login");
        return;
      }
      try {
        setUserData(user);
        if (user.visibility === "Public") {
          setIsPrivate(false);
        } else if (user.visibility === "Private") {
          setIsPrivate(true);
        }
        if (user.profilePic) {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
              `http://localhost:3001/api/upload/get-image?id=${user.profilePic}`,
              {
                headers: { "x-access-token": token },
              }
            );
            if (response.data && response.data.imageUrl) {
              setProfilePic(response.data.imageUrl);
            }
          } catch (error) {
            console.error("Error fetching profile image:", error);
          }
        }
      } catch (error) {
        alert("User not logged in!");
        navigate("/login");
        return;
      }
    };
    verifyUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7fbfc] text-gray-900 flex flex-col">
      {/* Header */}
      <div>
        <div className="bg-gradient-to-b from-blue-100"></div>
        <div className="h-96 bg-gradient-to-r from-blue-100 to-indigo-100 p-8 flex items-center gap-8 shadow-md">
          {/* Profile Picture */}
          <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
            {profilePic ? (
              <img
                className="h-48 w-48 object-cover rounded-full"
                src={profilePic}
                alt="Profile Avatar"
              />
            ) : (
              <img
                className="h-48 w-48 object-contain rounded-full"
                src={"/default-avatar.png"}
                alt="Profile Avatar"
              />
            )}

            {/* <img 
              className="h-48 w-48 object-cover rounded-full"
              src={profilePic || "/selena.jpg"}
            /> */}
          </div>
          {/* User Info */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-5xl font-bold pb-4">
              {userData.firstName} {userData.lastName}
            </h1>
            <p className="text-2xl text-gray-700">@{userData.username}</p>
            {/* Bio Section */}
            <p className="mt-3 text-lg text-gray-600 max-w-lg leading-relaxed">
              {userData.bio}
              {/* Har har har i love to travel 🌍 | I love to eat ☕ | Great coding project here 💻 */}
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
            </div>
          </div>
          {/* Options Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 text-3xl px-4 py-2 rounded-full hover:bg-gray-200 relative"
          >
            ⋮
          </button>
          {/* Popup Menu */}
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute top-20 right-10 bg-white shadow-lg rounded-lg p-3 w-56"
            >
              <button
                className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
              <button className="block w-full text-left p-2 hover:bg-gray-100 rounded">
                View Profile as Public
              </button>
              <FormGroup>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Public
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch checked={isPrivate} onChange={handleChange} />
                    }
                    label="Private"
                    labelPlacement="end"
                  />
                </Box>
              </FormGroup>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 p-8 gap-8">
        {/* Left Content: Journals & Itineraries */}
        <div className="flex flex-col gap-8 w-3/5">
          {/* Journals Section */}
          <div className="journals bg-white p-4 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold mb-3">Journals</h2>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 p-4 rounded-md shadow min-w-[150px] min-h-[200px] flex flex-col items-center justify-between"
                >
                  <div className="flex-grow">
                    {/* Image or other content */}
                  </div>
                  <span className="text-center font-medium mt-2">
                    Journal {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Itineraries Section */}
          <div className="itineraries bg-white p-4 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold mb-3">Itineraries</h2>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 p-4 rounded-md shadow min-w-[150px] min-h-[200px] flex flex-col items-center justify-between"
                >
                  <div className="flex-grow">
                    {/* Image or other content */}
                  </div>
                  <span className="text-center font-medium mt-2">
                    Itinerary {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Daily Calendar */}
        <div className="w-[28rem] max-h-[26rem] bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Calendar</h2>
          {/* Days of the week */}
          <div className="grid grid-cols-7 text-center text-lg font-medium text-gray-600 mb-3">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 grid-rows-4 gap-2">
            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className="rounded-md shadow-md flex items-center justify-center"
              >
                <img src="" className="w-12 h-16 bg-blue-100 rounded-md" />
                <span className="absolute text-sm font-medium">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
