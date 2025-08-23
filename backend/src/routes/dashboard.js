import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/auth.js';

// All routes require authentication
router.use(authMiddleware);

// Dashboard overview
router.get('/overview', dashboardController.getOverview);
router.get('/stats', dashboardController.getStats);
router.get('/alerts', dashboardController.getAlerts);

// Patient dashboard
router.get('/patients/status', dashboardController.getPatientStatusDistribution);
router.get('/patients/critical', dashboardController.getCriticalPatients);
router.get('/patients/admissions', dashboardController.getRecentAdmissions);

// Staff dashboard
router.get('/staff/availability', dashboardController.getStaffAvailability);
router.get('/staff/on-duty', dashboardController.getOnDutyStaff);
router.get('/staff/schedule', dashboardController.getTodaySchedule);

// Equipment dashboard
router.get('/equipment/status', dashboardController.getEquipmentStatus);
router.get('/equipment/maintenance', dashboardController.getUpcomingMaintenance);
router.get('/equipment/utilization', dashboardController.getEquipmentUtilization);

// Analytics
router.get('/analytics/patient-trends', dashboardController.getPatientTrends);
router.get('/analytics/staff-performance', dashboardController.getStaffPerformance);
router.get('/analytics/equipment-efficiency', dashboardController.getEquipmentEfficiency);

export default router;
