const Equipment = require('../../models/Equipment'); // Assuming Equipment model is here
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

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching equipment');
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching equipment');
  }
};

// Create a new equipment
exports.createEquipment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    const newEquipment = new Equipment(req.body);
    const equipment = await newEquipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while creating equipment');
  }
};

// Update an equipment
exports.updateEquipment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  try {
    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while updating equipment');
  }
};

// Delete an equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment removed' });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while deleting equipment');
  }
};

// Get equipment maintenance records (placeholder)
exports.getEquipmentMaintenance = async (req, res) => {
  res.status(200).json({ message: `Maintenance records for equipment ${req.params.id}` });
};

// Add maintenance record (placeholder)
exports.addMaintenanceRecord = async (req, res) => {
  res.status(200).json({ message: `Maintenance record added for equipment ${req.params.id}` });
};

// Update equipment status (placeholder)
exports.updateEquipmentStatus = async (req, res) => {
  res.status(200).json({ message: `Status updated for equipment ${req.params.id}` });
};

// Assign equipment (placeholder)
exports.assignEquipment = async (req, res) => {
  res.status(200).json({ message: `Equipment ${req.params.id} assigned` });
};

// Unassign equipment (placeholder)
exports.unassignEquipment = async (req, res) => {
  res.status(200).json({ message: `Equipment ${req.params.id} unassigned` });
};

// Search equipment (placeholder)
exports.searchEquipment = async (req, res) => {
  res.status(200).json({ message: `Searching equipment with query: ${req.query.q}` });
};

// Filter equipment by type (placeholder)
exports.filterEquipmentByType = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by type: ${req.params.type}` });
};

// Filter equipment by status (placeholder)
exports.filterEquipmentByStatus = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by status: ${req.params.status}` });
};

// Filter equipment by location (placeholder)
exports.filterEquipmentByLocation = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by location: ${req.params.location}` });
};

// Get scheduled maintenance (placeholder)
exports.getScheduledMaintenance = async (req, res) => {
  res.status(200).json({ message: 'Scheduled maintenance list' });
};

// Schedule maintenance (placeholder)
exports.scheduleMaintenance = async (req, res) => {
  res.status(200).json({ message: 'Maintenance scheduled' });
};
