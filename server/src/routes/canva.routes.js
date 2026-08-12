// ============================================
// canva.routes.js - Canva Integration Routes
// ============================================

import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getCanvaAuthUrl,
  handleCanvaCallback,
  getCanvaDesigns,
  importCanvaDesign,
} from '../controllers/canva.controller.js';

const router = Router();

// OAuth callback from Canva (No JWT required since browser redirects)
router.get('/callback', handleCanvaCallback);

// Authenticated Endpoints
router.get('/auth-url', authenticate, getCanvaAuthUrl);
router.get('/designs', authenticate, getCanvaDesigns);
router.post('/import', authenticate, importCanvaDesign);

export default router;
