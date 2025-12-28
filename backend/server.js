import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import queueRoutes from './routes/queue.js';
import authRoutes from './routes/auth.js';
import { initializeSocket } from './socket/socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize Socket.IO
initializeSocket(io);
app.set('io', io); // Make io available to routes

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Fail after 5s if DB unreachable
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Fix: Drop duplicate index on queueNumber if it exists
    // This was causing "E11000 duplicate key error" preventing queue reset
    try {
      const Queue = mongoose.model('Queue');
      await Queue.collection.dropIndex('queueNumber_1');
      console.log('🔧 Fixed: Dropped incorrect unique index on queueNumber');
    } catch (err) {
      // Ignore error if index doesn't exist
      if (err.code !== 27) {
        console.log('ℹ️ Index check:', err.message);
      }
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

