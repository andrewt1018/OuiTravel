const express = require('express');
const dbo = require('../db/conn');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../db/mongoose');

const User = require('../modules/User');

const router = express.Router();


const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      console.log("Verifying token");
      if (err) {
        console.log("verifying token failed");
        return res.status(403).send({ message: 'Unauthorized' });
      }
      // if everything good, save to request for use in other routes
      req.user = { id: decoded.id };
      console.log("Token verified successfully");
      next();
    });
  };

router.post('/get-user', verifyToken, async (req, res) => {
    const userId = req.user.id;
    console.log("User ID: " + userId);
    try {
        // Check if the user ID passed in is valid or not
        const existingUser = await dbConnect.collection("users").findOne( { _id: new ObjectId(userId) } );
        console.log(existingUser);
        if (!(existingUser)) {
          return res.status(500).send('Invalid user!');
        }
    } catch (error) {
        return res.status(500).send("Error getting user");
    }
});


module.exports = router;