import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js'
import userRoute from './routes/userRoutes.js'
import parcelRoute from './routes/parcelRoutes.js'
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { // Initialize Socket.IO
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(express.json());   // for getting json from req.body

app.set('socketio', io);   // Pass `io` to routes/controllers

// A simple test route to check if the server is working
app.get('/', (req, res) => {
    res.send('Courier Management System API is running...');
});

// Mount the routes
app.use('/api/auth', userRoute);
app.use('/api/parcel', parcelRoute);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server and listen for incoming requests
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});