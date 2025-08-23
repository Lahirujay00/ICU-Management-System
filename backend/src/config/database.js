import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icu_management';
    
    const conn = await mongoose.connect(mongoURI);

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
      console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('   2. Use MongoDB Atlas with correct credentials');
      console.log('   3. Use a different cloud MongoDB service');
    }
    process.exit(1);
  }
};

export default connectDB;
