import express from 'express';
const router = express.Router();
import Patient from '../models/Patient.js';
import mongoose from 'mongoose';

// Get all discharge records
export const getDischargeHistory = async (req, res) => {
  try {
    console.log('Getting discharge history...');
    
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, returning empty array');
      return res.json([]);
    }

    // Find all discharged patients
    const dischargedPatients = await Patient.find({ 
      status: 'discharged',
      dischargeDate: { $exists: true }
    }).sort({ dischargeDate: -1 });

    // Transform to discharge history format
    const dischargeHistory = dischargedPatients.map(patient => ({
      id: patient._id,
      patientId: patient.patientId || patient._id,
      patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
      age: patient.age,
      gender: patient.gender,
      bedNumber: patient.bedNumber,
      dischargeDate: patient.dischargeDate,
      dischargeType: getDischargeTypeFromReason(patient.dischargeReason),
      dischargeReason: patient.dischargeReason,
      dischargedBy: patient.dischargedBy || 'ICU Staff',
      destination: patient.destination || getDefaultDestination(patient.dischargeReason),
      duration: patient.admissionDate ? calculateDuration(patient.admissionDate, patient.dischargeDate) : 'N/A',
      diagnosis: patient.diagnosis,
      procedures: patient.procedures?.join(', ') || 'N/A',
      notes: patient.dischargeNotes || 'No additional notes'
    }));

    console.log(`✅ Found ${dischargeHistory.length} discharge records`);
    res.json(dischargeHistory);
  } catch (err) {
    console.error('❌ Error fetching discharge history:', err.message);
    res.status(500).json({
      error: {
        message: 'Server error while fetching discharge history'
      }
    });
  }
};

// Helper function to map discharge reason to discharge type
const getDischargeTypeFromReason = (reason) => {
  switch (reason) {
    case 'discharged':
      return 'Normal Discharge';
    case 'transfer':
      return 'Critical Transfer';
    case 'death':
      return 'Deceased';
    case 'against_medical_advice':
      return 'Against Medical Advice';
    default:
      return 'Normal Discharge';
  }
};

// Helper function to get default destination
const getDefaultDestination = (reason) => {
  switch (reason) {
    case 'discharged':
      return 'Home';
    case 'transfer':
      return 'Another Facility';
    case 'death':
      return 'N/A';
    case 'against_medical_advice':
      return 'Home (AMA)';
    default:
      return 'Home';
  }
};

// Helper function to calculate duration
const calculateDuration = (admissionDate, dischargeDate) => {
  const admission = new Date(admissionDate);
  const discharge = new Date(dischargeDate);
  const diffTime = Math.abs(discharge - admission);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day';
  } else if (diffDays < 7) {
    return `${diffDays} days`;
  } else {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${weeks} week${weeks > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  }
};

// Delete a discharge record
export const deleteDischargeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of deleting the patient, we could mark it as archived
    // or remove the discharge info to "undo" the discharge
    const patient = await Patient.findByIdAndUpdate(id, {
      $unset: {
        dischargeDate: 1,
        dischargeReason: 1,
        dischargeNotes: 1,
        dischargedBy: 1
      },
      status: 'stable' // Reset to stable status
    });

    if (!patient) {
      return res.status(404).json({
        error: { message: 'Discharge record not found' }
      });
    }

    res.json({ message: 'Discharge record deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting discharge record:', err.message);
    res.status(500).json({
      error: { message: 'Server error while deleting discharge record' }
    });
  }
};

// Routes
router.get('/', getDischargeHistory);
router.delete('/:id', deleteDischargeRecord);

export default router;
