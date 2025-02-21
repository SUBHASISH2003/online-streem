import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import roomRoutes from './routes/room.route.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Video Conference Backend Running'));
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);

export default app;