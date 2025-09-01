import mongoose from 'mongoose';
import 'dotenv/config';
import Patient from './src/models/Patient.js';

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

const updatePatients = async () => {
  try {
    await connectDB();
    
    // Get all patients without medical record numbers
    const patients = await Patient.find({ 
      $or: [
        { medicalRecordNumber: { $exists: false } },
        { medicalRecordNumber: null },
        { medicalRecordNumber: '' }
      ]
    });
    
    console.log(`Found ${patients.length} patients without medical record numbers`);
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const mrn = `MRN${String(Date.now() + i).slice(-8)}`;
      
      patient.medicalRecordNumber = mrn;
      patient.bedNumber = null; // Reset bed number to null for existing patients
      
      await patient.save();
      console.log(`Updated ${patient.name} with MRN: ${mrn}`);
    }
    
    console.log('\nPatient update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating patients:', error);
    process.exit(1);
  }
};

updatePatients();
