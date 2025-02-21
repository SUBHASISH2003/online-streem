import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  emailOtp: {
    type: String, // Stores OTP for email verification
  },
  emailOtpExpires: {
    type: Date, // Expiration time for OTP
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }], // For token invalidation (logout)
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);