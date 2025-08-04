import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { orchestrationService } from '../../services/orchestration.service';

const router = Router();

// Get all workflows
router.get('/workflows', asyncHandler(async (req: Request, res: Response) => {
  const { status, trigger } = req.query;

  // Mock response for now
  const workflows = {
    data: [
      {
        id: '1',
        name: 'Security Threat Detection and Response',
        description: 'Detect security threats, classify them, and execute appropriate responses',
        trigger: {
          type: 'scheduled',
          schedule: '*/15 * * * *',
        },
        status: status || 'active',
        createdAt: new Date(),
        lastExecutedAt: new Date(Date.now() - 900000), // 15 minutes ago
        nextExecutionAt: new Date(Date.now() + 900000), // 15 minutes from now
      },
      {
        id: '2',
        name: 'Lease Expiration Management',
        description: 'Monitor lease expirations and execute renewal workflows',
        trigger: {
          type: 'scheduled',
          schedule: '0 9 * * *',
        },
        status: 'active',
        createdAt: new Date(),
        lastExecutedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
    }
  };

  res.json(workflows);
}));

// Create new workflow
router.post('/workflows', asyncHandler(async (req: Request, res: Response) => {
  const workflowData = req.body;

  if (!workflowData.name || !workflowData.trigger || !workflowData.steps) {
    return res.status(400).json({ 
      error: 'Name, trigger, and steps are required' 
    });
  }

  const workflow = await orchestrationService.createWorkflow(workflowData);
  res.status(201).json(workflow);
}));

// Get workflow by ID
router.get('/workflows/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock response
  const workflow = {
    id,
    name: 'Security Threat Detection and Response',
    description: 'Detect security threats, classify them, and execute appropriate responses',
    trigger: {
      type: 'scheduled',
      schedule: '*/15 * * * *',
    },
    steps: [
      {
        id: 'detect-threats',
        name: 'Detect Security Threats',
        type: 'detect',
        agent: 'security',
        action: 'detectAnomalies',
      },
      {
        id: 'classify-threats',
        name: 'Classify Detected Threats',
        type: 'classify',
        action: 'classifyThreat',
      },
    ],
    status: 'active',
    createdAt: new Date(),
    lastExecutedAt: new Date(Date.now() - 900000),
    nextExecutionAt: new Date(Date.now() + 900000),
  };

  res.json(workflow);
}));

// Execute workflow manually
router.post('/workflows/:id/execute', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { context = {} } = req.body;

  const execution = await orchestrationService.executeWorkflow(id, context);
  res.json(execution);
}));

// Get workflow executions
router.get('/executions', asyncHandler(async (req: Request, res: Response) => {
  const { workflowId, status } = req.query;

  const executions = await orchestrationService.getWorkflowExecutions(
    workflowId as string,
    status as any
  );

  res.json({
    data: executions,
    pagination: {
      page: 1,
      limit: 100,
      total: executions.length,
    }
  });
}));

// Get execution by ID
router.get('/executions/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock response
  const execution = {
    id,
    workflowId: '1',
    status: 'completed',
    startedAt: new Date(Date.now() - 300000), // 5 minutes ago
    completedAt: new Date(Date.now() - 60000), // 1 minute ago
    currentStep: 'update-systems',
    steps: [
      {
        stepId: 'detect-threats',
        status: 'completed',
        startedAt: new Date(Date.now() - 300000),
        completedAt: new Date(Date.now() - 240000),
        result: { threatsFound: 2 },
      },
      {
        stepId: 'classify-threats',
        status: 'completed',
        startedAt: new Date(Date.now() - 240000),
        completedAt: new Date(Date.now() - 180000),
        result: { severity: 'medium', category: 'access_control' },
      },
    ],
    context: {
      leaseId: 'lease-123',
      triggeredBy: 'scheduled',
    },
    flags: [],
  };

  res.json(execution);
}));

// Get pending human approvals
router.get('/approvals', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  const approvals = await orchestrationService.getPendingApprovals(userId);
  
  res.json({
    data: approvals,
    pagination: {
      page: 1,
      limit: 100,
      total: approvals.length,
    }
  });
}));

// Approve/reject human approval
router.post('/approvals/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, reason, modifications } = req.body;
  const userId = (req as any).user?.id || 'system';

  if (!decision || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ 
      error: 'Decision must be either "approve" or "reject"' 
    });
  }

  if (decision === 'reject' && !reason) {
    return res.status(400).json({ 
      error: 'Reason is required for rejection' 
    });
  }

  await orchestrationService.approveHumanApproval(
    id,
    decision,
    userId,
    reason,
    modifications
  );

  res.json({ 
    success: true, 
    message: `Approval ${decision}d successfully` 
  });
}));

// Get orchestration metrics
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  // Mock metrics
  const metrics = {
    workflows: {
      total: 5,
      active: 4,
      paused: 1,
    },
    executions: {
      total: 1250,
      successful: 1180,
      failed: 50,
      cancelled: 20,
      averageDuration: 240000, // 4 minutes
    },
    approvals: {
      total: 85,
      approved: 70,
      rejected: 10,
      timeout: 5,
      averageResponseTime: 1800000, // 30 minutes
    },
    byWorkflow: [
      {
        workflowId: '1',
        name: 'Security Threat Detection',
        executions: 500,
        successRate: 0.96,
        averageDuration: 180000,
      },
      {
        workflowId: '2',
        name: 'Lease Expiration Management',
        executions: 365,
        successRate: 0.98,
        averageDuration: 300000,
      },
    ],
    timeRange: {
      start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: endDate || new Date(),
    },
  };

  res.json(metrics);
}));

// Create default workflows
router.post('/workflows/defaults', asyncHandler(async (req: Request, res: Response) => {
  await orchestrationService.createDefaultWorkflows();
  
  res.json({ 
    success: true, 
    message: 'Default workflows created successfully' 
  });
}));

// Pause/resume workflow
router.put('/workflows/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'paused'].includes(status)) {
    return res.status(400).json({ 
      error: 'Status must be either "active" or "paused"' 
    });
  }

  // Mock response
  res.json({
    id,
    status,
    updatedAt: new Date(),
  });
}));

// Get workflow execution logs
router.get('/executions/:id/logs', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock logs
  const logs = [
    {
      timestamp: new Date(Date.now() - 300000),
      level: 'info',
      message: 'Workflow execution started',
      metadata: { executionId: id },
    },
    {
      timestamp: new Date(Date.now() - 240000),
      level: 'info',
      message: 'Step "detect-threats" started',
      metadata: { stepId: 'detect-threats' },
    },
    {
      timestamp: new Date(Date.now() - 180000),
      level: 'warning',
      message: '2 security threats detected',
      metadata: { threatsCount: 2 },
    },
    {
      timestamp: new Date(Date.now() - 60000),
      level: 'info',
      message: 'Workflow execution completed',
      metadata: { duration: 240000 },
    },
  ];

  res.json(logs);
}));

export const orchestrationRoutes = router;