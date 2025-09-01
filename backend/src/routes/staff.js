import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as staffController from '../controllers/staffController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

// Validation middleware for creating staff
const validateStaff = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['doctor', 'nurse', 'respiratory_therapist', 'pharmacist', 'technician', 'administrator']).withMessage('Invalid role'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other')
];

// Validation middleware for updating staff (optional fields)
const validateStaffUpdate = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['doctor', 'nurse', 'respiratory_therapist', 'pharmacist', 'technician', 'administrator']).withMessage('Invalid role'),
  body('department').optional().trim().notEmpty().withMessage('Department is required'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('isOnDuty').optional().isBoolean().withMessage('isOnDuty must be a boolean'),
  body('currentShift').optional().isIn(['morning', 'afternoon', 'night', 'emergency', 'off']).withMessage('Invalid shift')
];

// All routes require authentication (commented out for development with no DB)
// router.use(authMiddleware);

// Staff CRUD operations
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', validateStaff, staffController.createStaff); // Removed roleMiddleware for development
router.put('/:id', validateStaffUpdate, staffController.updateStaff); // Use update validation
router.delete('/:id', staffController.deleteStaff); // Removed roleMiddleware for development

// Staff-specific operations
router.get('/:id/schedule', staffController.getStaffSchedule);
router.post('/:id/schedule', staffController.updateStaffSchedule); // Removed roleMiddleware for development
router.post('/:id/time-off', staffController.requestTimeOff); // Time off request endpoint
router.get('/:id/patients', staffController.getStaffPatients);
router.put('/:id/status', staffController.updateStaffStatus); // Removed roleMiddleware for development

// Patient assignment operations
router.post('/:id/assign-patient', staffController.assignPatientToStaff);
router.post('/:id/unassign-patient', staffController.unassignPatientFromStaff);

// Search and filtering
router.get('/search/query', staffController.searchStaff);
router.get('/filter/role/:role', staffController.filterStaffByRole);
router.get('/filter/department/:department', staffController.filterStaffByDepartment);

// Department management
router.get('/departments', staffController.getDepartments);
router.post('/departments', staffController.createDepartment); // Removed roleMiddleware for development

export default router;
