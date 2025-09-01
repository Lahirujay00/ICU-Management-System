import Bed from '../models/Bed.js';
import Patient from '../models/Patient.js';
import Staff from '../models/Staff.js';
import mongoose from 'mongoose';

// Get all beds with patient assignments from patient table
export const getAllBeds = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    // Get all beds
    const beds = await Bed.find(query).sort({ number: 1 });
    
    // Get all patients with bed assignments
    const patients = await Patient.find({ 
      bedNumber: { $exists: true, $ne: null },
      status: { $ne: 'discharged' }
    }).select('name age diagnosis status admissionDate medicalRecordNumber bedNumber');
    
    // Create a map of bed assignments from patients
    const bedAssignments = {};
    patients.forEach(patient => {
      bedAssignments[patient.bedNumber] = patient;
    });
    
    // Combine bed info with patient assignments
    const bedsWithPatients = beds.map(bed => {
      const patient = bedAssignments[bed.number];
      
      // Update bed status based on patient assignment
      let bedStatus = bed.status;
      if (patient && bedStatus === 'available') {
        bedStatus = 'occupied';
      }
      
      return {
        ...bed.toObject(),
        status: bedStatus,
        patient: patient || null
      };
    });
    
    res.json(bedsWithPatients);
  } catch (error) {
    console.error('Error getting beds:', error);
    res.status(500).json({ error: { message: 'Failed to get beds' } });
  }
};

// Get bed by ID
export const getBedById = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate('patient', 'name age diagnosis status admissionDate medicalRecordNumber')
      .populate('assignedNurse', 'name email phone')
      .populate('equipment', 'name type status');
    
    if (!bed) {
      return res.status(404).json({ error: { message: 'Bed not found' } });
    }
    
    res.json(bed);
  } catch (error) {
    console.error('Error getting bed:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: { message: 'Bed not found' } });
    }
    res.status(500).json({ error: { message: 'Failed to get bed' } });
  }
};

// Create new bed
export const createBed = async (req, res) => {
  try {
    const {
      number,
      roomNumber,
      floor,
      ward,
      bedType,
      features,
      assignedNurse,
      equipment
    } = req.body;
    
    // Check if bed number already exists
    const existingBed = await Bed.findOne({ number });
    if (existingBed) {
      return res.status(400).json({ 
        error: { message: 'Bed number already exists' } 
      });
    }
    
    const bed = new Bed({
      number,
      roomNumber,
      floor,
      ward,
      bedType,
      features,
      assignedNurse,
      equipment
    });
    
    const savedBed = await bed.save();
    const populatedBed = await Bed.findById(savedBed._id)
      .populate('assignedNurse', 'name email')
      .populate('equipment', 'name type');
    
    res.status(201).json(populatedBed);
  } catch (error) {
    console.error('Error creating bed:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: { message: 'Bed number already exists' } 
      });
    }
    res.status(400).json({ error: { message: error.message } });
  }
};

// Update bed
export const updateBed = async (req, res) => {
  try {
    const {
      number,
      roomNumber,
      floor,
      ward,
      bedType,
      features,
      assignedNurse,
      equipment,
      notes
    } = req.body;
    
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      {
        number,
        roomNumber,
        floor,
        ward,
        bedType,
        features,
        assignedNurse,
        equipment,
        notes
      },
      { new: true, runValidators: true }
    )
    .populate('patient', 'name age diagnosis status')
    .populate('assignedNurse', 'name email')
    .populate('equipment', 'name type');
    
    if (!bed) {
      return res.status(404).json({ error: { message: 'Bed not found' } });
    }
    
    res.json(bed);
  } catch (error) {
    console.error('Error updating bed:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: { message: 'Bed number already exists' } 
      });
    }
    res.status(400).json({ error: { message: error.message } });
  }
};

// Delete bed
export const deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    
    if (!bed) {
      return res.status(404).json({ error: { message: 'Bed not found' } });
    }
    
    // Check if bed is occupied
    if (bed.status === 'occupied' || bed.patient) {
      return res.status(400).json({ 
        error: { message: 'Cannot delete occupied bed. Discharge patient first.' } 
      });
    }
    
    await Bed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bed deleted successfully' });
  } catch (error) {
    console.error('Error deleting bed:', error);
    res.status(500).json({ error: { message: 'Failed to delete bed' } });
  }
};

