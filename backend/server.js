import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";

import app from './app.js';
import connectDB from './config/db.js';
import 'dotenv/config';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
app.use(cors());

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('sending-signal', (payload) => {
      io.to(payload.userToSignal).emit('receiving-signal', {
        signal: payload.signal,
        callerId: payload.callerId,
      });
    });

    socket.on('returning-signal', (payload) => {
      io.to(payload.callerId).emit('signal-returned', {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
      console.log('Client disconnected:', socket.id);
    });
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});