const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1
  },
  content: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    name: String
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'photo.files'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  entries: [entrySchema],
  privacy: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'private'
  },
  coverImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'photo.files'
  }
}, {
  timestamps: true
});

// Validation for dates
journalSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    next(new Error('Start date must be before end date'));
  }
  next();
});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;