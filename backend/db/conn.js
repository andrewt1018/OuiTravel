// Load environment variables from config.env file
require("dotenv").config({ path: "./config.env" });

// Import MongoClient and ServerApiVersion from the mongodb package
const { MongoClient, ServerApiVersion } = require("mongodb");

// Retrieve the MongoDB connection string from environment variables
const URI = process.env.ATLAS_URI;

// Create a new MongoClient instance with the connection string and options
const client = new MongoClient(URI, {
  // Configure the server API version and behavior
  serverApi: {
    version: ServerApiVersion.v1, // Use MongoDB API version 1
    strict: true, // Enable strict mode to ensure only operations that are part of the declared API version are allowed
    deprecationErrors: true, // Enable errors for deprecated operations
  }
});

// Variable to store the database connection
var _db;

/**
 * Connects to the MongoDB server and initializes the _db variable with the database instance.
 * This function should be called at the start of the application.
 */
async function connectToServer() {
  try {
    // Establish the connection to the MongoDB server
    await client.connect();
    // Select the database to use
    _db = client.db("user"); // "user" is the name of the database
  } catch (err) {
    // Log and handle any connection errors
    console.error("Failed to connect to MongoDB", err);
    throw err; // Rethrow the error for further handling if necessary
  }
}

/**
 * Returns the database connection object.
 * Throws an error if the connection has not been established.
 * @returns {MongoClient} The database connection object
 */
function getDb() {
  if (!_db) {
    throw new Error("No database connection");
  }
  return _db;
}

// Export the connectToServer and getDb functions for use in other parts of the application
module.exports = { connectToServer, getDb };
