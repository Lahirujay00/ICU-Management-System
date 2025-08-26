import Patient from '../models/Patient.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function for sending errors
const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    error: {
      message,
      ...(errors && { details: errors.array() })
    }
  });
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    // Check if MongoDB is connected using mongoose connection state
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    console.log('GET Patients - MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, returning mock data');
      
      // Return mock data for testing
      const mockPatients = [
        {
          _id: 'mock_1',
          name: 'John Doe',
          age: 45,
          gender: 'male',
          bedNumber: 'ICU-001',
          roomNumber: 'ICU-001',
          diagnosis: 'Acute respiratory failure',
          attendingPhysician: 'Dr. Smith',
          status: 'stable',
          admissionDate: new Date('2024-01-15'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: 'mock_2',
          name: 'Jane Smith',
          age: 32,
          gender: 'female',
          bedNumber: 'ICU-002',
          roomNumber: 'ICU-002',
          diagnosis: 'Post-surgical monitoring',
          attendingPhysician: 'Dr. Johnson',
          status: 'improving',
          admissionDate: new Date('2024-01-16'),
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16')
        }
      ];
      
      return res.json(mockPatients);
    }
    
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error('Error in getAllPatients:', err.message);
    sendError(res, 500, 'Server error while fetching patients');
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching patient');
  }
};

// Create a new patient
export const createPatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    console.log('Received patient data:', req.body);
    
    // Check if MongoDB is connected using mongoose connection state
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Is MongoDB connected:', isMongoConnected);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response for testing');
      
      // Return a mock response for testing
      const mockPatient = {
        _id: 'mock_' + Date.now(),
        ...req.body,
        roomNumber: req.body.bedNumber || req.body.roomNumber,
        bedNumber: req.body.bedNumber || req.body.roomNumber,
        admissionDate: req.body.admissionDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Mock patient created:', mockPatient._id);
      return res.status(201).json({
        success: true,
        message: 'Patient data received (MongoDB not connected - using mock data)',
        data: mockPatient
      });
    }
    
    // Map frontend fields to backend model fields
    const patientData = {
      ...req.body,
      roomNumber: req.body.bedNumber || req.body.roomNumber, // Map bedNumber to roomNumber
      bedNumber: req.body.bedNumber || req.body.roomNumber, // Ensure bedNumber is also set
      admissionDate: req.body.admissionDate || new Date()
    };
    
    console.log('Mapped patient data:', patientData);
    
    const newPatient = new Patient(patientData);
    const patient = await newPatient.save();
    
    console.log('Patient saved successfully:', patient._id);
    res.status(201).json(patient);
  } catch (err) {
    console.error('Error creating patient:', err);
    if (err.name === 'ValidationError') {
      return sendError(res, 400, 'Validation error', { array: () => Object.keys(err.errors).map(key => ({ msg: err.errors[key].message, param: key })) });
    }
    if (err.code === 11000) {
      return sendError(res, 400, 'Patient with this ID already exists');
    }
    sendError(res, 500, 'Server error while creating patient');
  }
};

// Update a patient
export const updatePatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    console.log('UPDATE Patient - MongoDB connection state:', mongoose.connection.readyState);
    console.log('Update request for patient ID:', req.params.id);
    console.log('Update data:', req.body);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response for testing');
      
      // Return a mock successful response for testing
      const mockUpdatedPatient = {
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date()
      };
      
      console.log('Mock patient updated:', req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Patient data updated (MongoDB not connected - using mock data)',
        data: mockUpdatedPatient
      });
    }

    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log('Patient updated successfully:', patient._id);
    res.json(patient);
  } catch (err) {
    console.error('Error updating patient:', err.message);
    sendError(res, 500, 'Server error while updating patient');
  }
};

// Delete a patient
export const deletePatient = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    console.log('DELETE Patient - MongoDB connection state:', mongoose.connection.readyState);
    console.log('Delete request for patient ID:', req.params.id);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response for testing');
      
      // Return a mock successful response for testing
      console.log('Mock patient deleted:', req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Patient deleted (MongoDB not connected - using mock data)'
      });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    await Patient.findByIdAndDelete(req.params.id);
    console.log('Patient deleted successfully:', req.params.id);
    res.json({ message: 'Patient removed' });
  } catch (err) {
    console.error('Error deleting patient:', err.message);
    sendError(res, 500, 'Server error while deleting patient');
  }
};

// Get patient vitals (placeholder)
export const getPatientVitals = async (req, res) => {
  res.status(200).json({ message: `Vitals for patient ${req.params.id}` });
};

// Add vital signs (placeholder)
export const addVitalSigns = async (req, res) => {
  res.status(200).json({ message: `Vital signs added for patient ${req.params.id}` });
};

// Get patient notes (placeholder)
export const getPatientNotes = async (req, res) => {
  res.status(200).json({ message: `Notes for patient ${req.params.id}` });
};

// Add patient note (placeholder)
export const addPatientNote = async (req, res) => {
  res.status(200).json({ message: `Note added for patient ${req.params.id}` });
};

// Update patient status (placeholder)
export const updatePatientStatus = async (req, res) => {
  res.status(200).json({ message: `Status updated for patient ${req.params.id}` });
};

// Search patients (placeholder)
export const searchPatients = async (req, res) => {
  res.status(200).json({ message: `Searching patients with query: ${req.query.q}` });
};

// Filter patients by status (placeholder)
export const filterPatientsByStatus = async (req, res) => {
  res.status(200).json({ message: `Filtering patients by status: ${req.params.status}` });
};

// Filter patients by room (placeholder)
export const filterPatientsByRoom = async (req, res) => {
  res.status(200).json({ message: `Filtering patients by room: ${req.params.roomNumber}` });
};
