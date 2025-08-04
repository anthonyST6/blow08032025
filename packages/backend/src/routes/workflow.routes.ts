import { Router } from 'express';
import { verifyToken, requirePermission, UserRole } from '../middleware/auth.wrapper';
import { asyncHandler } from '../middleware/errorHandler';
import { collections, firestore, getServerTimestamp } from '../config/firebase';
import { logAuditEvent } from '../utils/logger';
import { agentRegistry } from '../agents/base.agent';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Workflow status enum
enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}


// Get all workflows
router.get('/',
  requirePermission('workflows.read'),
  asyncHandler(async (req, res) => {
    const { 
      status, 
      createdBy, 
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    let query = collections.workflows
      .orderBy(sortBy as string, sortOrder as 'asc' | 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (createdBy) {
      query = query.where('createdBy', '==', createdBy);
    }

    // For non-admin users, only show their workflows or public ones
    if (req.user!.role !== UserRole.ADMIN) {
      query = query.where('createdBy', '==', req.user!.uid);
    }

    const snapshot = await query.get();
    const workflows = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      workflows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: workflows.length,
      },
    });
  })
);

// Get workflow by ID
router.get('/:workflowId',
  requirePermission('workflows.read'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    
    const doc = await collections.workflows.doc(workflowId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = doc.data();
    
    // Check access permissions
    if (req.user!.role !== UserRole.ADMIN && workflow!.createdBy !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.json({
      id: doc.id,
      ...workflow,
    });
  })
);

// Create new workflow
router.post('/',
  requirePermission('workflows.create'),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      triggerType,
      triggerConfig,
      steps,
      agents,
      thresholds,
      notifications,
    } = req.body;

    // Validate required fields
    if (!name || !triggerType || !steps || steps.length === 0) {
      return res.status(400).json({ 
        error: 'name, triggerType, and steps are required' 
      });
    }

    // Validate agents exist
    if (agents && agents.length > 0) {
      for (const agentId of agents) {
        if (!agentRegistry.get(agentId)) {
          return res.status(400).json({ 
            error: `Agent ${agentId} not found` 
          });
        }
      }
    }

    const workflow = {
      name,
      description: description || '',
      status: WorkflowStatus.DRAFT,
      triggerType,
      triggerConfig: triggerConfig || {},
      steps,
      agents: agents || [],
      thresholds: thresholds || {},
      notifications: notifications || {},
      createdBy: req.user!.uid,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
      executionCount: 0,
      lastExecutedAt: null,
    };

    const docRef = await collections.workflows.add(workflow);

    logAuditEvent({
      action: 'workflow_created',
      userId: req.user!.uid,
      resourceType: 'workflow',
      resourceId: docRef.id,
      metadata: { name, triggerType },
      result: 'success',
    });

    return res.status(201).json({
      id: docRef.id,
      ...workflow,
    });
  })
);

