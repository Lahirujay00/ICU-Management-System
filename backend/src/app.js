import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import 'dotenv/config';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import staffRoutes from './routes/staff.js';
import equipmentRoutes from './routes/equipment.js';
import dashboardRoutes from './routes/dashboard.js';
import dischargeHistoryRoutes from './routes/dischargeHistory.js';
import bedRoutes from './routes/beds.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://icu-management-system-front.vercel.app',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Root route - API welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ICU Management System API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      patients: '/api/patients',
      staff: '/api/staff',
      equipment: '/api/equipment',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'Not connected'
    }
  });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'ICU Management System API',
    version: '1.0.0',
    documentation: 'API endpoints available',
    endpoints: [
      'GET /api/auth - Authentication endpoints',
      'GET /api/patients - Patient management',
      'GET /api/staff - Staff management', 
      'GET /api/equipment - Equipment tracking',
      'GET /api/dashboard - Dashboard data',
      'GET /api/analytics - Analytics data'
    ]
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discharge-history', dischargeHistoryRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
