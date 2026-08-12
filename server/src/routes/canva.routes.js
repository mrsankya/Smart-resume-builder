// ============================================
// canva.routes.js - Canva Integration Routes
// ============================================

import { Router } from 'express';
import authenticate, { optionalAuth } from '../middleware/auth.middleware.js';
import {
  getCanvaAuthUrl,
  handleCanvaCallback,
  getCanvaDesigns,
  importCanvaDesign,
} from '../controllers/canva.controller.js';

const router = Router();

// OAuth callback from Canva (No JWT required since browser redirects)
router.get('/callback', handleCanvaCallback);

// Authorization URL can be fetched by guest or logged in user
router.get('/auth-url', optionalAuth, getCanvaAuthUrl);

// Authenticated Endpoints
router.get('/designs', optionalAuth, getCanvaDesigns);
router.post('/import', authenticate, importCanvaDesign);

export default router;
