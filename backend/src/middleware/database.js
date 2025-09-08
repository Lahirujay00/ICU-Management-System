import mongoose from 'mongoose';
import connectDB from '../config/database.js';

// Database connection middleware
export const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState === 1) {
      // Already connected
      return next();
    }

    // If not connected, attempt to connect
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Database not connected, attempting to connect...');
      await connectDB();
      
      // Wait for connection to be established
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 15000); // 15 second timeout

        if (mongoose.connection.readyState === 1) {
          clearTimeout(timeout);
          resolve();
        } else {
          mongoose.connection.once('connected', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          mongoose.connection.once('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        }
      });
    }

    // If still not connected after attempt, return error
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        message: 'Please try again in a moment or visit /reconnect to force reconnection'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Database middleware error:', error);
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Please try again in a moment or visit /reconnect to force reconnection',
      details: error.message
    });
  }
};

// Optional: Database connection check for health endpoints
export const checkDbConnection = (req, res, next) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  req.dbStatus = dbStatus;
  req.dbReadyState = mongoose.connection.readyState;
  next();
};
