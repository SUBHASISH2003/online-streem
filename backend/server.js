import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import app from './app.js';
import connectDB from './config/db.js';
import 'dotenv/config';
import Meeting from './models/metting.model.js';
// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Match frontend port
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

// Socket.IO Logic with Meeting Integration
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', async (meetingId, userId, callback) => {
    try {
      // Verify meeting exists in MongoDB
      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        return callback?.({ success: false, error: 'Meeting not found' });
      }

      socket.join(meetingId);
      socket.to(meetingId).emit('user-connected', userId);
      console.log(`User ${userId} joined meeting ${meetingId}`);

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

      socket.on('disconnect', async () => {
        socket.to(meetingId).emit('user-disconnected', userId);
        console.log('Client disconnected:', socket.id);
        // Optional: Update participants in MongoDB on disconnect
        // await Meeting.updateOne({ meetingId }, { $pull: { participants: userId } });
      });

      callback?.({ success: true, meeting });
    } catch (error) {
      console.error('Error in join-room:', error);
      callback?.({ success: false, error: 'Server error' });
    }
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('Failed to connect to MongoDB:', err));