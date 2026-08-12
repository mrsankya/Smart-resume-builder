import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import aiRoutes from './ai.routes.js';
import versionRoutes from './version.routes.js';
import adminRoutes from './admin.routes.js';
import templateRoutes from './template.routes.js';
import canvaRoutes from './canva.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/versions', versionRoutes);
router.use('/admin', adminRoutes);
router.use('/templates', templateRoutes);
router.use('/canva', canvaRoutes);

export default router;
