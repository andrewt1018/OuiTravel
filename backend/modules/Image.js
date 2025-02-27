const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: String,
    img: {
        data: Buffer,
        contentType: String
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', imageSchema);
