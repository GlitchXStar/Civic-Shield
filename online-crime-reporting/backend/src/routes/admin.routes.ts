import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import { UserRole } from '../constants/index.js';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/officers', adminController.getOfficers);
router.get('/reports', adminController.getAllReports);
router.get('/cases/unassigned', adminController.getUnassignedCases);
router.post('/cases/:id/assign', adminController.assignCase);
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/profile', adminController.getProfile);
router.patch('/profile', adminController.updateProfile);

export default router;
