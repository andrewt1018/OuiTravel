const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
