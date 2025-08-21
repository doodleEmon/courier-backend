import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js'
import userRoute from './routes/userRoutes.js'

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// A simple test route to check if the server is working
app.get('/', (req, res) => {
    res.send('Courier Management System API is running...');
});

// Mount the user routes
app.use('/api/auth', userRoute);

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});