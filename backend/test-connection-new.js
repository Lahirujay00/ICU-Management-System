/**
 * Test script for database connection
 * Run this to test the new database connection logic locally
 */

import connectDB from './src/config/database.js';
import mongoose from 'mongoose';

async function testConnection() {
  console.log('🧪 Testing database connection logic...');
  
  try {
    // Test 1: Initial connection
    console.log('\n📋 Test 1: Initial connection');
    await connectDB();
    console.log('✅ Initial connection successful');
    
    // Test 2: Cached connection
    console.log('\n📋 Test 2: Cached connection');
    await connectDB();
    console.log('✅ Cached connection successful');
    
    // Test 3: Connection state
    console.log('\n📋 Test 3: Connection state');
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    
    // Test 4: Disconnect and reconnect
    console.log('\n📋 Test 4: Disconnect and reconnect');
    await mongoose.disconnect();
    console.log('Disconnected');
    
    // Clear cache
    if (global.mongoose) {
      global.mongoose.conn = null;
      global.mongoose.promise = null;
    }
    
    await connectDB();
    console.log('✅ Reconnection successful');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔄 Disconnected');
    process.exit(0);
  }
}

testConnection();
