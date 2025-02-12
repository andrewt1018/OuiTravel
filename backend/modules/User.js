const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the User schema
const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4 // Automatically generate a UUID for each user
  },
  email: {
    type: String, 
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken:{
    type: String, 
    default: null,
  },
  resetExpires: {
    type: Date,
    default: null,
  },
  followerList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for followers
  }],
  followingList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  blockedList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  blockedByList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  bio: {
    type: String,
    default: "This is my bio.",
    required: true,
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  dob: { 
    type: Date, 
    required: true 
  },  
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"], 
    required: true,
  },
  profilePic: { 
    type: String 
  }, 
  preferences: {
    destinations: { type: [String], default: [] },
    activities: { type: [String], default: [] }, 
    cuisines: { type: [String], default: [] }, 
    transportation: { 
      type: String, 
      enum: ['Car', 'Public Transport', 'Bike', 'Walking', 'Prefer not to specify'], 
      default: 'Prefer not to specify' 
    },
    lodging: { 
      type: String, 
      enum: ['Hotel', 'Hostel', 'Airbnb', 'Camping', 'Prefer not to specify'], 
      default: 'Prefer not to specify' 
    }
  }


});

const User = mongoose.model('User', userSchema);

module.exports = User;
