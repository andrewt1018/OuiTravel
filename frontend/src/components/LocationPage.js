import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { ExpandLess, ExpandMore, AddAPhoto, RateReview, Notes } from "@mui/icons-material";
import RadioGroupRating from "./helpers/HoverRating";

export default function LocationPage() {
  const { placeId } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [outerExpanded, setOuterExpanded] = useState(false);
  const [innerExpanded, setInnerExpanded] = useState({
    photos: false,
    reviews: false,
    notes: false,
  });
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const toggleInnerSection = (section) => {
    setInnerExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle rating change
  const handleRatingChange = (newValue) => {
    setRating(newValue);
  };

  // Fetch the location data using the placeId
  useEffect(() => {
    async function fetchLocation() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/api/location/get-location", {
          params: { placeId },
          headers: { "x-access-token": token },
        });
        setLocationData(res.data.location);
        
        // Check if user has an existing review
        fetchUserReview();
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }
    
    if (placeId) {
      fetchLocation();
    }
  }, [placeId]);
  
  // Fetch user's existing review for this location
  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3001/api/reviews/user-review/${placeId}`, {
        headers: { "x-access-token": token },
      });
      
      if (res.data.review) {
        const review = res.data.review;
        setUserReview(review);
        setRating(review.rating || 0);
        setReviewText(review.publicComment || '');
        setPrivateNotes(review.privateNotes || '');
        setSelectedPhotos(review.photos || []);
      } else {
        // Handle case when no review exists
        setUserReview(null);
        setRating(0);
        setReviewText('');
        setPrivateNotes('');
        setSelectedPhotos([]);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
      // Reset form on error
      setUserReview(null);
      setRating(0);
      setReviewText('');
      setPrivateNotes('');
      setSelectedPhotos([]);
    }
  };
  
  // Submit or update review
  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const reviewData = {
        placeId,
        rating,
        publicComment: reviewText,
        privateNotes,
        photos: selectedPhotos
      };
      
      if (userReview) {
        // Update existing review
        await axios.put(
          `http://localhost:3001/api/reviews/update/${userReview._id}`, 
          reviewData,
          { headers: { "x-access-token": token } }
        );
      } else {
        // Create new review
        await axios.post(
          "http://localhost:3001/api/reviews/create", 
          reviewData,
          { headers: { "x-access-token": token } }
        );
      }
      
      // Refresh data
      fetchUserReview();
      alert(userReview ? "Review updated successfully!" : "Review created successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Error saving review. Please try again.");
    }
  };

  if (!locationData) {
    return <div className="p-8">Loading location details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-100 to-purple-100 py-8 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              {locationData.name || "Unknown Location"}
            </h1>
            <p className="mt-2 text-gray-700 text-lg">
              {locationData.address || "Location not available"}
            </p>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            {isAdded ? (
              <CheckCircleOutlineIcon
                onClick={() => setIsAdded(false)}
                className="cursor-pointer text-blue-500 hover:text-blue-600"
                fontSize="large"
              />
            ) : (
              <AddCircleOutlineIcon
                onClick={() => setIsAdded(true)}
                className="cursor-pointer text-gray-600 hover:text-black"
                fontSize="large"
              />
            )}
            {isBookmarked ? (
              <BookmarkAddedIcon
                onClick={() => setIsBookmarked(false)}
                className="cursor-pointer text-blue-500 hover:text-blue-600"
                fontSize="large"
              />
            ) : (
              <BookmarkIcon
                onClick={() => setIsBookmarked(true)}
                className="cursor-pointer text-gray-600 hover:text-black"
                fontSize="large"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-6 space-y-8">
        {/* Scores Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
            Scores
          </h2>
          <div className="flex justify-around mt-6">
            {/* Friend Score */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border border-gray-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-lg text-gray-700">
                  {locationData.friendScore || "-"}
                </span>
              </div>
              <span className="mt-2 text-sm text-gray-500">Friend</span>
            </div>
            <div className="border-l border-gray-300 h-16"></div>
            {/* Community Score */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border border-gray-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-lg text-gray-700">
                  {locationData.communityScore || "-"}
                </span>
              </div>
              <span className="mt-2 text-sm text-gray-500">Community</span>
            </div>
            <div className="border-l border-gray-300 h-16"></div>
            {/* Your Score */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border border-gray-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-lg text-gray-700">
                  {locationData.yourScore || "-"}
                </span>
              </div>
              <span className="mt-2 text-sm text-gray-500">Your Score</span>
            </div>
          </div>
        </section>

        {/* Photos Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
            Photos
          </h2>
          <div className="flex gap-4 mt-6">
            {locationData.images && locationData.images.length > 0 ? (
              locationData.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Location ${index}`}
                  className="w-48 h-48 rounded-lg shadow-sm object-cover"
                />
              ))
            ) : (
              <>
                <div className="w-48 h-48 bg-gray-300 rounded-lg shadow-sm" />
                <div className="w-48 h-48 bg-gray-300 rounded-lg shadow-sm" />
                <div className="w-48 h-48 bg-gray-300 rounded-lg shadow-sm" />
              </>
            )}
          </div>
        </section>

        {/* Your Notes & Photos Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div
            className="flex justify-between items-center cursor-pointer text-gray-600 border-b pb-2"
            onClick={() => setOuterExpanded(!outerExpanded)}
          >
            <h2 className="text-2xl font-semibold">Your Notes & Photos</h2>
            {outerExpanded ? (
              <ExpandLess fontSize="large" />
            ) : (
              <ExpandMore fontSize="large" />
            )}
          </div>

          {outerExpanded && (
            <div className="mt-6">
              {/* Rating Section */}
              <div className="mb-4 relative flex items-center">
                <h3 className="text-xl font-semibold text-gray-500 absolute left-0">
                  Rate this Location
                </h3>
                <div className="w-full flex justify-center">
                  <RadioGroupRating value={rating} onChange={handleRatingChange} />
                </div>
              </div>

              <div className="border-t border-gray-300 my-4"></div>

              {/* Add Photos Section */}
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-500 pb-2"
                  onClick={() => toggleInnerSection("photos")}
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <AddAPhoto fontSize="medium" /> Add Photos
                  </h3>
                  {innerExpanded.photos ? (
                    <ExpandLess fontSize="large" />
                  ) : (
                    <ExpandMore fontSize="large" />
                  )}
                </div>
                {innerExpanded.photos && (
                  <div className="flex gap-4 mt-4">
                    {/* Photo upload functionality would go here */}
                    <div className="w-48 h-48 bg-gray-300 rounded-lg shadow-sm flex items-center justify-center">
                      <input type="file" accept="image/*" className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <AddAPhoto fontSize="large" className="text-gray-500" />
                      </label>
                    </div>
                    {selectedPhotos.length > 0 && selectedPhotos.map((photo, index) => (
                      <div key={index} className="w-48 h-48 relative">
                        <img 
                          src={`/uploads/${photo}`} 
                          alt={`Review photo ${index}`} 
                          className="w-full h-full object-cover rounded-lg shadow-sm" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 my-4"></div>

              {/* Add Reviews Section */}
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-500 pb-2"
                  onClick={() => toggleInnerSection("reviews")}
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <RateReview fontSize="medium" /> Add Reviews
                  </h3>
                  {innerExpanded.reviews ? (
                    <ExpandLess fontSize="large" />
                  ) : (
                    <ExpandMore fontSize="large" />
                  )}
                </div>
                {innerExpanded.reviews && (
                  <textarea
                    placeholder="Write your review here..."
                    className="w-full p-4 border border-gray-300 rounded-md text-base shadow-sm mt-4"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                )}
              </div>

              <div className="border-t border-gray-300 my-4"></div>

              {/* Add Personal Notes Section */}
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-500 pb-2"
                  onClick={() => toggleInnerSection("notes")}
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Notes fontSize="medium" /> Add Personal Notes
                  </h3>
                  {innerExpanded.notes ? (
                    <ExpandLess fontSize="large" />
                  ) : (
                    <ExpandMore fontSize="large" />
                  )}
                </div>
                {innerExpanded.notes && (
                  <textarea
                    placeholder="Write your personal notes here..."
                    className="w-full p-4 border border-gray-300 rounded-md text-base shadow-sm mt-4"
                    rows={4}
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                  />
                )}
              </div>
              
              {/* Submit button */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleReviewSubmit}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors shadow-md"
                >
                  {userReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}