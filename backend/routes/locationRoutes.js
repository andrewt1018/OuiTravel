const express = require('express');
const Location = require('../modules/Location');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

// const { getReceiverSocketId, io } = require('../lib/socket.js');
const { verify } = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log("Verifying token")
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

router.get('/get-location', verifyToken, async (req, res) => {
  const { placeId } = req.query;
  console.log("inside get-location");
  try {
    const location = await Location.findOne({ placeId });
    if (!location) {
      console.log("Location not found for placeId:", placeId);
      return res.status(404).json({ message: 'Location not found.' });
    }
    console.log("Location retrieved:", location.name);
    return res.status(200).json({ location });
  } catch (error) {
    console.error("Error retrieving location:", error);
    return res.status(500).json({ message: 'Error retrieving location.' });
  }
});

router.post('/post-location', verifyToken, async (req, res) => {
  const { placeId, name, address, coordinates } = req.body;

  try {
      let location = await Location.findOne({ placeId });

      if (location) {
          console.log("Location already exists:", location.name);
          return res.status(200).json({ location });
      }

      location = new Location({ placeId, name, address, coordinates });
      await location.save();

      console.log("New location created:", location.name);
      return res.status(201).json({ message: 'Location created.', location });

  } catch (error) {
      console.error("Error processing location:", error);
      return res.status(500).json({ message: 'Error processing location.' });
  }
});

// Add this route to check if a location exists by placeId
router.get('/check-location/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const location = await Location.findOne({ placeId });
    
    if (!location) {
      return res.status(404).json({ exists: false, message: 'Location not found' });
    }
    
    return res.status(200).json({ 
      exists: true, 
      location: {
        id: location._id,
        placeId: location.placeId,
        name: location.name
      } 
    });
  } catch (error) {
    console.error('Error checking location:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Add trending locations endpoint
router.get('/trending', verifyToken, async (req, res) => {
  try {
    // Find locations with reviews and sort by average rating (highest first)
    const trendingLocations = await Location.aggregate([
      { $match: { reviews: { $exists: true, $ne: [] } } },
      { $addFields: { 
        reviewCount: { $size: "$reviews" }, 
        avgRating: { $avg: "$ratings" } 
      }},
      { $sort: { avgRating: -1, reviewCount: -1 } },
      { $limit: 10 }
    ]);

    if (!trendingLocations || trendingLocations.length === 0) {
      return res.status(200).json({ 
        message: 'No trending locations found.', 
        locations: [] 
      });
    }

    return res.status(200).json({ 
      message: 'Trending locations retrieved successfully.', 
      locations: trendingLocations 
    });
  } catch (error) {
    console.error("Error retrieving trending locations:", error);
    return res.status(500).json({ message: 'Error retrieving trending locations.' });
  }
});

module.exports = router;