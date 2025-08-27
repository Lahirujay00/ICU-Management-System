import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
    try {
        console.log('🔄 Testing MongoDB Atlas connection...');
        console.log('🔗 Connection URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@'));
        
        // Connect with detailed options
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });
        
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log('📊 Database:', connection.connection.db.databaseName);
        console.log('🏠 Host:', connection.connection.host);
        console.log('🔌 Port:', connection.connection.port);
        
        // Test basic operations
        const collections = await connection.connection.db.listCollections().toArray();
        console.log('📚 Available collections:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected successfully');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('🔍 Error details:', error);
        
        // Provide specific troubleshooting
        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 DNS Resolution failed. Possible solutions:');
            console.log('   1. Check your internet connection');
            console.log('   2. Try using a different DNS server (8.8.8.8, 1.1.1.1)');
            console.log('   3. Restart your network adapter');
            console.log('   4. Check if your ISP blocks MongoDB Atlas');
        }
        
        if (error.message.includes('authentication')) {
            console.log('💡 Authentication failed. Check:');
            console.log('   1. Username and password in connection string');
            console.log('   2. Database user permissions');
        }
        
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            console.log('💡 Connection timeout. Check:');
            console.log('   1. Network firewall settings');
            console.log('   2. MongoDB Atlas IP whitelist');
            console.log('   3. VPN or proxy settings');
        }
        
        process.exit(1);
    }
}

testConnection();
