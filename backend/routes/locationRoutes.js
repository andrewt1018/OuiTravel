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


module.exports = router;