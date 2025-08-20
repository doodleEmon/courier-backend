import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js'
import userRoute from './routes/userRoutes.js'


// Initialize dotenv to use environment variables
dotenv.config();

// connect to database
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

// A simple test route to check if the server is working
app.get('/', (req, res) => {
    res.send('Courier Management System API is running...');
});

// Mount the user routes
app.use('/api/users', userRoute);

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});