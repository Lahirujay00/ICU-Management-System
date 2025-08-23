import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Helper function for sending errors
const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    error: {
      message,
      ...(errors && { details: errors.array() })
    }
  });
};

// Register a new user
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  const { name, email, password, role, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff', // Default role
      department
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error during registration');
  }
};

// Login user
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 400, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 400, 'Invalid credentials');
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        department: user.department
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error during login');
  }
};

// Forgot password (placeholder)
export const forgotPassword = async (req, res) => {
  // In a real application, this would send an email with a reset link
  res.status(200).json({ message: 'Password reset link sent to your email (if registered)' });
};

// Reset password (placeholder)
export const resetPassword = async (req, res) => {
  // In a real application, this would verify token and update password
  res.status(200).json({ message: 'Password has been reset' });
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching profile');
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  const { name, email, department } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while updating profile');
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 400, 'Invalid current password');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while changing password');
  }
};

// Logout user (client-side token removal)
export const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
