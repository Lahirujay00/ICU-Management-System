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

// Get staff schedule
export const getStaffSchedule = async (req, res) => {
  console.log('🔧 BACKEND: Received get schedule request for staff ID:', req.params.id);
  
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, returning empty schedule');
      return res.json({});
    }

    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log('❌ BACKEND: Staff not found with ID:', req.params.id);
      return sendError(res, 404, 'Staff not found');
    }

    // Convert Map to plain object for JSON response
    const schedules = staff.calendarSchedules ? Object.fromEntries(staff.calendarSchedules) : {};
    console.log('✅ Retrieved calendar schedules for staff:', schedules);
    res.json(schedules);
  } catch (err) {
    console.error('❌ Error fetching staff schedule:', err.message);
    sendError(res, 500, 'Server error while fetching schedule');
  }
};

// Update staff schedule
export const updateStaffSchedule = async (req, res) => {
  console.log('🔧 BACKEND: Received schedule update request for staff ID:', req.params.id);
  console.log('Schedule data:', req.body);
  
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, using mock response');
      return res.json({ message: `Mock: Schedule updated for staff ${req.params.id}`, schedules: req.body });
    }

    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log('❌ BACKEND: Staff not found with ID:', req.params.id);
      return sendError(res, 404, 'Staff not found');
    }

    // Update the calendarSchedules field (convert object to Map)
    staff.calendarSchedules = new Map(Object.entries(req.body));
    await staff.save();
    
    const savedSchedules = Object.fromEntries(staff.calendarSchedules);
    console.log('✅ Calendar schedule updated in database:', savedSchedules);
    res.json({ message: `Schedule updated for staff ${req.params.id}`, schedules: savedSchedules });
  } catch (err) {
    console.error('❌ Error updating staff schedule:', err.message);
    sendError(res, 500, 'Server error while updating schedule');
  }
};

// Get staff's patients (placeholder)
export const getStaffPatients = async (req, res) => {
  res.status(200).json({ message: `Patients for staff ${req.params.id}` });
};

// Update staff status (duty status, shift)
export const updateStaffStatus = async (req, res) => {
  console.log('🔧 BACKEND: Received staff status update request for ID:', req.params.id);
  console.log('Status update data:', req.body);
  
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
      
      console.log('✅ Mock updated staff status:', mockUpdatedStaff);
      return res.json(mockUpdatedStaff);
    }

    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log('❌ BACKEND: Staff not found with ID:', req.params.id);
      return sendError(res, 404, 'Staff not found');
    }

    console.log('🔧 BACKEND: Current staff status:', {
      isOnDuty: staff.isOnDuty,
      currentShift: staff.currentShift
    });

    // Update only the status-related fields
    const statusUpdate = {};
    if ('isOnDuty' in req.body) statusUpdate.isOnDuty = req.body.isOnDuty;
    if ('currentShift' in req.body) statusUpdate.currentShift = req.body.currentShift;
    
    console.log('🔧 BACKEND: Updating staff status with:', statusUpdate);
    
    staff = await Staff.findByIdAndUpdate(
      req.params.id, 
      statusUpdate, 
      { new: true }
    ).select('-password');
    
    console.log('✅ Updated staff status in database:', {
      _id: staff._id,
      name: `${staff.firstName} ${staff.lastName}`,
      isOnDuty: staff.isOnDuty,
      currentShift: staff.currentShift
    });
    
    res.json(staff);
  } catch (err) {
    console.error('❌ Error updating staff status:', err.message);
    console.error('Full error:', err);
    sendError(res, 500, 'Server error while updating staff status');
  }
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

// Assign patient to staff
export const assignPatientToStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { patientId, priority = 'normal', notes = '', assignedAt } = req.body;

    console.log('🔧 Assigning patient to staff:', { staffId, patientId, priority, notes });

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, simulating assignment success');
      return res.json({ 
        message: 'Patient assigned successfully (demo mode)', 
        staffId, 
        patientId, 
        priority, 
        notes,
        assignedAt: assignedAt || new Date().toISOString()
      });
    }

    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Check if patient is already assigned to this staff member
    const isAlreadyAssigned = staff.assignedPatients.some(
      assignment => assignment.patientId.toString() === patientId
    );

    if (isAlreadyAssigned) {
      return sendError(res, 400, 'Patient is already assigned to this staff member');
    }

    // Add patient assignment
    const patientAssignment = {
      patientId,
      priority,
      notes,
      assignedAt: assignedAt || new Date()
    };

    staff.assignedPatients.push(patientAssignment);
    await staff.save();

    console.log('✅ Patient assigned successfully to staff member');
    res.json({ 
      message: 'Patient assigned successfully', 
      staffId, 
      patientId, 
      priority, 
      notes,
      assignedPatientsCount: staff.assignedPatients.length
    });

  } catch (err) {
    console.error('❌ Error assigning patient to staff:', err.message);
    sendError(res, 500, 'Server error while assigning patient to staff');
  }
};

// Unassign patient from staff
export const unassignPatientFromStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { patientId } = req.body;

    console.log('🔧 Unassigning patient from staff:', { staffId, patientId });

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      console.log('⚠️ MongoDB not connected, simulating unassignment success');
      return res.json({ 
        message: 'Patient unassigned successfully (demo mode)', 
        staffId, 
        patientId
      });
    }

    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Check if patient is assigned to this staff member
    const assignmentIndex = staff.assignedPatients.findIndex(
      assignment => assignment.patientId.toString() === patientId
    );

    if (assignmentIndex === -1) {
      return sendError(res, 400, 'Patient is not assigned to this staff member');
    }

    // Remove patient assignment
    staff.assignedPatients.splice(assignmentIndex, 1);
    await staff.save();

    console.log('✅ Patient unassigned successfully from staff member');
    res.json({ 
      message: 'Patient unassigned successfully', 
      staffId, 
      patientId,
      assignedPatientsCount: staff.assignedPatients.length
    });

  } catch (err) {
    console.error('❌ Error unassigning patient from staff:', err.message);
    sendError(res, 500, 'Server error while unassigning patient from staff');
  }
};
