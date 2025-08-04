import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import llmRoutes from './llm.routes';
import auditRoutes from './audit.routes';
import workflowRoutes from './workflow.routes';
import useCaseRoutes from './use-case.routes';
import energyRoutes from './energy.routes';
import energyExtendedRoutes from './energy-extended.routes';
import deploymentRoutes from './deployment.routes';
import reportRoutes from './report.routes';
import vanguardActionsRoutes from './vanguard-actions.routes';
import vanguardRoutes from './vanguard.routes';
import fileUploadRoutes from './file-upload.routes';
import authValidationRoutes from './auth-validation.routes';
import missionControlRoutes from './mission-control';
import auditTrailRoutes from './audit-trail.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

// Auth validation routes (for testing/monitoring)
router.use('/auth-validation', authValidationRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Agent routes
router.use('/agents', agentRoutes);

// LLM routes
router.use('/llm', llmRoutes);

// Audit routes
router.use('/audit', auditRoutes);

// Workflow routes
router.use('/workflows', workflowRoutes);

// Use case routes
router.use('/usecases', useCaseRoutes);
router.use('/use-cases', useCaseRoutes); // Alternative path

// Energy vertical routes
router.use('/energy', energyRoutes);
router.use('/energy-extended', energyExtendedRoutes);

// Deployment routes
router.use('/deployment', deploymentRoutes);

// Report routes
router.use('/reports', reportRoutes);

// Vanguard Actions routes
router.use('/vanguard-actions', vanguardActionsRoutes);

// Vanguard Agent Execution routes
router.use('/vanguard', vanguardRoutes);

// File Upload routes
router.use('/files', fileUploadRoutes);

// Mission Control API routes - new features for Oilfield Land Lease
router.use('/mission-control', missionControlRoutes);

// Audit Trail routes
router.use('/audit-trail', auditTrailRoutes);

export default router;