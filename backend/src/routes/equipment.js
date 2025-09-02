import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as equipmentController from '../controllers/equipmentController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

// Validation middleware
const validateEquipment = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('category').isIn(['monitoring', 'respiratory', 'cardiac', 'surgical', 'diagnostic', 'other']).withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('status').optional().isIn(['available', 'in_use', 'maintenance', 'out_of_order', 'retired']).withMessage('Invalid status'),
  body('equipmentId').trim().isLength({ min: 2 }).withMessage('Equipment ID is required')
];

// All routes require authentication (commented out for development with no DB)
// router.use(authMiddleware);

// Equipment CRUD operations
router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', validateEquipment, equipmentController.createEquipment); // Removed roleMiddleware for development
router.put('/:id', validateEquipment, equipmentController.updateEquipment); // Removed roleMiddleware for development
router.delete('/:id', equipmentController.deleteEquipment); // Removed roleMiddleware for development

// Equipment-specific operations
router.get('/:id/maintenance', equipmentController.getEquipmentMaintenance);
router.post('/:id/maintenance', equipmentController.addMaintenanceRecord); // Removed roleMiddleware for development
router.put('/:id/status', equipmentController.updateEquipmentStatus); // Removed roleMiddleware for development
router.post('/:id/assign', equipmentController.assignEquipment); // Removed roleMiddleware for development
router.post('/:id/unassign', equipmentController.unassignEquipment); // Removed roleMiddleware for development

// Search and filtering
router.get('/search/query', equipmentController.searchEquipment);
router.get('/filter/type/:type', equipmentController.filterEquipmentByType);
router.get('/filter/status/:status', equipmentController.filterEquipmentByStatus);
router.get('/filter/location/:location', equipmentController.filterEquipmentByLocation);

// Maintenance scheduling
router.get('/maintenance/scheduled', equipmentController.getScheduledMaintenance);
router.post('/maintenance/schedule', equipmentController.scheduleMaintenance); // Removed roleMiddleware for development

export default router;
