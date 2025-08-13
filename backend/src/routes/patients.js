const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const patientController = require('../../src/controllers/patientController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Validation middleware
const validatePatient = [
  body('name').trim().isLength({ min: 2 }),
  body('age').isInt({ min: 0, max: 150 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('admissionDate').isISO8601(),
  body('diagnosis').trim().notEmpty(),
  body('roomNumber').trim().notEmpty()
];

// All routes require authentication
router.use(authMiddleware);

// Patient CRUD operations
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', roleMiddleware(['admin', 'doctor']), validatePatient, patientController.createPatient);
router.put('/:id', roleMiddleware(['admin', 'doctor']), validatePatient, patientController.updatePatient);
router.delete('/:id', roleMiddleware(['admin']), patientController.deletePatient);

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

module.exports = router;
