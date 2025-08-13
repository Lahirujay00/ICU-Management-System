const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const staffController = require('../../src/controllers/staffController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Validation middleware
const validateStaff = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'doctor', 'nurse', 'staff']),
  body('department').trim().notEmpty(),
  body('phone').trim().notEmpty()
];

// All routes require authentication
router.use(authMiddleware);

// Staff CRUD operations
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', roleMiddleware(['admin']), validateStaff, staffController.createStaff);
router.put('/:id', roleMiddleware(['admin']), validateStaff, staffController.updateStaff);
router.delete('/:id', roleMiddleware(['admin']), staffController.deleteStaff);

// Staff-specific operations
router.get('/:id/schedule', staffController.getStaffSchedule);
router.post('/:id/schedule', roleMiddleware(['admin', 'nurse']), staffController.updateStaffSchedule);
router.get('/:id/patients', staffController.getStaffPatients);
router.put('/:id/status', roleMiddleware(['admin']), staffController.updateStaffStatus);

// Search and filtering
router.get('/search/query', staffController.searchStaff);
router.get('/filter/role/:role', staffController.filterStaffByRole);
router.get('/filter/department/:department', staffController.filterStaffByDepartment);

// Department management
router.get('/departments', staffController.getDepartments);
router.post('/departments', roleMiddleware(['admin']), staffController.createDepartment);

module.exports = router;
