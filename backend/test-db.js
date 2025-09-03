import mongoose from 'mongoose';
import Patient from './src/models/Patient.js';
import Equipment from './src/models/Equipment.js';
import Bed from './src/models/Bed.js';

const MONGODB_URI = 'mongodb+srv://Admin:26244@cluster0.gxpiusc.mongodb.net/icu_management?retryWrites=true&w=majority&appName=Cluster0&serverSelectionTimeoutMS=30000&connectTimeoutMS=30000&socketTimeoutMS=30000';

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const patients = await Patient.find({});
    const equipment = await Equipment.find({});
    const beds = await Bed.find({});

    console.log('\n=== DATABASE CONTENTS ===');
    console.log(`📋 Patients: ${patients.length} total`);
    patients.forEach(p => console.log(`- ${p.name} | Status: ${p.status} | Age: ${p.age}`));

    console.log(`\n🔧 Equipment: ${equipment.length} total`);
    equipment.forEach(e => console.log(`- ${e.name} | Status: ${e.status}`));

    console.log(`\n🛏️ Beds: ${beds.length} total`);
    beds.forEach(b => console.log(`- Bed ${b.number} | Status: ${b.status}`));

    // Calculate actual statistics
    const activePatients = patients.filter(p => ['active', 'stable', 'critical'].includes(p.status)).length;
    const deceasedPatients = patients.filter(p => p.status === 'deceased').length;
    const recoveredPatients = patients.filter(p => ['recovered', 'discharged'].includes(p.status)).length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const availableBeds = beds.filter(b => b.status === 'available').length;

    console.log('\n=== CALCULATED ANALYTICS ===');
    console.log(`👥 Active Patients: ${activePatients}`);
    console.log(`⚰️ Deceased Patients: ${deceasedPatients}`);
    console.log(`✅ Recovered Patients: ${recoveredPatients}`);
    console.log(`🛏️ Occupied Beds: ${occupiedBeds}/${beds.length}`);
    console.log(`📊 Bed Utilization: ${beds.length > 0 ? Math.round((occupiedBeds / beds.length) * 100) : 0}%`);
    console.log(`📈 Mortality Rate: ${patients.length > 0 ? ((deceasedPatients / patients.length) * 100).toFixed(2) : 0}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();
