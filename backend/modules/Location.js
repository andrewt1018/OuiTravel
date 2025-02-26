const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  category: {
    type: String,
    enum: ['Food & Drink', 'Things To Do', 'Shopping', 'Services', 'Other'],
    default: 'Other',
  },
  friendScore: {
    type: Number,
    default: 0,
  },
  communityScore: {
    type: Number,
    default: 0,
  },
  yourScore: {
    type: Number,
    default: 0,
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "photo.files"
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;