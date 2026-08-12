// ============================================
// admin.middleware.js - Administrator Authorization Middleware
// ============================================

export const requireAdmin = (req, res, next) => {
  const adminEmail = 'sanketbhende0@gmail.com';

  if (
    req.user &&
    (req.user.email?.toLowerCase() === adminEmail.toLowerCase() ||
      req.user.role === 'admin')
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required for sanketbhende0@gmail.com.',
  });
};

export default requireAdmin;
