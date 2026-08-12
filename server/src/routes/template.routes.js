// ============================================
// template.routes.js - Template Routes
// ============================================

import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import requireAdmin from '../middleware/admin.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  getLiveTemplates,
  getTemplateById,
  submitCustomTemplate,
  getAdminAllTemplates,
  approveTemplate,
  rejectTemplate,
  createOfficialTemplate,
  deleteTemplate,
} from '../controllers/template.controller.js';

const router = Router();

// Public / User Routes
router.get('/', getLiveTemplates);
router.get('/:id', getTemplateById);
router.post('/submit', authenticate, upload.single('file'), submitCustomTemplate);

// Admin Moderation & Management Routes
router.get('/admin/all', authenticate, requireAdmin, getAdminAllTemplates);
router.post('/admin/create', authenticate, requireAdmin, upload.single('file'), createOfficialTemplate);
router.put('/admin/:id/approve', authenticate, requireAdmin, approveTemplate);
router.put('/admin/:id/reject', authenticate, requireAdmin, rejectTemplate);
router.delete('/admin/:id', authenticate, requireAdmin, deleteTemplate);

export default router;
