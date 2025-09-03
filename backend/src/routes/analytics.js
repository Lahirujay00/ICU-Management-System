import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
// import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Analytics routes
router.get('/', getAnalytics); // Removed auth middleware for development

export default router;
