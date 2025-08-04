import { Router, Request, Response } from 'express';
import { workflowVersioning } from '../orchestration/workflow-versioning.service';
import { workflowRegistry } from '../orchestration/workflow-registry';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

/**
 * Create a new version of a workflow
 */
router.post('/workflows/:useCaseId/versions', 
  authMiddleware,
  roleMiddleware(['admin', 'workflow_manager']),
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const { changeType, description, breaking, tags } = req.body;
      const userId = (req as any).user?.uid;

      // Get current workflow
      const workflow = workflowRegistry.getWorkflow(useCaseId);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      // Validate change type
      if (!['major', 'minor', 'patch'].includes(changeType)) {
        return res.status(400).json({ error: 'Invalid change type' });
      }

      // Create new version
      const version = await workflowVersioning.createVersion(
        workflow,
        {
          changeType,
          description,
          breaking: breaking || false,
          tags: tags || []
        },
        userId
      );

      res.json({
        success: true,
        version
      });
    } catch (error) {
      logger.error('Failed to create workflow version', { error });
      res.status(500).json({ error: 'Failed to create version' });
    }
  }
);

/**
 * Get version history for a workflow
 */
router.get('/workflows/:useCaseId/versions',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const versions = await workflowVersioning.getVersionHistory(useCaseId);

      res.json({
        success: true,
        versions
      });
    } catch (error) {
      logger.error('Failed to get version history', { error });
      res.status(500).json({ error: 'Failed to get version history' });
    }
  }
);

/**
 * Get current version of a workflow
 */
router.get('/workflows/:useCaseId/versions/current',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const current = await workflowVersioning.getCurrentVersion(useCaseId);

      if (!current) {
        return res.status(404).json({ error: 'No active version found' });
      }

      res.json({
        success: true,
        version: current.version,
        workflow: current.workflow
      });
    } catch (error) {
      logger.error('Failed to get current version', { error });
      res.status(500).json({ error: 'Failed to get current version' });
    }
  }
);

/**
 * Compare two versions
 */
router.get('/workflows/:useCaseId/versions/compare',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const { v1, v2 } = req.query;

      if (!v1 || !v2) {
        return res.status(400).json({ error: 'Both v1 and v2 parameters are required' });
      }

      const comparison = await workflowVersioning.compareVersions(
        useCaseId,
        v1 as string,
        v2 as string
      );

      res.json({
        success: true,
        comparison
      });
    } catch (error) {
      logger.error('Failed to compare versions', { error });
      res.status(500).json({ error: 'Failed to compare versions' });
    }
  }
);

/**
 * Rollback to a previous version
 */
router.post('/workflows/:useCaseId/versions/rollback',
  authMiddleware,
  roleMiddleware(['admin', 'workflow_manager']),
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const { targetVersion, reason } = req.body;
      const userId = (req as any).user?.uid;

      if (!targetVersion || !reason) {
        return res.status(400).json({ error: 'Target version and reason are required' });
      }

      const workflow = await workflowVersioning.rollbackToVersion(
        useCaseId,
        targetVersion,
        reason,
        userId
      );

      res.json({
        success: true,
        workflow,
        message: `Successfully rolled back to version ${targetVersion}`
      });
    } catch (error) {
      logger.error('Failed to rollback version', { error });
      res.status(500).json({ error: 'Failed to rollback version' });
    }
  }
);

/**
 * Export version history
 */
router.get('/workflows/:useCaseId/versions/export',
  authMiddleware,
  roleMiddleware(['admin', 'workflow_manager']),
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const exportData = await workflowVersioning.exportVersionHistory(useCaseId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${useCaseId}-versions.json"`);
      res.send(exportData);
    } catch (error) {
      logger.error('Failed to export version history', { error });
      res.status(500).json({ error: 'Failed to export version history' });
    }
  }
);

/**
 * Update workflow with version tracking
 */
router.put('/workflows/:useCaseId',
  authMiddleware,
  roleMiddleware(['admin', 'workflow_manager']),
  async (req: Request, res: Response) => {
    try {
      const { useCaseId } = req.params;
      const { workflow, versionMetadata } = req.body;
      const userId = (req as any).user?.uid;

      // Validate workflow exists
      const existingWorkflow = workflowRegistry.getWorkflow(useCaseId);
      if (!existingWorkflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      // Validate version metadata
      if (!versionMetadata || !versionMetadata.changeType || !versionMetadata.description) {
        return res.status(400).json({ 
          error: 'Version metadata with changeType and description is required' 
        });
      }

      // Merge with existing workflow
      const updatedWorkflow = {
        ...existingWorkflow,
        ...workflow,
        useCaseId, // Ensure useCaseId doesn't change
        updatedAt: new Date()
      };

      // Create new version
      const version = await workflowVersioning.createVersion(
        updatedWorkflow,
        versionMetadata,
        userId
      );

      res.json({
        success: true,
        workflow: updatedWorkflow,
        version
      });
    } catch (error) {
      logger.error('Failed to update workflow', { error });
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  }
);

/**
 * Get workflow change summary
 */
router.get('/workflows/:useCaseId/versions/:version/changes',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { useCaseId, version } = req.params;
      
      // Get version history
      const versions = await workflowVersioning.getVersionHistory(useCaseId);
      const targetVersion = versions.find(v => v.version === version);

      if (!targetVersion) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json({
        success: true,
        version: targetVersion.version,
        changes: targetVersion.changes,
        metadata: targetVersion.metadata,
        createdAt: targetVersion.createdAt,
        createdBy: targetVersion.createdBy
      });
    } catch (error) {
      logger.error('Failed to get version changes', { error });
      res.status(500).json({ error: 'Failed to get version changes' });
    }
  }
);

export default router;