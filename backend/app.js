import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import roomRoutes from './routes/metting.route.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true, // Allow cookies/tokens to be sent
  }));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Video Conference Backend Running'));
app.use('/api/auth', authRoutes);
app.use('/api/meetings', roomRoutes);

export default app;