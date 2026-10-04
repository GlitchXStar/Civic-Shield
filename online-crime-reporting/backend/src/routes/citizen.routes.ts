import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as citizenController from '../controllers/citizen.controller.js';
import { UserRole } from '../constants/index.js';

const router = Router();

// All citizen routes require authentication and CITIZEN role
router.use(authenticate, authorize(UserRole.CITIZEN));

// Reports
router.post('/reports', citizenController.submitReport);
router.get('/reports', citizenController.getMyReports);
router.get('/reports/:id', citizenController.getReportDetails);
router.get('/reports/:id/timeline', citizenController.getReportTimeline);

// Notifications
router.get('/notifications', citizenController.getNotifications);
router.patch('/notifications/:id/read', citizenController.readNotification);

// Profile
router.get('/profile', citizenController.getProfile);
router.patch('/profile', citizenController.updateProfile);

export default router;
