// mongooseConn.js
require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('Mongoose connection successful');
  } catch (error) {
    console.error(`Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

