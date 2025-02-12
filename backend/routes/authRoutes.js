const express = require('express');
// const dbo = require('../db/conn');
const mongoose = require('mongoose');
const connectDB = require('../db/mongoose');

const User = require('../modules/User');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
require("dotenv").config({ path: "../config.env" });
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const bcrypt = require('bcryptjs');

const router = express.Router();

connectDB()
router.post('/register', async (req, res) => {
    const { username, email, password, dob, gender } = req.body;
  
    try {
      const newUser = new User({
        username,
        email,
        password,
        dob,
        gender
      });
  
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  });


/* Function to send password reset email */  

const sendResetEmail = async (email, retoken, res) => {

  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const accessToken = (await oauth2Client.getAccessToken()).token;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });

  const emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OuiTravel - Password Reset Link',
    html: `
        <p>To reset your password, please click on the following link, or paste it into your browser within 15 minutes of receiving:</p>
        <a href="http://localhost:3000/reset-password/${retoken}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
      `
  };

  try {
    await transporter.sendMail(emailOptions);
    res.status(200).json({ message: 'Reset password link sent'})

  } catch (error) {
      console.error('Error sending email: ', error);
      res.status(500).json({ message: 'Error sending password reset email' });
  }

};

/* Password reset request  */
router.post('/reset-password', async (req, res) => {

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const retoken = crypto.randomBytes(32).toString('hex');
    user.resetToken = retoken;
    user.resetExpires = Date.now() + 900000;
    await user.save();

    sendResetEmail(email, retoken, res);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending password request' });
  }
});

/* Verify token before resetting password */
router.get('/reset-token-verify/:token', async (req, res) => {

  const { token } = req.params;

  try {
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now()} });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token '});
    }
    res.status(200).json({ message: 'Valid token' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error verifying token' });

  }
});

/* Password Reset */
router.post('/reset-password/:token', async(req, res) => {

  const { token } = req.params;
  const { newPass } = req.body;

  try {
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hashed new password before updating in the database
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // user.password = hashedPassword;
    user.password = newPass;

    await user.save();
    user.resetToken = undefined;
    user.resetExpires = undefined;

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});





module.exports = router;
