const Staff = require('../../models/Staff');
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

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching staff');
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
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
exports.createStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    let staff = await Staff.findOne({ email: req.body.email });
    if (staff) {
      return sendError(res, 400, 'Staff member with this email already exists');
    }

    const newStaff = new Staff(req.body);
    staff = await newStaff.save();
    res.status(201).json(staff);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while creating staff');
  }
};

// Update a staff member
exports.updateStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while updating staff');
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
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
exports.getStaffSchedule = async (req, res) => {
  res.status(200).json({ message: `Schedule for staff ${req.params.id}` });
};

// Update staff schedule (placeholder)
exports.updateStaffSchedule = async (req, res) => {
  res.status(200).json({ message: `Schedule updated for staff ${req.params.id}` });
};

// Get staff's patients (placeholder)
exports.getStaffPatients = async (req, res) => {
  res.status(200).json({ message: `Patients for staff ${req.params.id}` });
};

// Update staff status (placeholder)
exports.updateStaffStatus = async (req, res) => {
  res.status(200).json({ message: `Status updated for staff ${req.params.id}` });
};

// Search staff (placeholder)
exports.searchStaff = async (req, res) => {
  res.status(200).json({ message: `Searching staff with query: ${req.query.q}` });
};

// Filter staff by role (placeholder)
exports.filterStaffByRole = async (req, res) => {
  res.status(200).json({ message: `Filtering staff by role: ${req.params.role}` });
};

// Filter staff by department (placeholder)
exports.filterStaffByDepartment = async (req, res) => {
  res.status(200).json({ message: `Filtering staff by department: ${req.params.department}` });
};

// Get departments (placeholder)
exports.getDepartments = async (req, res) => {
  res.status(200).json({ message: 'List of departments' });
};

// Create department (placeholder)
exports.createDepartment = async (req, res) => {
  res.status(200).json({ message: 'Department created' });
};
