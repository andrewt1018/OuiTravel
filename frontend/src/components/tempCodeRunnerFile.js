import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { getUser } from "./helpers/user-verification";
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
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followText, setFollowText] = useState("Follow");
  const [isSentFollow, setIsSentFollow] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  const handleFollow = async () => {
    try {
      console.log("isFollowing is ", isFollowing);
      if (isFollowing) {
        await axios.post(
          `http://localhost:3001/api/user/unfollow/${userData._id}`,
          {},
          {
            headers: { "x-access-token": localStorage.getItem("token") },
          }
        );
        setIsFollowing(false);
        setFollowText("Follow");
        setFollowerCount(followerCount - 1);
        setIsSentFollow(false);
      } else {
        console.log("you are trying to follow");
        await axios.post(
          `http://localhost:3001/api/user/follow/${userData._id}`,
          {},
          {
            headers: { "x-access-token": localStorage.getItem("token") },
          }
        );

        console.log("currently isSent is ", isSentFollow);
        setIsSentFollow(true);
        console.log("after setting, isSent is ", isSentFollow);
        //check private or public
        if (userData.visibility === "Private") {
          console.log("currently text is", followText);
          setFollowText("Follow Requested");
          console.log("after textis ", followText); //i think setting it here might be useless because async function
        } else {
          setIsFollowing(true);
          setFollowerCount(followerCount + 1);
          setFollowText("Following");
        }
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const loggedInUser = await getUser();
        if (!loggedInUser) {
          alert("User not logged in!");
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `http://localhost:3001/api/profile/${username}`
        );
        setUserData(res.data);
        setFollowingCount(res.data.followingCount);
        setFollowerCount(res.data.followerCount);

        // Set the visibility field (Public/Private)
        if (res.data.visibility === "Private") {
          setIsPrivate(true); // Set isPrivate to true if the profile is private
        } else {
          setIsPrivate(false);
        }

        // Check if the logged-in user follows this profile already
        const isUserFollowing = res.data.followerList.includes(
          loggedInUser._id
        );
        const isRequested = loggedInUser.tryingToFollowList.includes(
          res.data._id
        );

        console.log("hello do i follow him ", isUserFollowing);
        console.log("did i sent request ", isSentFollow);

        setIsFollowing(isUserFollowing); //set the text of button when revisit the profile
        if (isUserFollowing) {
          setFollowText("Following");
        } else if (isRequested) {
          setFollowText("Follow Requested");
        } else {
          setFollowText("Follow");
        }
        
        // Fetch user profile pic if available
        if (res.data.profilePic) {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:3001/api/upload/get-image?id=${res.data.profilePic}`, {
                headers: { 'x-access-token': token }
            });
            if (response.data && response.data.imageUrl) {
                setProfilePic(response.data.imageUrl);
            }
          } catch (error) {
              console.error("Error fetching profile image:", error);
          }
        }
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
          { profilePic ? 
            (<img
                className="h-48 w-48 object-cover rounded-full"
                src={profilePic}
                alt="Profile Avatar"
            />)
            : (<img
                className="h-48 w-48 object-contain rounded-full"
                src={"/default-avatar.png"}
                alt="Profile Avatar"
            />)
          }
        </div>
        {/* User Info */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-5xl font-bold pb-4">{userData.firstName} {userData.lastName}</h1>
          <p className="text-2xl text-gray-700">@{userData.username}</p>
          <p className="mt-3 text-lg text-gray-600 max-w-lg leading-relaxed">
            {userData.bio}
          </p>
          {/* Followers & Following */}
          <div className="flex gap-6 mt-4 text-lg text-gray-600">
            <div className="flex items-center gap-2">
              <strong className="text-gray-900">{followerCount}</strong>
              <span>Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <strong className="text-gray-900">{followingCount}</strong>
              <span>Following</span>
            </div>

            <button
              className={`mt-2 px-3 py-1 text-lg text-gray-600 border rounded-md transition ${
                isFollowing
                  ? "border-blue-500 text-blue-500"
                  : "border-gray-400 hover:bg-gray-100"
              }`}
              onClick={handleFollow}
              disabled={followText === "Follow Requested"}
            >
              {followText}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isPrivate && !isFollowing ? (
        <div className="flex flex-1 p-8 justify-center items-center">
          <Typography variant="h5" color="textSecondary">
            This profile has Private Content.
          </Typography>
        </div>
      ) : (
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
      )}
    </div>
  );
}
