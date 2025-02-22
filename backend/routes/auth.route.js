import express from 'express';
import { register, verifyEmail, login, googleLogin, forgotPassword, resetPassword, logout, getProfile } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);  //done
router.post('/verify-email', verifyEmail);  //done
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);

export default router;