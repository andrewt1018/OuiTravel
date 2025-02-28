import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { ExpandLess, ExpandMore, AddAPhoto, RateReview, Notes, Delete } from "@mui/icons-material";
import RadioGroupRating from "./helpers/HoverRating";

export default function LocationPage() {
  const { placeId } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [outerExpanded, setOuterExpanded] = useState(false);
  const [innerExpanded, setInnerExpanded] = useState({
    photos: true,
    reviews: true,
    notes: true,
  });
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  // Fetch the location data using the placeId
  useEffect(() => {
    console.log("placeId from useParams:", placeId);
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
      fetchWishlistAndCheck();
    }
  }, [placeId]);
  
  // Handle file selection for image uploads
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Create preview URLs for the selected files
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFilePreview(prevPreviews => [...prevPreviews, ...newPreviews]);
  };
  
  // Remove a file from preview
  const removeFilePreview = (index) => {
    setFilePreview(prevPreviews => {
      // Release the object URL to prevent memory leaks
      URL.revokeObjectURL(prevPreviews[index].preview);
      return prevPreviews.filter((_, i) => i !== index);
    });
  };
  
  // Remove an already uploaded photo
  const removeUploadedPhoto = (photoId) => {
    setSelectedPhotos(prevPhotos => prevPhotos.filter(id => id !== photoId));
  };
  
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
        // Ensure photos is an array of strings, not objects
        const photoArray = Array.isArray(review.photos) ? review.photos : [];
        const processedPhotos = photoArray.map(photo => 
          typeof photo === 'string' ? photo : (photo._id || photo.toString())
        );
        console.log("Processed photos:", processedPhotos); // Debug log
        setSelectedPhotos(processedPhotos);
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
  
  // Upload images and return their IDs
  const uploadImages = async (files) => {
    if (!files.length) return [];
    
    const uploadedImageIds = [];
    const token = localStorage.getItem("token");
    
    try {
      setUploading(true);
      
      // Upload each file individually
      for (const fileObj of files) {
        const formData = new FormData();
        formData.append('image', fileObj.file);
        
        // Use location name in the image filename if available
        const locationName = locationData?.name?.replace(/\s+/g, '-').toLowerCase() || 'unknown-location';
        const originalFileName = fileObj.file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').toLowerCase();
        const timestamp = Date.now();
        
        formData.append('name', `${locationName}_${originalFileName}_${timestamp}`);
        
        const response = await axios.post(
          "http://localhost:3001/api/upload/post-image",
          formData,
          {
            headers: {
              "x-access-token": token,
              "Content-Type": "multipart/form-data",
            }
          }
        );
        
        if (response.data.imageId) {
          uploadedImageIds.push(response.data.imageId);
        }
      }
      
      return uploadedImageIds;
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload one or more images");
      return [];
    } finally {
      setUploading(false);
    }
  };
  
  // Submit or update review
  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Upload any newly selected images first
      let allPhotoIds = [...selectedPhotos]; // Start with existing photos
      
      if (filePreview.length > 0) {
        const newPhotoIds = await uploadImages(filePreview);
        allPhotoIds = [...allPhotoIds, ...newPhotoIds];
      }
      
      const reviewData = {
        placeId,
        rating,
        publicComment: reviewText,
        privateNotes,
        photos: allPhotoIds
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
      
      // Clear file previews and refresh data
      setFilePreview([]);
      fetchUserReview();
      alert(userReview ? "Review updated successfully!" : "Review created successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Error saving review. Please try again.");
    }
  };

  // Reset inner expanded state when outer section is opened
  useEffect(() => {
    if (outerExpanded) {
      // When outer section is expanded, expand all inner sections too
      setInnerExpanded({
        photos: true,
        reviews: true,
        notes: true,
      });
    }
  }, [outerExpanded]);

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
                onClick={() => delFromWishlist()}
                className="cursor-pointer text-blue-500 hover:text-blue-600"
                fontSize="large"
              />
            ) : (
              <BookmarkIcon
                onClick={() => addToWishlist()}
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
                  <div className="mt-4">
                    {/* Upload button */}
                    <div className="mb-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="photo-upload"
                        onChange={handleFileSelect}
                        multiple
                      />
                      <label 
                        htmlFor="photo-upload" 
                        className="cursor-pointer flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition-colors"
                      >
                        <AddAPhoto fontSize="small" /> Select Images
                      </label>
                    </div>
                    
                    {/* Image previews grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Show already uploaded photos */}
                      {selectedPhotos.length > 0 && selectedPhotos.map((photoId, index) => (
                        <div key={`uploaded-photo-${photoId}-${index}`} className="relative group">
                          <img
                            src={`http://localhost:3001/api/upload/images/${photoId}`}
                            alt={`Review photo ${index}`}
                            className="w-full h-48 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              console.error(`Error loading image ${photoId}:`, e);
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                            }}
                          />
                          <button 
                            onClick={() => removeUploadedPhoto(photoId)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Delete fontSize="small" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                            Uploaded
                          </div>
                        </div>
                      ))}
                      
                      {/* Show preview of selected files */}
                      {filePreview.map((file, index) => (
                        <div key={`preview-${index}`} className="relative group">
                          <img
                            src={file.preview}
                            alt={`Preview ${index}`}
                            className="w-full h-48 object-cover rounded-lg shadow-sm"
                          />
                          <button 
                            onClick={() => removeFilePreview(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Delete fontSize="small" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                            Selected
                          </div>
                        </div>
                      ))}
                    </div>
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
                  disabled={uploading}
                  className={`py-2 px-6 rounded-md shadow-md transition-colors ${
                    uploading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {uploading ? 'Uploading...' : userReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}