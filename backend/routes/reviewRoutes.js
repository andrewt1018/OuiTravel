const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Review = require('../modules/Review');
const User = require('../modules/User');
const Location = require('../modules/Location');

const router = express.Router();
const { verify } = require('jsonwebtoken');

// Authentication middleware
const verifyToken = (req, res, next) => {
    console.log("Verifying token");
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log("Verifying token failed");
            return res.status(403).send({ message: 'Unauthorized' });
        }
        req.user = { id: decoded.id };
        console.log("Token verified successfully");
        next();
    });
};

// Get all reviews for a location by place ID
router.get('/location/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        
        if (!placeId) {
            return res.status(400).json({ message: 'Invalid place ID' });
        }

        // First find the location by placeId
        const location = await Location.findOne({ placeId });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const reviews = await Review.find({ location: location._id })
            .populate('user', 'username firstName lastName profilePic')
            .populate('photos')
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's review for a specific location by place ID
router.get('/user-review/:placeId', verifyToken, async (req, res) => {
    try {
        const { placeId } = req.params;
        const userId = req.user.id;
        
        console.log(`Fetching review for placeId: ${placeId} and userId: ${userId}`);
        
        if (!placeId) {
            console.log('Invalid placeId provided');
            return res.status(400).json({ message: 'Invalid place ID' });
        }

        // First find the location by placeId
        const location = await Location.findOne({ placeId });
        console.log('Location found:', location ? 'Yes' : 'No');
        
        if (!location) {
            console.log(`Location not found for placeId: ${placeId}`);
            return res.status(404).json({ message: 'Location not found' });
        }

        console.log('Looking for review with locationId:', location._id);
        const review = await Review.findOne({ 
            location: location._id,
            user: userId 
        });
        
        console.log('Review found:', review ? 'Yes' : 'No');

        // If review exists, ensure it's properly formatted for the client
        if (review) {
            try {
                // Create a plain object from the Mongoose document
                const reviewObj = review.toObject();
                
                // Ensure photos is an array of strings (not ObjectIds)
                if (Array.isArray(reviewObj.photos)) {
                    reviewObj.photos = reviewObj.photos.map(photo => {
                        // Handle if photo is already a string
                        if (typeof photo === 'string') return photo;
                        
                        // Handle if photo is an ObjectId
                        if (photo && photo.toString) return photo.toString();
                        
                        // Handle null/undefined case
                        return null;
                    }).filter(Boolean); // Remove any null values
                } else {
                    reviewObj.photos = [];
                }
                
                console.log('Processed photos:', reviewObj.photos);
                res.json({ review: reviewObj });
            } catch (err) {
                console.error('Error processing review object:', err);
                res.status(500).json({ message: 'Error processing review data' });
            }
        } else {
            res.json({ review: null });
        }
    } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all reviews by a user
router.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if requesting user's own reviews or if the target user's profile is public
        const requestingUserId = req.user.id;
        
        if (userId !== requestingUserId) {
            const targetUser = await User.findById(userId);
            if (!targetUser || targetUser.visibility !== 'Public') {
                return res.status(403).json({ message: 'This user\'s reviews are private' });
            }
        }

        const reviews = await Review.find({ user: userId })
            .populate('location', 'name address category')
            .populate('photos')
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews from users that current user follows - with enhanced photo handling
router.get('/feed', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find current user to get followingList
        const currentUser = await User.findById(userId);
        
        if (!currentUser) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Initialize followingList as empty array if it doesn't exist
        const followingList = currentUser.followingList || [];
        console.log(`User is following ${followingList.length} accounts`);
        
        if (followingList.length === 0) {
            return res.status(200).json({ reviews: [], message: 'Not following anyone yet' });
        }
        
        // Get reviews from users in followingList, sorted by most recent
        const reviews = await Review.find({ 
            user: { $in: followingList } 
        })
        .populate('user', 'username firstName lastName profilePic')
        .populate({
            path: 'location',
            select: 'name address placeId category'
        })
        .sort({ updatedAt: -1 })
        .limit(20); // Limit to 20 most recent reviews
        
        console.log(`Found ${reviews.length} reviews for feed`);
        
        // Process reviews with better photo handling
        const processedReviews = reviews.map(review => {
            // Convert to plain object
            const reviewObj = review.toObject();
            
            console.log(`Processing review ${reviewObj._id}`);
            
            // Verify the photo IDs are actually objects in the database
            if (Array.isArray(reviewObj.photos)) {
                // Make sure each photo ID is a valid string
                reviewObj.photos = reviewObj.photos
                    .filter(photo => photo) // Remove null/undefined
                    .map(photo => {
                        try {
                            // If already a string, return it
                            if (typeof photo === 'string') {
                                return photo;
                            }
                            
                            // If it's an object with _id, use that
                            if (typeof photo === 'object' && photo._id) {
                                return photo._id.toString();
                            }
                            
                            // If it's a Mongoose ObjectId, convert to string
                            if (photo.toString && typeof photo.toString === 'function') {
                                return photo.toString();
                            }
                            
                            // If nothing works, skip this photo
                            console.log('Unhandled photo type:', typeof photo);
                            return null;
                        } catch (err) {
                            console.error('Error processing photo:', err);
                            return null;
                        }
                    })
                    .filter(Boolean); // Remove any null values after processing
                
                console.log(`Review ${reviewObj._id} processed photos:`, reviewObj.photos);
            } else {
                reviewObj.photos = [];
            }
            
            return reviewObj;
        });
        
        res.status(200).json({ reviews: processedReviews });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new review using place ID
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { placeId, rating, publicComment, privateNotes, photos } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!placeId || !rating) {
            return res.status(400).json({ message: 'Place ID and rating are required' });
        }

        // Ensure photos is an array of strings
        const photoIds = Array.isArray(photos) 
            ? photos.map(photo => typeof photo === 'string' ? photo : photo.toString())
            : [];

        // Find the location by placeId
        const location = await Location.findOne({ placeId });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Check if user already reviewed this location
        const existingReview = await Review.findOne({ user: userId, location: location._id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this location' });
        }

        // Create new review
        const newReview = new Review({
            user: userId,
            location: location._id,
            rating,
            publicComment,
            privateNotes,
            photos: photoIds
        });

        await newReview.save();

        // Update user's reviews array
        await User.findByIdAndUpdate(userId, {
            $push: { reviews: newReview._id }
        });

        // Update location's reviews array and recalculate community score
        await Location.findByIdAndUpdate(location._id, {
            $push: { reviews: newReview._id }
        });

        // Recalculate community score for the location
        await updateLocationScore(location._id);

        res.status(201).json({ 
            message: 'Review created successfully',
            review: {
                ...newReview.toObject(),
                photos: newReview.photos.map(photo => photo.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an existing review
router.put('/update/:reviewId', verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const { rating, publicComment, privateNotes, photos } = req.body;

        // Ensure photos is an array of strings
        const photoIds = Array.isArray(photos) 
            ? photos.map(photo => typeof photo === 'string' ? photo : photo.toString())
            : [];

        // Find the review and check ownership
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own reviews' });
        }

        // Update review fields
        review.rating = rating || review.rating;
        review.publicComment = publicComment !== undefined ? publicComment : review.publicComment;
        review.privateNotes = privateNotes !== undefined ? privateNotes : review.privateNotes;
        review.photos = photoIds;
        review.updatedAt = Date.now();

        await review.save();

        // Recalculate community score for the location
        await updateLocationScore(review.location);

        res.status(200).json({ 
            message: 'Review updated successfully',
            review: {
                ...review.toObject(),
                photos: review.photos.map(photo => photo.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a review
router.delete('/delete/:reviewId', verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Find the review and check ownership
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        const locationId = review.location;

        // Remove review from user's reviews array
        await User.findByIdAndUpdate(userId, {
            $pull: { reviews: reviewId }
        });

        // Remove review from location's reviews array
        await Location.findByIdAndUpdate(locationId, {
            $pull: { reviews: reviewId }
        });

        // Delete the review
        await Review.findByIdAndDelete(reviewId);

        // Recalculate community score for the location
        await updateLocationScore(locationId);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to update location score
async function updateLocationScore(locationId) {
    try {
        const location = await Location.findById(locationId).populate('reviews');
        if (!location || !location.reviews.length) return;

        // Calculate average rating for community score
        const totalRating = location.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / location.reviews.length;
        
        // Update the location with new community score
        location.communityScore = parseFloat(averageRating.toFixed(1));
        await location.save();
    } catch (error) {
        console.error('Error updating location score:', error);
    }
}

module.exports = router;
