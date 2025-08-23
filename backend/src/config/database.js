import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icu_management';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('🔗 Connection string:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // If Atlas fails, suggest alternatives
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.log('💡 MongoDB Atlas connection failed. This could be due to:');
      console.log('   - Network connectivity issues');
      console.log('   - Incorrect connection string');
      console.log('   - IP whitelist restrictions');
      console.log('   - Cluster sleeping (free tier)');
      console.log('');
      console.log('🔧 Alternatives:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas cluster is running');
      console.log('   3. Check IP whitelist settings in MongoDB Atlas');
      console.log('   4. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('   5. Use MongoDB Compass to test connection');
    }
    
    console.log('⚠️ Server will continue running without database connection');
    console.log('🔧 Fix the database connection to save patient data');
    // Don't exit, let the server run for testing
  }
};

export default connectDB;
