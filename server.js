// server.js

// Import required packages
const express = require('express');
const dotenv = require('dotenv');

// Initialize dotenv to use environment variables
dotenv.config();

// Create an instance of the Express application
const app = express();

// Define the port the server will run on
// It will use the PORT from the .env file, or 3000 if it's not defined
const PORT = process.env.PORT || 3000;

// A simple test route to check if the server is working
app.get('/', (req, res) => {
  res.send('Courier Management System API is running...');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});