import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as authController from '../../src/controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['admin', 'doctor', 'nurse', 'staff'])
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

export default router;
