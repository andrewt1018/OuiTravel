const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0.5,
    max: 5,
    validate: {
      validator: function(v) {
        // Ensure rating is in 0.5 increments
        return (v * 10) % 5 === 0;
      },
      message: props => `${props.value} is not a valid rating. Rating must be in 0.5 increments.`
    }
  },
  publicComment: {
    type: String,
    trim: true
  },
  privateNotes: {
    type: String,
    trim: true
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure one review per user-location pair
reviewSchema.index({ user: 1, location: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;