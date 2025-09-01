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

const sampleBeds = [
  {
    number: 'ICU-001',
    roomNumber: '101',
    floor: 1,
    ward: 'Cardiac ICU',
    bedType: 'ICU',
    status: 'available',
    features: {
      ventilator: true,
      monitor: true,
      oxygenSupply: true,
      suction: true
    }
  },
  {
    number: 'ICU-002',
    roomNumber: '102',
    floor: 1,
    ward: 'Cardiac ICU',
    bedType: 'ICU',
    status: 'available',
    features: {
      ventilator: true,
      monitor: true,
      oxygenSupply: true,
      suction: false
    }
  },
  {
    number: 'ICU-003',
    roomNumber: '103',
    floor: 1,
    ward: 'Cardiac ICU',
    bedType: 'ICU',
    status: 'cleaning',
    features: {
      ventilator: false,
      monitor: true,
      oxygenSupply: true,
      suction: true
    },
    lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    number: 'HDU-001',
    roomNumber: '201',
    floor: 2,
    ward: 'High Dependency Unit',
    bedType: 'HDU',
    status: 'available',
    features: {
      ventilator: false,
      monitor: true,
      oxygenSupply: true,
      suction: false
    }
  },
  {
    number: 'HDU-002',
    roomNumber: '202',
    floor: 2,
    ward: 'High Dependency Unit',
    bedType: 'HDU',
    status: 'maintenance',
    features: {
      ventilator: false,
      monitor: true,
      oxygenSupply: true,
      suction: false
    },
    notes: 'Monitor calibration required'
  },
  {
    number: 'ICU-004',
    roomNumber: '104',
    floor: 1,
    ward: 'Cardiac ICU',
    bedType: 'ICU',
    status: 'available',
    features: {
      ventilator: true,
      monitor: true,
      oxygenSupply: true,
      suction: true
    }
  },
  {
    number: 'ICU-005',
    roomNumber: '105',
    floor: 1,
    ward: 'Cardiac ICU',
    bedType: 'ICU',
    status: 'available',
    features: {
      ventilator: true,
      monitor: true,
      oxygenSupply: true,
      suction: false
    }
  },
  {
    number: 'ISO-001',
    roomNumber: '301',
    floor: 3,
    ward: 'Isolation Ward',
    bedType: 'Isolation',
    status: 'available',
    features: {
      ventilator: false,
      monitor: true,
      oxygenSupply: true,
      suction: false
    }
  }
];

const seedBeds = async () => {
  try {
    await connectDB();
    
    // Clear existing beds
    await Bed.deleteMany({});
    console.log('Cleared existing beds');
    
    // Insert sample beds
    const createdBeds = await Bed.insertMany(sampleBeds);
    console.log(`Created ${createdBeds.length} sample beds`);
    
    // Display created beds
    createdBeds.forEach(bed => {
      console.log(`✓ ${bed.number} - ${bed.ward} (${bed.status})`);
    });
    
    console.log('\nBed seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding beds:', error);
    process.exit(1);
  }
};

seedBeds();
