import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers for better resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icu_management';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('🔗 Connection string:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    // Test DNS resolution for Atlas connections
    if (mongoURI.includes('mongodb+srv://')) {
      const hostname = mongoURI.match(/@([^/]+)/)?.[1];
      if (hostname) {
        console.log('🔍 Testing DNS resolution for:', hostname);
        try {
          const addresses = await dns.promises.resolve(hostname);
          console.log('✅ DNS resolved successfully:', addresses.slice(0, 2).join(', '));
        } catch (dnsError) {
          console.log('⚠️ DNS resolution issue:', dnsError.message);
          console.log('💡 Trying with different DNS servers...');
        }
      }
    }
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
      setTimeout(() => {
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
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
