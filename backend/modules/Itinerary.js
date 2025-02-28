const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  itineraryName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: [
    {
      date: {
        type: Date,
        required: true,
      },
      activities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
        },
      ],
    },
  ],
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;