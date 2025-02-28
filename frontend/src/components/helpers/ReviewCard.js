import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, Box, Rating, IconButton, CircularProgress } from '@mui/material';
import { Comment, Bookmark, Share, Image as ImageIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ReviewCard = ({ review }) => {
  // Extract data from review
  const { user, location, rating, publicComment, photos, updatedAt } = review;
  const [imageLoading, setImageLoading] = useState({});
  const [imageError, setImageError] = useState({});
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Process photos on component mount
  useEffect(() => {
    // Validate and process photos
    if (Array.isArray(photos) && photos.length > 0) {
      // Map each photo to a validated object
      const validatedPhotos = photos
        .filter(photo => photo) // Remove null/undefined
        .map(photo => {
          // If already a string, use it directly
          if (typeof photo === 'string') {
            return { id: photo };
          }
          
          // If it's an object with _id, use that
          if (typeof photo === 'object' && photo._id) {
            return { id: photo._id };
          }
          
          // If it has toString method (ObjectId), convert to string
          if (photo && photo.toString) {
            return { id: photo.toString() };
          }
          
          return null;
        })
        .filter(photo => photo !== null); // Remove any failed conversions
      
      setProcessedPhotos(validatedPhotos);
    }
  }, [photos]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Navigation handlers
  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  // Settings for image slider with ARIA fixes
  const sliderSettings = {
    dots: true,
    infinite: processedPhotos.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    accessibility: true,
    focusOnSelect: false,
    autoplay: false,
    arrows: false, // Disable default arrows, we'll use our custom ones
    dotsClass: "slick-dots bottom-2",
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    },
    afterChange: (index) => {
      setCurrentSlide(index);
    }
  };

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  // Create placeholder avatar if no profile pic
  const getAvatarContent = () => {
    if (!user.profilePic) {
      return user.username.charAt(0).toUpperCase();
    }
    return <Avatar src={`http://localhost:3001/api/upload/images/${user.profilePic}`} />;
  };

  // Track loading state for each image
  const handleImageLoading = (photoId, isLoading) => {
    setImageLoading(prev => ({
      ...prev,
      [photoId]: isLoading
    }));
  };

  // Track error state for each image
  const handleImageError = (photoId) => {
    setImageError(prev => ({
      ...prev,
      [photoId]: true
    }));
    console.error(`Failed to load image with ID: ${photoId}`);
  };

  // Ensure photo has a valid URL
  const getPhotoUrl = (photoId) => {
    if (!photoId) {
      return "https://via.placeholder.com/400?text=No+Image";
    }
    return `http://localhost:3001/api/upload/images/${photoId}`;
  };

  // Check if we have valid photos to display
  const hasPhotos = processedPhotos.length > 0;
  const hasMultiplePhotos = processedPhotos.length > 1;

  return (
    <Card sx={{ maxWidth: '100%', mb: 4, borderRadius: 2, boxShadow: 3 }}>
      {/* User info header */}
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getAvatarContent()}
          </Avatar>
        }
        title={getUserDisplayName()}
        subheader={formatDate(updatedAt)}
        titleTypographyProps={{ fontWeight: 'bold' }}
      />

      {/* Location info section */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
        <Link to={`/location-page/${location.placeId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" component="div" color="primary.dark" fontWeight="medium">
            {location.name}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary">
          {location.address}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Rating value={rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {rating.toFixed(1)}
          </Typography>
        </Box>
      </Box>

      {/* Review comment */}
      {publicComment && (
        <CardContent>
          <Typography variant="body1">{publicComment}</Typography>
        </CardContent>
      )}

      {/* Photos carousel/slider */}
      {hasPhotos && (
        <div className="relative px-2 pb-2">
          <Slider ref={sliderRef} {...sliderSettings}>
            {processedPhotos.map((photo, index) => (
              <div key={`${photo.id}-${index}`} className="relative">
                {/* Show loading indicator */}
                {imageLoading[photo.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <CircularProgress size={40} />
                  </div>
                )}
                
                {/* Show error indicator */}
                {imageError[photo.id] ? (
                  <div className="h-48 flex flex-col items-center justify-center bg-gray-100 text-gray-600 gap-2">
                    <ImageIcon fontSize="large" />
                    <Typography variant="body2">
                      Image could not be loaded
                    </Typography>
                  </div>
                ) : (
                  <div className="w-full pt-[56.25%] relative">
                    <img
                      src={getPhotoUrl(photo.id)}
                      alt={`Photo ${index + 1}`}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded"
                      onLoad={() => handleImageLoading(photo.id, false)}
                      onError={() => handleImageError(photo.id)}
                      onLoadStart={() => handleImageLoading(photo.id, true)}
                    />
                  </div>
                )}
              </div>
            ))}
          </Slider>
          
          {/* Show navigation arrows only if there are multiple photos */}
          {hasMultiplePhotos && (
            <>
              {/* Previous arrow */}
              <div 
                className="absolute top-1/2 left-3 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-opacity-80"
                onClick={goToPrev} 
                aria-label="Previous image"
              >
                <ArrowBackIos style={{ fontSize: 18, marginLeft: 4 }} />
              </div>
              
              {/* Next arrow */}
              <div 
                className="absolute top-1/2 right-3 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-opacity-80"
                onClick={goToNext} 
                aria-label="Next image"
              >
                <ArrowForwardIos style={{ fontSize: 18 }} />
              </div>
              
              {/* Image counter (e.g., "2 / 5") */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded-xl text-xs z-10">
                {currentSlide + 1} / {processedPhotos.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <CardActions disableSpacing>
        <IconButton aria-label="comment">
          <Comment />
        </IconButton>
        <IconButton aria-label="bookmark this location">
          <Bookmark />
        </IconButton>
        <IconButton aria-label="share">
          <Share />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ReviewCard;
