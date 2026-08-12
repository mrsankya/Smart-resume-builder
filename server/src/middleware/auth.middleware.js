// ============================================
// auth.middleware.js - Authentication Middleware
// ============================================
// Protects routes that require a valid JWT token.
// Attaches the user object to req.user.
// ============================================

import { verifyToken } from '../utils/jwt.utils.js';
import User from '../models/User.model.js';

// JWT verification middleware (Express.js: Auth Middleware)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this route.',
      });
    }

    const token = authHeader.split(' ')[1]; // Extract Bearer token (Express.js: Authentication)
    const decoded = verifyToken(token); // JWT token verification (Express.js: JWT Utilities)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
    }

    req.user = user; // Attach user to request (Express.js: Middleware)
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Optional JWT verification middleware
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

export default authenticate;
