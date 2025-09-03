import Equipment from '../models/Equipment.js'; // Equipment model
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

// Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server error while fetching equipment');
  }
};

// Get equipment by ID
export const getEquipmentById = async (req, res) => {
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
export const createEquipment = async (req, res) => {
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
export const updateEquipment = async (req, res) => {
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
export const deleteEquipment = async (req, res) => {
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
export const getEquipmentMaintenance = async (req, res) => {
  res.status(200).json({ message: `Maintenance records for equipment ${req.params.id}` });
};

// Add maintenance record (placeholder)
export const addMaintenanceRecord = async (req, res) => {
  res.status(200).json({ message: `Maintenance record added for equipment ${req.params.id}` });
};

// Update equipment status
export const updateEquipmentStatus = async (req, res) => {
  try {
    console.log(`🔧 BACKEND: Updating equipment ${req.params.id} status to: ${req.body.status}`);
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true }
    );
    
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }
    
    console.log(`✅ Equipment status updated successfully: ${equipment.name} -> ${equipment.status}`);
    res.status(200).json({ 
      message: `Status updated for equipment ${req.params.id}`,
      equipment: equipment 
    });
  } catch (err) {
    console.error('❌ Error updating equipment status:', err.message);
    sendError(res, 500, 'Server error while updating equipment status');
  }
};

// Assign equipment
export const assignEquipment = async (req, res) => {
  try {
    console.log(`🔧 BACKEND: Assigning equipment ${req.params.id} (setting to in_use)`);
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id, 
      { status: 'in_use' },
      { new: true }
    );
    
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }
    
    console.log(`✅ Equipment assigned successfully: ${equipment.name} -> ${equipment.status}`);
    res.status(200).json({ 
      message: `Equipment ${req.params.id} assigned`,
      equipment: equipment 
    });
  } catch (err) {
    console.error('❌ Error assigning equipment:', err.message);
    sendError(res, 500, 'Server error while assigning equipment');
  }
};

// Unassign equipment
export const unassignEquipment = async (req, res) => {
  try {
    console.log(`🔧 BACKEND: Unassigning equipment ${req.params.id} (setting to available)`);
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id, 
      { status: 'available' },
      { new: true }
    );
    
    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }
    
    console.log(`✅ Equipment unassigned successfully: ${equipment.name} -> ${equipment.status}`);
    res.status(200).json({ 
      message: `Equipment ${req.params.id} unassigned`,
      equipment: equipment 
    });
  } catch (err) {
    console.error('❌ Error unassigning equipment:', err.message);
    sendError(res, 500, 'Server error while unassigning equipment');
  }
};

// Search equipment (placeholder)
export const searchEquipment = async (req, res) => {
  res.status(200).json({ message: `Searching equipment with query: ${req.query.q}` });
};

// Filter equipment by type (placeholder)
export const filterEquipmentByType = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by type: ${req.params.type}` });
};

// Filter equipment by status (placeholder)
export const filterEquipmentByStatus = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by status: ${req.params.status}` });
};

// Filter equipment by location (placeholder)
export const filterEquipmentByLocation = async (req, res) => {
  res.status(200).json({ message: `Filtering equipment by location: ${req.params.location}` });
};

// Get scheduled maintenance (placeholder)
export const getScheduledMaintenance = async (req, res) => {
  res.status(200).json({ message: 'Scheduled maintenance list' });
};

// Schedule maintenance (placeholder)
export const scheduleMaintenance = async (req, res) => {
  res.status(200).json({ message: 'Maintenance scheduled' });
};
