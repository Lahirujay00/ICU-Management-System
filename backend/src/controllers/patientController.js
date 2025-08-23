import Patient from '../models/Patient.js';
import { validationResult } from 'express-validator';

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
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error(err.message);
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
    // Map frontend fields to backend model fields
    const patientData = {
      ...req.body,
      roomNumber: req.body.bedNumber || req.body.roomNumber, // Map bedNumber to roomNumber
      admissionDate: req.body.admissionDate || new Date()
    };
    
    const newPatient = new Patient(patientData);
    const patient = await newPatient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error('Error creating patient:', err.message);
    if (err.name === 'ValidationError') {
      return sendError(res, 400, 'Validation error', { array: () => Object.keys(err.errors).map(key => ({ msg: err.errors[key].message, param: key })) });
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
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while updating patient');
  }
};

// Delete a patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient removed' });
  } catch (err) {
    console.error(err.message);
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
