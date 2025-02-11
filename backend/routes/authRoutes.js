const express = require('express');
const dbo = require('../db/conn');
const mongoose = require('mongoose');
const connectDB = require('../db/mongoose');

const User = require('../modules/User');

const router = express.Router();

connectDB()
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
