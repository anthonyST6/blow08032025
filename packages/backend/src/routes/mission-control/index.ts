import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { leaseRoutes } from './lease.routes';
import { certificationRoutes } from './certification.routes';
import { orchestrationRoutes } from './orchestration.routes';
import { agentRoutes } from './agent.routes';
import { notificationRoutes } from './notification.routes';
import auditRoutes from './audit.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Apply authentication to all v2 routes
router.use(authenticate);

// Mount sub-routes
router.use('/leases', leaseRoutes);
router.use('/certifications', certificationRoutes);
router.use('/orchestration', orchestrationRoutes);
router.use('/agents', agentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);

// Feature flags endpoint
router.get('/features', asyncHandler(async (req, res) => {
  // This would be replaced with actual feature flag service
  res.json({
    features: {
      missionControlV2: true,
      useCaseDashboardV2: true,
      certificationsDashboardV2: true,
      autoFix: true,
      humanInTheLoop: true,
      realTimeUpdates: true,
      advancedAnalytics: true,
    }
  });
}));

export default router;