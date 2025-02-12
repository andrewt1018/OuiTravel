const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const journalSchema = new mongoose.Schema({

});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;