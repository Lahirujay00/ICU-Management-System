import express from 'express';
import { body, param, query } from 'express-validator';
import * as bedController from '../controllers/bedController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Validation middleware
const validateBedCreation = [
  body('number')
    .trim()
    .notEmpty()
    .withMessage('Bed number is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Bed number must be between 1 and 10 characters'),
  
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  
  body('floor')
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be a number between 1 and 50'),
  
  body('ward')
    .trim()
    .notEmpty()
    .withMessage('Ward is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Ward name must be between 1 and 50 characters'),
  
  body('bedType')
    .optional()
    .isIn(['ICU', 'HDU', 'General', 'Isolation'])
    .withMessage('Bed type must be: ICU, HDU, General, or Isolation'),
  
  body('features.ventilator')
    .optional()
    .isBoolean()
    .withMessage('Ventilator feature must be boolean'),
  
  body('features.monitor')
    .optional()
    .isBoolean()
    .withMessage('Monitor feature must be boolean'),
  
  body('features.oxygenSupply')
    .optional()
    .isBoolean()
    .withMessage('Oxygen supply feature must be boolean'),
  
  body('features.suction')
    .optional()
    .isBoolean()
    .withMessage('Suction feature must be boolean'),
  
  body('assignedNurse')
    .optional()
    .isMongoId()
    .withMessage('Assigned nurse must be a valid ID'),
  
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  
  body('equipment.*')
    .optional()
    .isMongoId()
    .withMessage('Equipment ID must be valid'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const validateBedUpdate = [
  ...validateBedCreation.map(validator => validator.optional())
];

const validateBedId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid bed ID')
];

const validatePatientAssignment = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['available', 'occupied', 'cleaning', 'maintenance'])
    .withMessage('Status must be: available, occupied, cleaning, or maintenance'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const validateQuery = [
  query('status')
    .optional()
    .isIn(['available', 'occupied', 'cleaning', 'maintenance'])
    .withMessage('Status must be: available, occupied, cleaning, or maintenance'),
  
  query('ward')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ward name must be between 1 and 50 characters'),
  
  query('bedType')
    .optional()
    .isIn(['ICU', 'HDU', 'General', 'Isolation'])
    .withMessage('Bed type must be: ICU, HDU, General, or Isolation'),
  
  query('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be a number between 1 and 50')
];

// Routes

// GET /api/beds - Get all beds with optional filtering
router.get('/', 
  // auth,  // Temporarily commented out for testing
  validateQuery, 
  validate, 
  bedController.getAllBeds
);

// GET /api/beds/stats - Get bed statistics
router.get('/stats', 
  // auth,  // Temporarily commented out for testing
  bedController.getBedStats
);

// GET /api/beds/available - Get available beds
router.get('/available', 
  // auth,  // Temporarily commented out for testing
  query('bedType')
    .optional()
    .isIn(['ICU', 'HDU', 'General', 'Isolation'])
    .withMessage('Bed type must be: ICU, HDU, General, or Isolation'),
  validate,
  bedController.getAvailableBeds
);

// GET /api/beds/:id - Get bed by ID
router.get('/:id', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validate, 
  bedController.getBedById
);

// POST /api/beds - Create new bed
router.post('/', 
  // auth,  // Temporarily commented out for testing
  validateBedCreation, 
  validate, 
  bedController.createBed
);

// PUT /api/beds/:id - Update bed
router.put('/:id', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validateBedUpdate, 
  validate, 
  bedController.updateBed
);

// DELETE /api/beds/:id - Delete bed
router.delete('/:id', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validate, 
  bedController.deleteBed
);

// POST /api/beds/:id/assign - Assign patient to bed
router.post('/:id/assign', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validatePatientAssignment, 
  validate, 
  bedController.assignPatientToBed
);

// POST /api/beds/:id/discharge - Discharge patient from bed
router.post('/:id/discharge', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validate, 
  bedController.dischargePatientFromBed
);

// PUT /api/beds/:id/status - Update bed status
router.put('/:id/status', 
  // auth,  // Temporarily commented out for testing
  validateBedId, 
  validateStatusUpdate, 
  validate, 
  bedController.updateBedStatus
);

export default router;
