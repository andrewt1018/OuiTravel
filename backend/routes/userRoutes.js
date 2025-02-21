const express = require('express');
const connectDB = require('../db/mongoose');
const dbo = require('../db/conn');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

const User = require('../modules/User');

const router = express.Router();

/* Get user */
/** Used to verify the current user's JWT token (to ensure they're logged in) */
router.get('/get-user', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Check if the user ID passed in is valid or not
        const existingUser = await User.findById(userId)
        if (!(existingUser)) {
            console.log("User does not exist")
            return res.status(500).send('Invalid user!');
        }
        console.log("Got user:", existingUser.username);
        return res.status(201).send({ user: existingUser });
    } catch (error) {
        return res.status(403).send("Error getting user");
    }
});

/* Save icon */
/** Used to save a marker on the personal map as a persistent icon */
router.post('/save-icon', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const {marker} = req.body;  // Get the marker where the icon should be saved
    const dbConnect = dbo.getDb();
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found/invalid.'});
        const newIcon = {
            position: {
                lat: marker.position.lat,
                lng: marker.position.lng
            },
            char: "⭐️",
            _id: new ObjectId()
        }
        await dbConnect.collection("users").updateOne(
            {_id: ObjectId.createFromHexString(userId)},
            {$push: {
              savedIcons: newIcon
            }}
          );
        return res.status(201).json( {newIcon: newIcon} )
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Cannot save icon.' });
    }
});

/* Get user data */
/* Used to verify the current user's JWT token (to ensure they're logged in) */
router.get('/get-userdata', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Check if the user ID passed in is valid or not
        const existingUser = await User.findById(userId)
        if (!(existingUser)) {
            console.log("User does not exist")
            return res.status(500).send('Invalid user!');
        }
        return res.status(201).send({message :existingUser});
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
        if (!user) return res.status(404).json({ message: 'User not found/invalid.'});

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