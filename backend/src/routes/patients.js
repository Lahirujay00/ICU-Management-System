import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as patientController from '../controllers/patientController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

// Validation middleware for full patient data
const validatePatient = [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('bedNumber').optional().trim().notEmpty().withMessage('Bed number cannot be empty'),
  body('roomNumber').optional().trim().notEmpty().withMessage('Room number cannot be empty')
];

// Validation middleware for partial updates (like status, discharge, etc.)
const validatePatientUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Patient name cannot be empty'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('diagnosis').optional().trim().notEmpty().withMessage('Diagnosis cannot be empty'),
  body('status').optional().isIn(['critical', 'stable', 'improving', 'discharged']).withMessage('Status must be critical, stable, improving, or discharged'),
  body('bedNumber').optional().trim(),
  body('roomNumber').optional().trim(),
  body('dischargeDate').optional().isISO8601().withMessage('Discharge date must be a valid date'),
  body('dischargeReason').optional().isIn(['discharged', 'transfer', 'death']).withMessage('Discharge reason must be discharged, transfer, or death'),
  body('dischargeNotes').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// Temporarily comment out authentication for testing
// router.use(authMiddleware);

// Patient CRUD operations
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', validatePatient, patientController.createPatient); // Removed auth for testing
router.put('/:id', validatePatientUpdate, patientController.updatePatient); // Removed auth for testing
router.delete('/:id', patientController.deletePatient); // Removed auth for testing

// Patient-specific operations
router.get('/:id/vitals', patientController.getPatientVitals);
router.post('/:id/vitals', roleMiddleware(['admin', 'doctor', 'nurse']), patientController.addVitalSigns);
router.get('/:id/notes', patientController.getPatientNotes);
router.post('/:id/notes', roleMiddleware(['admin', 'doctor', 'nurse']), patientController.addPatientNote);
router.put('/:id/status', roleMiddleware(['admin', 'doctor']), patientController.updatePatientStatus);

// Search and filtering
router.get('/search/query', patientController.searchPatients);
router.get('/filter/status/:status', patientController.filterPatientsByStatus);
router.get('/filter/room/:roomNumber', patientController.filterPatientsByRoom);

export default router;
