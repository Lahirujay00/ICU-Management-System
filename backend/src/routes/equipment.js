import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as equipmentController from '../controllers/equipmentController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

// Validation middleware
const validateEquipment = [
  body('name').trim().isLength({ min: 2 }),
  body('type').trim().notEmpty(),
  body('serialNumber').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('status').isIn(['available', 'in-use', 'maintenance', 'out-of-service'])
];

// All routes require authentication
router.use(authMiddleware);

// Equipment CRUD operations
router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', roleMiddleware(['admin', 'nurse']), validateEquipment, equipmentController.createEquipment);
router.put('/:id', roleMiddleware(['admin', 'nurse']), validateEquipment, equipmentController.updateEquipment);
router.delete('/:id', roleMiddleware(['admin']), equipmentController.deleteEquipment);

// Equipment-specific operations
router.get('/:id/maintenance', equipmentController.getEquipmentMaintenance);
router.post('/:id/maintenance', roleMiddleware(['admin', 'nurse']), equipmentController.addMaintenanceRecord);
router.put('/:id/status', roleMiddleware(['admin', 'nurse']), equipmentController.updateEquipmentStatus);
router.post('/:id/assign', roleMiddleware(['admin', 'nurse']), equipmentController.assignEquipment);
router.post('/:id/unassign', roleMiddleware(['admin', 'nurse']), equipmentController.unassignEquipment);

// Search and filtering
router.get('/search/query', equipmentController.searchEquipment);
router.get('/filter/type/:type', equipmentController.filterEquipmentByType);
router.get('/filter/status/:status', equipmentController.filterEquipmentByStatus);
router.get('/filter/location/:location', equipmentController.filterEquipmentByLocation);

// Maintenance scheduling
router.get('/maintenance/scheduled', equipmentController.getScheduledMaintenance);
router.post('/maintenance/schedule', roleMiddleware(['admin']), equipmentController.scheduleMaintenance);

export default router;
