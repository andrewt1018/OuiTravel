const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const locationSchema = new mongoose.Schema({

});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;