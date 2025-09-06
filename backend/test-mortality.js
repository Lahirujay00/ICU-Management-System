import mongoose from 'mongoose';
import Patient from './src/models/Patient.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vivekprakash9:vivek123prakash@cluster0.gxpiusc.mongodb.net/icu_management?retryWrites=true&w=majority&appName=Cluster0';

async function testMortalityCalculation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see current patient statuses
    const patients = await Patient.find({});
    console.log(`📊 Total patients in database: ${patients.length}`);
    
    const statusCounts = {};
    patients.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    console.log('📋 Current patient status breakdown:', statusCounts);

    // Create a test deceased patient
    const testDeceasedPatient = new Patient({
      name: 'Test Deceased Patient',
      age: 75,
      gender: 'male',
      diagnosis: 'Cardiac Arrest',
      medicalRecordNumber: 'MRN-DECEASED-001',
      patientId: 'TEST-DECEASED-001',
      status: 'deceased',
      emergencyContact: {
        name: 'Test Contact',
        relationship: 'family',
        phone: '123-456-7890'
      }
    });

    await testDeceasedPatient.save();
    console.log('✅ Test deceased patient created successfully');

    // Now check the updated status breakdown
    const updatedPatients = await Patient.find({});
    const updatedStatusCounts = {};
    updatedPatients.forEach(p => {
      updatedStatusCounts[p.status] = (updatedStatusCounts[p.status] || 0) + 1;
    });
    console.log('📋 Updated patient status breakdown:', updatedStatusCounts);

    // Calculate mortality rate like the analytics controller does
    const totalAdmissions = updatedPatients.length;
    const deceasedPatients = updatedPatients.filter(p => p.status === 'deceased').length;
    const mortalityRate = totalAdmissions > 0 ? parseFloat(((deceasedPatients / totalAdmissions) * 100).toFixed(2)) : 0;
    
    console.log(`💊 Mortality calculation: ${deceasedPatients} deceased out of ${totalAdmissions} total patients`);
    console.log(`💊 Mortality rate: ${mortalityRate}%`);

    console.log('🧪 Test completed. You can now check the analytics dashboard to see the updated mortality rate.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testMortalityCalculation();
