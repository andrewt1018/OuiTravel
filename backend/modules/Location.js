const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({

});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;