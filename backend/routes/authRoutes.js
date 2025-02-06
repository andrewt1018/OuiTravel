const express = require('express');
// const dbo = require('../db/conn');
const mongoose = require('mongoose');
const connectDB = require('../db/mongoose');

const User = require('../modules/User');

const router = express.Router();

connectDB()
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const newUser = new User({
        username,
        email,
        password,
      });
  
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  });


module.exports = router;
