// ============================================
// admin.routes.js - Admin API Routes
// ============================================

import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getAdminStats,
  getAdminUsers,
  getUserResumes,
  getAdminResumes,
  getAdminResumeById,
  deleteAdminResume,
  deleteAdminUser,
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin endpoints with authentication
router.use(authenticate);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/users/:userId/resumes', getUserResumes);
router.get('/resumes', getAdminResumes);
router.get('/resumes/:resumeId', getAdminResumeById);
router.delete('/resumes/:resumeId', deleteAdminResume);
router.delete('/users/:userId', deleteAdminUser);

export default router;
