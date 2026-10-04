import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as policeController from '../controllers/police.controller.js';
import { UserRole } from '../constants/index.js';

const router = Router();

// All police routes require authentication and POLICE role
router.use(authenticate, authorize(UserRole.POLICE));

// Dashboard
router.get('/dashboard', policeController.getDashboardStats);

// Reports/Cases
router.get('/reports/new', policeController.getNewReports);
router.get('/cases', policeController.getAssignedCases);
router.get('/cases/:id', policeController.getCaseDetails);

// Investigation
router.get('/cases/:id/investigation', policeController.getInvestigation);
router.post('/cases/:id/investigation', policeController.addInvestigationNote);

// Status update
router.patch('/cases/:id/status', policeController.updateCaseStatus);

// Export
router.get('/reports', policeController.exportReports);

// Profile
router.get('/profile', policeController.getProfile);
router.patch('/profile', policeController.updateProfile);

export default router;
