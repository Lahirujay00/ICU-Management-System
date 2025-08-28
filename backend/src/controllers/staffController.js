import Staff from '../models/Staff.js';
import mongoose from 'mongoose';
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

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    console.log('Getting all staff...');
    
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, returning empty array');
      return res.json([]);
    }

    const staff = await Staff.find().select('-password');
    console.log(`✅ Found ${staff.length} staff members in database`);
    res.json(staff);
  } catch (err) {
    console.error('❌ Error fetching staff:', err.message);
    console.error('Full error:', err);
    sendError(res, 500, 'Server error while fetching staff');
  }
};

// Get staff by ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching staff');
  }
};

// Create a new staff member
export const createStaff = async (req, res) => {
  console.log('🔧 BACKEND: Received staff creation request')
  console.log('Request body:', req.body)
  console.log('Request headers:', req.headers)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ BACKEND: Validation errors:', errors.array())
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    console.log('Received staff data:', req.body);
    
    // Check if MongoDB is connected using mongoose connection state
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Is MongoDB connected:', isMongoConnected);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response for testing');
      
      // Return a mock response for testing
      const mockStaff = {
        _id: 'mock_' + Date.now(),
        ...req.body,
        name: `${req.body.firstName} ${req.body.lastName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnDuty: req.body.isOnDuty || false,
        currentShift: req.body.currentShift || 'off',
        status: req.body.status || 'active',
        assignedPatients: req.body.assignedPatients || 0,
        hireDate: req.body.hireDate || new Date(),
        yearsOfService: req.body.yearsOfService || 0
      };
      
      console.log('✅ Created mock staff:', mockStaff);
      return res.status(201).json(mockStaff);
    }

    // MongoDB is connected, proceed with normal database operations
    console.log('🔍 BACKEND: Checking for existing staff with email:', req.body.email)
    let staff = await Staff.findOne({ email: req.body.email });
    if (staff) {
      console.log('❌ BACKEND: Staff with email already exists:', req.body.email)
      return sendError(res, 400, 'Staff member with this email already exists');
    }

    console.log('🔧 BACKEND: Creating new staff member')
    
    // Clean and prepare the staff data
    const staffData = {
      ...req.body,
      // Ensure assignedPatients is an array of ObjectIds, not a number
      assignedPatients: [],
      // Convert yearsOfService to number if it's a string
      yearsOfService: Number(req.body.yearsOfService) || 0,
      // Ensure assignedPatients count is not included in the model data
      // (this is probably a frontend field for display purposes)
    };
    
    // Remove any fields that might cause confusion
    delete staffData.assignedPatientsCount;
    
    console.log('🔧 BACKEND: Cleaned staff data:', staffData);
    
    const newStaff = new Staff(staffData);
    staff = await newStaff.save();
    console.log('✅ Created staff in database:', staff);
    res.status(201).json(staff);
  } catch (err) {
    console.error('❌ Error creating staff:', err.message);
    console.error('Full error:', err);
    sendError(res, 500, 'Server error while creating staff');
  }
};

// Update a staff member
export const updateStaff = async (req, res) => {
  console.log('🔧 BACKEND: Received staff update request for ID:', req.params.id)
  console.log('Update data:', req.body)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ BACKEND: Validation errors:', errors.array())
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response for testing');
      
      // Return a mock updated response
      const mockUpdatedStaff = {
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date()
      };
      
      console.log('✅ Mock updated staff:', mockUpdatedStaff);
      return res.json(mockUpdatedStaff);
    }

    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log('❌ BACKEND: Staff not found with ID:', req.params.id)
      return sendError(res, 404, 'Staff not found');
    }

    console.log('🔧 BACKEND: Updating staff member')
    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    console.log('✅ Updated staff in database:', staff);
    res.json(staff);
  } catch (err) {
    console.error('❌ Error updating staff:', err.message);
    console.error('Full error:', err);
    sendError(res, 500, 'Server error while updating staff');
  }
};

// Delete a staff member
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member removed' });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while deleting staff');
  }
};

// Get staff schedule (placeholder)
export const getStaffSchedule = async (req, res) => {
  res.status(200).json({ message: `Schedule for staff ${req.params.id}` });
};

// Update staff schedule (placeholder)
export const updateStaffSchedule = async (req, res) => {
  res.status(200).json({ message: `Schedule updated for staff ${req.params.id}` });
};

// Get staff's patients (placeholder)
export const getStaffPatients = async (req, res) => {
  res.status(200).json({ message: `Patients for staff ${req.params.id}` });
};

// Update staff status (placeholder)
export const updateStaffStatus = async (req, res) => {
  res.status(200).json({ message: `Status updated for staff ${req.params.id}` });
};

// Search staff (placeholder)
export const searchStaff = async (req, res) => {
  res.status(200).json({ message: `Searching staff with query: ${req.query.q}` });
};

// Filter staff by role (placeholder)
export const filterStaffByRole = async (req, res) => {
  res.status(200).json({ message: `Filtering staff by role: ${req.params.role}` });
};

// Filter staff by department (placeholder)
export const filterStaffByDepartment = async (req, res) => {
  res.status(200).json({ message: `Filtering staff by department: ${req.params.department}` });
};

// Get departments (placeholder)
export const getDepartments = async (req, res) => {
  res.status(200).json({ message: 'List of departments' });
};

// Create department (placeholder)
export const createDepartment = async (req, res) => {
  res.status(200).json({ message: 'Department created' });
};