// Assign patient to bed
export const assignPatientToBed = async (req, res) => {
  try {
    const { patientId } = req.body;
    const bedId = req.params.id;
    
    if (!patientId) {
      return res.status(400).json({ 
        error: { message: 'Patient ID is required' } 
      });
    }
    
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Find the bed
        const bed = await Bed.findById(bedId).session(session);
        if (!bed) {
          throw new Error('Bed not found');
        }
        
        // Check if bed is available
        if (bed.status !== 'available') {
          throw new Error('Bed is not available for assignment');
        }
        
        // Check if another patient is already assigned to this bed
        const existingPatientInBed = await Patient.findOne({ bedNumber: bed.number }).session(session);
        if (existingPatientInBed) {
          throw new Error('Another patient is already assigned to this bed');
        }
        
        // Find the patient
        const patient = await Patient.findById(patientId).session(session);
        if (!patient) {
          throw new Error('Patient not found');
        }
        
        // Check if patient is already assigned to a bed
        if (patient.bedNumber) {
          throw new Error('Patient is already assigned to another bed');
        }
        
        // Assign patient to bed
        patient.bedNumber = bed.number;
        patient.roomNumber = bed.roomNumber;
        await patient.save({ session });
        
        // Set bed status to occupied
        bed.status = 'occupied';
        await bed.save({ session });
      });
      
      // Return updated bed with patient info
      const updatedBed = await Bed.findById(bedId);
      const patient = await Patient.findOne({ bedNumber: updatedBed.number })
        .select('name age diagnosis status admissionDate medicalRecordNumber');
      
      res.json({
        ...updatedBed.toObject(),
        patient: patient
      });
      
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error('Error assigning patient to bed:', error);
    res.status(400).json({ error: { message: error.message } });
  }
};

// Discharge patient from bed and set bed to cleaning
export const dischargePatientFromBed = async (req, res) => {
  try {
    const bedId = req.params.id;
    
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const bed = await Bed.findById(bedId).session(session);
        if (!bed) {
          throw new Error('Bed not found');
        }
        
        // Find patient assigned to this bed
        const patient = await Patient.findOne({ bedNumber: bed.number }).session(session);
        if (!patient) {
          throw new Error('No patient assigned to this bed');
        }
        
        // Update patient record - remove bed assignment
        patient.bedNumber = null;
        patient.roomNumber = null;
        await patient.save({ session });
        
        // Set bed to cleaning status
        bed.status = 'cleaning';
        await bed.save({ session });
      });
      
      const updatedBed = await Bed.findById(bedId);
      res.json(updatedBed);
      
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error('Error discharging patient from bed:', error);
    res.status(400).json({ error: { message: error.message } });
  }
};

// Update bed status
export const updateBedStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bedId = req.params.id;
    
    if (!status || !['available', 'occupied', 'cleaning', 'maintenance'].includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid status. Must be: available, occupied, cleaning, or maintenance' } 
      });
    }
    
    const bed = await Bed.findById(bedId);
    if (!bed) {
      return res.status(404).json({ error: { message: 'Bed not found' } });
    }
    
    // Handle status-specific logic
    switch (status) {
      case 'available':
        if (bed.status === 'cleaning') {
          await bed.completeCleaning();
        } else if (bed.status === 'maintenance') {
          await bed.completeMaintenance();
        } else {
          bed.status = status;
          await bed.save();
        }
        break;
        
      case 'cleaning':
        bed.status = status;
        await bed.save();
        break;
        
      case 'maintenance':
        await bed.markForMaintenance(req.body.notes || '');
        break;
        
      case 'occupied':
        if (!bed.patient) {
          return res.status(400).json({ 
            error: { message: 'Cannot mark bed as occupied without a patient assignment' } 
          });
        }
        bed.status = status;
        await bed.save();
        break;
    }
    
    const updatedBed = await Bed.findById(bedId)
      .populate('patient', 'name age diagnosis status')
      .populate('assignedNurse', 'name email');
    
    res.json(updatedBed);
  } catch (error) {
    console.error('Error updating bed status:', error);
    res.status(400).json({ error: { message: error.message } });
  }
};

// Get bed statistics
export const getBedStats = async (req, res) => {
  try {
    // Get all beds
    const beds = await Bed.find().sort({ number: 1 });
    
    // Get occupied beds from patients
    const occupiedBedNumbers = await Patient.find({ 
      bedNumber: { $exists: true, $ne: null },
      status: { $ne: 'discharged' }
    }).distinct('bedNumber');
    
    const stats = {
      total: beds.length,
      available: 0,
      occupied: occupiedBedNumbers.length,
      cleaning: 0,
      maintenance: 0
    };
    
    // Count bed statuses
    beds.forEach(bed => {
      if (occupiedBedNumbers.includes(bed.number)) {
        // Don't count as available if patient is assigned
        return;
      }
      
      switch (bed.status) {
        case 'available':
          stats.available++;
          break;
        case 'cleaning':
          stats.cleaning++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
      }
    });
    
    // Calculate occupancy rate
    const occupancyRate = ((stats.occupied / stats.total) * 100).toFixed(1);
    
    res.json({
      overall: stats,
      occupancyRate: occupancyRate,
      bedDetails: beds.map(bed => ({
        number: bed.number,
        status: occupiedBedNumbers.includes(bed.number) ? 'occupied' : bed.status
      }))
    });
  } catch (error) {
    console.error('Error getting bed stats:', error);
    res.status(500).json({ error: { message: 'Failed to get bed statistics' } });
  }
};

// Get available beds
export const getAvailableBeds = async (req, res) => {
  try {
    const { bedType } = req.query;
    const beds = await Bed.findAvailable(bedType);
    res.json(beds);
  } catch (error) {
    console.error('Error getting available beds:', error);
    res.status(500).json({ error: { message: 'Failed to get available beds' } });
  }
};