// Update workflow
router.put('/:workflowId',
  requirePermission('workflows.update'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    const updates = req.body;

    // Get existing workflow
    const doc = await collections.workflows.doc(workflowId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = doc.data();
    
    // Check access permissions
    if (req.user!.role !== UserRole.ADMIN && workflow!.createdBy !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate agents if provided
    if (updates.agents && updates.agents.length > 0) {
      for (const agentId of updates.agents) {
        if (!agentRegistry.get(agentId)) {
          return res.status(400).json({ 
            error: `Agent ${agentId} not found` 
          });
        }
      }
    }

    // Update workflow
    const updatedWorkflow = {
      ...updates,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    };

    await collections.workflows.doc(workflowId).update(updatedWorkflow);

    logAuditEvent({
      action: 'workflow_updated',
      userId: req.user!.uid,
      resourceType: 'workflow',
      resourceId: workflowId,
      metadata: { updates: Object.keys(updates) },
      result: 'success',
    });

    return res.json({
      message: 'Workflow updated successfully',
      workflow: {
        id: workflowId,
        ...workflow,
        ...updatedWorkflow,
      },
    });
  })
);

// Delete workflow
router.delete('/:workflowId',
  requirePermission('workflows.delete'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;

    // Get existing workflow
    const doc = await collections.workflows.doc(workflowId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = doc.data();
    
    // Check access permissions
    if (req.user!.role !== UserRole.ADMIN && workflow!.createdBy !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't delete active workflows
    if (workflow!.status === WorkflowStatus.ACTIVE) {
      return res.status(400).json({ 
        error: 'Cannot delete active workflow. Please deactivate it first.' 
      });
    }

    await collections.workflows.doc(workflowId).delete();

    logAuditEvent({
      action: 'workflow_deleted',
      userId: req.user!.uid,
      resourceType: 'workflow',
      resourceId: workflowId,
      metadata: { workflowName: workflow!.name },
      result: 'success',
    });

    return res.json({ message: 'Workflow deleted successfully' });
  })
);

// Execute workflow manually
router.post('/:workflowId/execute',
  requirePermission('workflows.execute'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    const { input, metadata } = req.body;

    // Get workflow
    const doc = await collections.workflows.doc(workflowId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = doc.data();
    
    // Check if workflow is active
    if (workflow!.status !== WorkflowStatus.ACTIVE) {
      return res.status(400).json({ 
        error: 'Workflow is not active' 
      });
    }

    // Create execution record
    const execution = {
      workflowId,
      workflowName: workflow!.name,
      status: 'running',
      input,
      metadata: metadata || {},
      steps: [],
      results: {},
      startedAt: getServerTimestamp(),
      startedBy: req.user!.uid,
    };

    const executionRef = await firestore().collection('workflowExecutions').add(execution);

    // Execute workflow steps
    try {
      const results: any = {};
      const stepResults: any[] = [];

      for (const step of workflow!.steps) {
        const stepResult: any = {
          stepId: step.id,
          stepName: step.name,
          status: 'running',
          startedAt: new Date(),
        };

        // Execute step based on type
        if (step.type === 'agent_analysis' && step.agentId) {
          const agent = agentRegistry.get(step.agentId);
          if (agent && agent.isEnabled()) {
            const analysisResult = await agent.analyze({
              id: executionRef.id,
              promptId: workflowId,
              model: 'workflow',
              modelVersion: '1.0',
              text: input || step.input || '',
              rawResponse: { input },
              timestamp: new Date(),
              metadata: { ...metadata, step: step.id },
            });
            
            stepResult.result = analysisResult;
            stepResult.status = 'completed';
            results[step.id] = analysisResult;
          } else {
            stepResult.status = 'skipped';
            stepResult.error = 'Agent not available';
          }
        } else {
          // Handle other step types
          stepResult.status = 'completed';
          results[step.id] = { message: 'Step executed' };
        }

        stepResult.completedAt = new Date();
        stepResults.push(stepResult);
      }

      // Update execution record
      await executionRef.update({
        status: 'completed',
        steps: stepResults,
        results,
        completedAt: getServerTimestamp(),
      });

      // Update workflow execution count
      await collections.workflows.doc(workflowId).update({
        executionCount: (workflow!.executionCount || 0) + 1,
        lastExecutedAt: getServerTimestamp(),
      });

      logAuditEvent({
        action: 'workflow_executed',
        userId: req.user!.uid,
        resourceType: 'workflow',
        resourceId: workflowId,
        metadata: { executionId: executionRef.id },
        result: 'success',
      });

      return res.json({
        executionId: executionRef.id,
        status: 'completed',
        results,
      });
    } catch (error: any) {
      // Update execution record with error
      await executionRef.update({
        status: 'failed',
        error: error.message,
        completedAt: getServerTimestamp(),
      });

      logAuditEvent({
        action: 'workflow_executed',
        userId: req.user!.uid,
        resourceType: 'workflow',
        resourceId: workflowId,
        metadata: { executionId: executionRef.id, error: error.message },
        result: 'failure',
      });

      return res.status(500).json({
        error: 'Workflow execution failed',
        message: error.message,
      });
    }
  })
);

// Get workflow executions
router.get('/:workflowId/executions',
  requirePermission('workflows.read'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    const { limit = 50, status } = req.query;

    let query = firestore().collection('workflowExecutions')
      .where('workflowId', '==', workflowId)
      .orderBy('startedAt', 'desc')
      .limit(parseInt(limit as string));

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const executions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      executions,
      count: executions.length,
    });
  })
);

// Update workflow status
router.patch('/:workflowId/status',
  requirePermission('workflows.update'),
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(WorkflowStatus).includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
      });
    }

    // Get workflow
    const doc = await collections.workflows.doc(workflowId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = doc.data();
    
    // Check access permissions
    if (req.user!.role !== UserRole.ADMIN && workflow!.createdBy !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await collections.workflows.doc(workflowId).update({
      status,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    });

    logAuditEvent({
      action: 'workflow_status_changed',
      userId: req.user!.uid,
      resourceType: 'workflow',
      resourceId: workflowId,
      metadata: { 
        oldStatus: workflow!.status,
        newStatus: status,
      },
      result: 'success',
    });

    return res.json({
      message: 'Workflow status updated successfully',
      status,
    });
  })
);

export default router;