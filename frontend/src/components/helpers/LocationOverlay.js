import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { CardContent, CardHeader } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import axios from 'axios'

export default function LocationOverlay({ placeId, placeName, placeLocation }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Hardcoded scores
  const friendScore = 8.5;
  const communityScore = 9.2;
  const yourScore = 7.8;

  const addToWishlist = async () => {
    setIsBookmarked(true)
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:3001/api/user/post-wishlist", 
            { placeId },
            { headers: { "x-access-token": token } }
        );

        alert(res.data.message);
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        alert(error.response?.data?.message || "Could not add to wishlist.");
    }
  };

  const delFromWishlist = async () => {
    setIsBookmarked(false);
    try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`http://localhost:3001/api/user/del-wishlist/${placeId}`, 
            { headers: { "x-access-token": token } }
        );

        alert(res.data.message);
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        alert(error.response?.data?.message || "Could not remove from wishlist.");
    }
  };

  const fetchWishlistAndCheck = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/api/user/get-wishlist", 
            { headers: { "x-access-token": token } }
        );

        setWishlist(res.data.wishlist);

        const isWishlisted = res.data.wishlist.some(item => item.placeId === placeId);
        setIsBookmarked(isWishlisted);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
    }
  };

  // Fetch the bookmarked status using the placeId
  useEffect(() => {
      fetchWishlistAndCheck();
  }, [placeId]);

  return (
    <div className="absolute bottom-4 right-4 w-96 bg-white shadow-lg rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100">
      <CardHeader
          title={placeName || "Unknown Location"}
          subheader={
            <Link 
              to={`/location-page/${placeId}`} 
              className="text-gray-500 text-sm hover:underline"
            >
              More details
            </Link>
          }
          action={
            <div className="flex gap-2">
              {isAdded ? (
                <CheckCircleOutlineIcon
                  onClick={() => setIsAdded(false)}
                  className="cursor-pointer text-blue-300 hover:text-blue-400"
                />
              ) : (
                <AddCircleOutlineIcon
                  onClick={() => setIsAdded(true)}
                  className="cursor-pointer text-gray-600 hover:text-black"
                />
              )}
              {isBookmarked ? (
                <BookmarkAddedIcon
                  onClick={() => delFromWishlist()}
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                />
              ) : (
                <BookmarkIcon
                  onClick={() => addToWishlist()}
                  className="cursor-pointer text-gray-600 hover:text-black"
                />
              )}
            </div>
          }
        />
      </div>
      <CardContent>
        {/* Location Info */}
        <p className="text-gray-700 text-lg">
            {placeLocation 
                ? placeLocation
                : "Location not available"}
        </p>


        {/* Scores Section */}
        <div className="mt-4">
          <p className="text-base font-semibold">Scores</p>
          <div className="flex justify-around mt-2">
            {/* Friend Score */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-700">{friendScore}</span>
              </div>
              <span className="mt-1 text-xs text-gray-500">Friend</span>
            </div>
            {/* Community Score */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-700">{communityScore}</span>
              </div>
              <span className="mt-1 text-xs text-gray-500">Community</span>
            </div>
            {/* Your Score */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-700">{yourScore}</span>
              </div>
              <span className="mt-1 text-xs text-gray-500">Your Score</span>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="mt-3">
          <p className="text-base font-semibold">Photos</p>
          <div className="flex gap-3 mt-1">
            <div className="w-20 h-20 bg-gray-300 rounded-lg" />
            <div className="w-20 h-20 bg-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Your Notes & Photos Dropdown */}
        <div className="mt-4">
          <div
            className="flex justify-between items-center cursor-pointer text-blue-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="font-semibold text-base">Your Notes & Photos</span>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </div>
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <textarea
                placeholder="Write your notes here..."
                className="w-full p-2 border border-gray-300 rounded-md text-base"
              />
              <div className="flex gap-3 mt-3">
                <div className="w-20 h-20 bg-gray-300 rounded-lg" />
                <div className="w-20 h-20 bg-gray-300 rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
