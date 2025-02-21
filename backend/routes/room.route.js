import express from 'express';
import { createRoom, joinRoom } from '../controllers/room.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', auth, createRoom);
router.post('/join', auth, joinRoom);

export default router;