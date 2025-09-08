import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers for better resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// Connection cache for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    // Return cached connection if available
    if (cached.conn) {
      console.log('✅ Using cached MongoDB connection');
      return cached.conn;
    }

    // Return existing promise if connection is in progress
    if (cached.promise) {
      console.log('🔄 MongoDB connection in progress, waiting...');
      return cached.promise;
    }

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

    // Optimized settings for serverless
    const connectionOptions = {
      serverSelectionTimeoutMS: 15000, // Increased for serverless cold starts
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1, // Single connection for serverless
      retryWrites: true,
      w: 'majority',
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    // Create connection promise
    cached.promise = mongoose.connect(mongoURI, connectionOptions);

    // Wait for connection to complete
    const conn = await cached.promise;
    cached.conn = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events (only set once)
    if (!mongoose.connection._eventsSetup) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        // Clear cache on error
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        // Clear cache on disconnect
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      // Mark events as set up
      mongoose.connection._eventsSetup = true;
    }

    return conn;

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // Clear cache on error
    cached.conn = null;
    cached.promise = null;
    
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
    
    throw error; // Re-throw error for proper handling
  }
};

export default connectDB;
