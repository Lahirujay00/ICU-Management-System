import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icu_management';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Migration function
const migrateStaff = async () => {
  try {
    console.log('🔄 Starting staff migration...');
    
    // Update all staff records that don't have isOnDuty field
    const result = await mongoose.connection.db.collection('staffs').updateMany(
      { isOnDuty: { $exists: false } }, // Find docs without isOnDuty field
      { 
        $set: { 
          isOnDuty: false // Set default value to false
        } 
      }
    );
    
    console.log(`✅ Migration completed: ${result.modifiedCount} staff records updated`);
    
    // Show current staff data
    const allStaff = await mongoose.connection.db.collection('staffs').find({}).toArray();
    console.log('\n📊 Current staff data:');
    allStaff.forEach(staff => {
      console.log(`- ${staff.firstName} ${staff.lastName}: isOnDuty = ${staff.isOnDuty}, currentShift = ${staff.currentShift}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔄 Database connection closed');
    process.exit(0);
  }
};

// Run migration
(async () => {
  await connectDB();
  await migrateStaff();
})();
