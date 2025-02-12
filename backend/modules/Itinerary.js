const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({

});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;