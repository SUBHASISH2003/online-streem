import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/user.model.js';
import { sendEmail } from '../utils/email.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate OTP helper (not exported as it’s internal)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields (email, password, firstName, lastName) are required' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP and expiration
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create and save user
    const user = new User({
      email: email.trim().toLowerCase(), // Normalize email
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      emailOtp: otp,
      emailOtpExpires: otpExpires,
    });
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Video Conference App',
        message: `
          <h2>Welcome, ${user.firstName}!</h2>
          <p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>
          <p>Please use this OTP to verify your email address.</p>
          <p>If you didn’t request this, ignore this email.</p>
        `,
      });
      res.status(201).json({ message: 'User registered. Please verify your email with the OTP sent.' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(201).json({
        message: 'User registered, but failed to send OTP email. Please contact support.',
        userId: user._id, // Provide user ID for manual verification if needed
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration', error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate request body
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP validity
    if (user.emailOtp !== otp || Date.now() > user.emailOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Add token to user's tokens array
    user.tokens = user.tokens || []; // Ensure tokens array exists
    user.tokens.push({ token });

    // Save user updates
    await user.save();

    // Send success response
    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    // Improved error handling
    res.status(500).json({
      message: 'Error verifying email',
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user and validate credentials
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check email verification
    if (user.emailOtp) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    // Generate and store token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.tokens = user.tokens || []; // Ensure tokens array exists
    user.tokens.push({ token });
    await user.save();

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login', error: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Input validation
    if (!token) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
      if (user) {
        // Link Google ID to existing user
        user.googleId = googleId;
        // Optionally update names if they're missing or different
        user.firstName = user.firstName || firstName;
        user.lastName = user.lastName || lastName;
      } else {
        // Create new user
        user = new User({
          googleId,
          email: normalizedEmail,
          firstName,
          lastName,
          emailOtp: null, // Explicitly no OTP needed for Google users
          emailOtpExpires: null,
        });
      }
      await user.save();
    }

    // Generate and store JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.tokens = user.tokens || []; // Ensure tokens array exists
    user.tokens.push({ token: jwtToken });
    await user.save();

    // Send response with success message
    res.status(200).json({
      message: 'Logged in successfully',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(400).json({ message: 'Error with Google login', error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    await sendEmail({
      email,
      subject: 'Password Reset',
      message: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.status(200).send('Password reset link sent to your email');
  } catch (err) {
    res.status(400).send('Error in forgot password: ' + err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).send('Invalid or expired reset token');

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).send('Password reset successful');
  } catch (err) {
    res.status(400).send('Error resetting password: ' + err.message);
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.tokens = user.tokens.filter(t => t.token !== req.token);
    await user.save();

    res.status(200).send('Logged out successfully');
  } catch (err) {
    res.status(400).send('Error logging out: ' + err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    res.status(400).send('Error fetching profile: ' + err.message);
  }
};