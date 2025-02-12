const express = require('express');
const dbo = require('../db/conn');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const dbConnect = dbo.getDb();

    try {
        // Attempt to find the user in the database
        const user = await dbConnect.collection("users").findOne({ username });
        console.log("User:", user.username)
        // Validate user exists and password is correct
        if (!user) {
            return res.status(500).send("User doesn't exist!");
        } else if(!(await bcrypt.compare(password, user.password))) {
            return res.status(500).send('Passowrd incorrect.');
        }

        // Create a JWT
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '5m' });
        console.log("Userid:", user._id);

        // Send the JWT in the response
        return res.status(200).json({ message: "Login successful", token: token, userId: user._id, username: user.username });
    } catch (error) {
        // Log and respond with error
        console.error(error);
        res.status(500).send('An error occurred during the login process.');
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const dbConnect = dbo.getDb();
    var user;
    user = await dbConnect.collection("users").findOne({ username });
    if (user) {
        return res.status(500).json({ message: 'User with given username already exists!' })
    }
    user = await dbConnect.collection("users").findOne({ email });
    if (user) {
        return res.status(500).json({ message: 'User with given email already exists!' })
    }

    try {
      const newUser = new User({
        username,
        email,
        password
      });
  
      const savedUser = await newUser.save();  // Password will be encrypted here (through User schema)
      res.status(201).json(savedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user.' });
    }
  });


module.exports = router;
