import mongoose from 'mongoose';
import 'dotenv/config';
import Bed from './src/models/Bed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const icuBeds = Array.from({ length: 12 }, (_, index) => ({
  number: `BED-${String(index + 1).padStart(2, '0')}`,
  roomNumber: null, // No room numbers as requested
  floor: 1,
  ward: 'ICU',
  bedType: 'ICU',
  status: 'available',
  features: {
    ventilator: true,
    monitor: true,
    oxygenSupply: true,
    suction: true
  }
}));

const setupICUBeds = async () => {
  try {
    await connectDB();
    
    // Clear existing beds
    await Bed.deleteMany({});
    console.log('Cleared existing beds');
    
    // Insert 12 ICU beds
    const createdBeds = await Bed.insertMany(icuBeds);
    console.log(`Created ${createdBeds.length} ICU beds`);
    
    // Display created beds
    createdBeds.forEach(bed => {
      console.log(`✓ ${bed.number} - ${bed.ward} (${bed.status})`);
    });
    
    console.log('\n✅ ICU bed setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up ICU beds:', error);
    process.exit(1);
  }
};

setupICUBeds();
