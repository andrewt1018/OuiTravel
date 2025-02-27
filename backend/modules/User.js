const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const positionSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
});

const iconSchema = new mongoose.Schema({
  position: {
    type: positionSchema,
    required: true,
  },
  char: {
    type: String,
  },
});

// Define the User schema
const userSchema = new mongoose.Schema({
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
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  followerList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for followers
  }],
  followingList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  pendingFollowers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Self-reference for pending followers when account is private
  }],
  blockedList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  blockedByList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-reference for following
  }],
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    default: "This is my bio.",
    required: false,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetExpires: {
    type: Date,
    default: null,
  },
  dob: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: false,
  },
  profilePic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
  ],
  savedIcons: [
    {
      type: iconSchema,
    },
  ],
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Preferences"
  },
  visibility: {
    type: String,
    enum: ["Public", "Private"],
    default: "Private",
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  journals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },
  ],
  itineraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
});

// Pre-save middleware to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if the password is new/modified
  try {
    const saltRounds = 10; // Recommended value
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
