// ============================================
// auth.routes.js - Authentication Routes
// ============================================

import { Router } from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Public routes — Express POST routes (Express.js: HTTP Methods)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// Protected routes — auth middleware applied (Express.js: Auth Middleware)
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;
