const Patient = require('../../models/Patient');
const { validationResult } = require('express-validator');

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
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching patients');
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
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
exports.createPatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    const newPatient = new Patient(req.body);
    const patient = await newPatient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while creating patient');
  }
};

// Update a patient
exports.updatePatient = async (req, res) => {
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
exports.deletePatient = async (req, res) => {
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
exports.getPatientVitals = async (req, res) => {
  res.status(200).json({ message: `Vitals for patient ${req.params.id}` });
};

// Add vital signs (placeholder)
exports.addVitalSigns = async (req, res) => {
  res.status(200).json({ message: `Vital signs added for patient ${req.params.id}` });
};

// Get patient notes (placeholder)
exports.getPatientNotes = async (req, res) => {
  res.status(200).json({ message: `Notes for patient ${req.params.id}` });
};

// Add patient note (placeholder)
exports.addPatientNote = async (req, res) => {
  res.status(200).json({ message: `Note added for patient ${req.params.id}` });
};

// Update patient status (placeholder)
exports.updatePatientStatus = async (req, res) => {
  res.status(200).json({ message: `Status updated for patient ${req.params.id}` });
};

// Search patients (placeholder)
exports.searchPatients = async (req, res) => {
  res.status(200).json({ message: `Searching patients with query: ${req.query.q}` });
};

// Filter patients by status (placeholder)
exports.filterPatientsByStatus = async (req, res) => {
  res.status(200).json({ message: `Filtering patients by status: ${req.params.status}` });
};

// Filter patients by room (placeholder)
exports.filterPatientsByRoom = async (req, res) => {
  res.status(200).json({ message: `Filtering patients by room: ${req.params.roomNumber}` });
};
