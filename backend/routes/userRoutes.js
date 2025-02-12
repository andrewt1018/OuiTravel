const express = require('express');
const connectDB = require('../db/mongoose');
const dbo = require('../db/conn');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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

/* Edit Profile */
// edit their bio, DoB, gender, profile picture, and other details. 
router.post('/edit-profile', async (req, res) => {

    const { newBio, newUsername, newDOB, newGender, newProfilePic } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found/invalid.'});
        }

        if (newBio !== undefined && newBio !== null) user.bio = newBio.trim();
        if (newUsername != undefined && newUsername !== null) user.username = newUsername.trim();
        if (newDOB) user.dob = new Date(newDOB);
        if (newGender && ["Male", "Female", "Other"].includes(newGender)) {
            user.gender = newGender;
        }
        if (newProfilePic) user.profilePic = newProfilePic;

         
        await user.save();

        return res.status(200).json({ message: 'User Profile updated successfully '});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Cannot update user profile.' });

    }

});


/* Edit Preferences */
router.post('/preferences', async (req, res) => {

    // const userId = req.user.id;
    const { destinations, activities, cuisines, transportation, lodging, userId } = req.body;
    console.log(destinations, activities, cuisines);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.preferences = {
            destinations: destinations || user.preferences.destinations,
            activities: activities || user.preferences.activities,
            cuisines: cuisines || user.preferences.cuisine,
            transportation: transportation || user.preferences.transportation,
            lodging: lodging || user.preferences.lodging
        };

        await user.save();

        return res.status(200).json({ message: 'Preferences updated successfully. ', preferences: user.preferences});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error updating preferences' });
    }
});



module.exports = router;