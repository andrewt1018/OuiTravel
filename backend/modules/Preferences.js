const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  activities: [{
    type: String,
    enum: ['Hiking', 'Museum Visits', 'Shopping', 'Food Tasting', 'Camping', 'Beach Activities'], 
  }],
  activitiesOther: {
    type: String,
    default: '', 
  },
  cuisines: [{
    type: String,
    enum: ['Italian', 'Vietnamese', 'Japanese', 'Mexican', 'French', 'Korean', 'Thai', 'Indian', 'Chinese', 'Greek', 'Spanish', 'American'], 
  }],
  travelTypes: [{
    type: String,
    enum: ['Adventure', 'Culture', 'Relaxation', 'Sightseeing', 'Solo Travel', 'Luxury Travel'], 
  }],
  destinations: [{
    type: String
  }]
});

const Preferences = mongoose.model('Preferences', preferencesSchema);
module.exports = Preferences;
