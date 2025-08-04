import { Router } from 'express';
import { verifyToken, requirePermission } from '../middleware/auth.wrapper';
import { asyncHandler } from '../middleware/errorHandler';
import { UseCaseModel, VerticalModel, UseCaseExecutionModel } from '../models';
import { logger } from '../utils/logger';
import Joi from 'joi';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Validation schemas
const createUseCaseSchema = Joi.object({
  verticalId: Joi.string().required(),
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).required(),
  complexity: Joi.string().valid('low', 'medium', 'high').required(),
  estimatedTime: Joi.string().required(),
  siaScores: Joi.object({
    security: Joi.number().min(0).max(100).required(),
    integrity: Joi.number().min(0).max(100).required(),
    accuracy: Joi.number().min(0).max(100).required(),
  }).required(),
  configuration: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

const updateUseCaseSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().min(1).optional(),
  complexity: Joi.string().valid('low', 'medium', 'high').optional(),
  estimatedTime: Joi.string().optional(),
  siaScores: Joi.object({
    security: Joi.number().min(0).max(100).required(),
    integrity: Joi.number().min(0).max(100).required(),
    accuracy: Joi.number().min(0).max(100).required(),
  }).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
  version: Joi.string().optional(),
  configuration: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

// Get all verticals
router.get('/verticals',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { includeInactive } = req.query;
    
    const verticals = await VerticalModel.findAll(includeInactive === 'true');
    
    // Get stats for each vertical
    const stats = await VerticalModel.getStats();
    
    const verticalsWithStats = verticals.map(vertical => ({
      ...vertical,
      stats: stats[vertical.id] || {
        useCaseCount: 0,
        activeUseCases: 0,
        executionCount: 0,
      },
    }));
    
    res.json({
      verticals: verticalsWithStats,
      count: verticals.length,
    });
  })
);

// Get vertical by ID
router.get('/verticals/:verticalId',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { verticalId } = req.params;
    
    const vertical = await VerticalModel.findById(verticalId);
    
    if (!vertical) {
      return res.status(404).json({ error: 'Vertical not found' });
    }
    
    // Get use case count
    const useCaseCount = await VerticalModel.getUseCaseCount(verticalId);
    
    res.json({
      ...vertical,
      useCaseCount,
    });
  })
);

// Get all use cases
router.get('/',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { 
      status, 
      complexity,
      verticalId,
      limit = '50', 
      offset = '0',
    } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status;
    if (complexity) filters.complexity = complexity;
    if (verticalId) filters.verticalId = verticalId;
    
    const useCases = await UseCaseModel.findAll(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({
      useCases,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: useCases.length,
      },
    });
  })
);

// Get use cases by vertical
router.get('/verticals/:verticalId/use-cases',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { verticalId } = req.params;
    const { status, complexity } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status;
    if (complexity) filters.complexity = complexity;
    
    const useCases = await UseCaseModel.findByVertical(verticalId, filters);
    
    res.json({
      useCases,
      count: useCases.length,
    });
  })
);

// Get use case by ID
router.get('/:useCaseId',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    
    const useCase = await UseCaseModel.findById(useCaseId);
    
    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    res.json(useCase);
  })
);

// Create new use case
router.post('/',
  requirePermission('use_cases.create'),
  validateRequest(createUseCaseSchema),
  asyncHandler(async (req, res) => {
    const validatedData = req.body;
    
    // Verify vertical exists
    const vertical = await VerticalModel.findById(validatedData.verticalId);
    if (!vertical) {
      return res.status(400).json({ error: 'Invalid vertical ID' });
    }
    
    const useCase = await UseCaseModel.create({
      ...validatedData,
      createdBy: req.user!.uid,
    });
    
    logger.info('Use case created', {
      useCaseId: useCase.id,
      userId: req.user!.uid,
      verticalId: validatedData.verticalId,
    });
    
    res.status(201).json(useCase);
  })
);

// Update use case
router.put('/:useCaseId',
  requirePermission('use_cases.update'),
  validateRequest(updateUseCaseSchema),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    const validatedData = req.body;
    
    // Check if use case exists
    const existingUseCase = await UseCaseModel.findById(useCaseId);
    if (!existingUseCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    const updatedUseCase = await UseCaseModel.update(useCaseId, {
      ...validatedData,
      updatedBy: req.user!.uid,
    });
    
    logger.info('Use case updated', {
      useCaseId,
      userId: req.user!.uid,
      updates: Object.keys(validatedData),
    });
    
    res.json(updatedUseCase);
  })
);

// Update use case status
router.patch('/:useCaseId/status',
  requirePermission('use_cases.update'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    const { status } = req.body;
    
    if (!['draft', 'active', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const success = await UseCaseModel.updateStatus(
      useCaseId, 
      status, 
      req.user!.uid
    );
    
    if (!success) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    logger.info('Use case status updated', {
      useCaseId,
      userId: req.user!.uid,
      status,
    });
    
    res.json({ message: 'Status updated successfully', status });
  })
);

// Archive use case
router.post('/:useCaseId/archive',
  requirePermission('use_cases.update'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    
    const success = await UseCaseModel.archive(useCaseId, req.user!.uid);
    
    if (!success) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    logger.info('Use case archived', {
      useCaseId,
      userId: req.user!.uid,
    });
    
    res.json({ message: 'Use case archived successfully' });
  })
);

// Clone use case
router.post('/:useCaseId/clone',
  requirePermission('use_cases.create'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    
    const clonedUseCase = await UseCaseModel.clone(useCaseId, req.user!.uid);
    
    if (!clonedUseCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    logger.info('Use case cloned', {
      originalId: useCaseId,
      clonedId: clonedUseCase.id,
      userId: req.user!.uid,
    });
    
    res.status(201).json(clonedUseCase);
  })
);

// Delete use case
router.delete('/:useCaseId',
  requirePermission('use_cases.delete'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    
    // Check if use case exists and is not active
    const useCase = await UseCaseModel.findById(useCaseId);
    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    if (useCase.status === 'active') {
      return res.status(400).json({ 
        error: 'Cannot delete active use case. Please archive it first.' 
      });
    }
    
    const success = await UseCaseModel.delete(useCaseId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete use case' });
    }
    
    logger.info('Use case deleted', {
      useCaseId,
      userId: req.user!.uid,
    });
    
    res.json({ message: 'Use case deleted successfully' });
  })
);

// Search use cases
router.get('/search',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { q, limit = '50' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const useCases = await UseCaseModel.searchByName(
      q,
      parseInt(limit as string)
    );
    
    res.json({
      useCases,
      count: useCases.length,
    });
  })
);

// Get use case statistics
router.get('/stats',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const stats = await UseCaseModel.getStats();
    
    res.json(stats);
  })
);

// Execute use case
router.post('/:useCaseId/execute',
  requirePermission('use_cases.execute'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    const { promptId, configuration, metadata } = req.body;
    
    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID is required' });
    }
    
    // Verify use case exists and is active
    const useCase = await UseCaseModel.findById(useCaseId);
    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    if (useCase.status !== 'active') {
      return res.status(400).json({ error: 'Use case is not active' });
    }
    
    // Create execution record
    const execution = await UseCaseExecutionModel.create({
      useCaseId,
      promptId,
      userId: req.user!.uid,
      organizationId: req.user!.organizationId || '',
      configuration: configuration || useCase.configuration || {},
      metadata: metadata || {},
    });
    
    logger.info('Use case execution started', {
      executionId: execution.id,
      useCaseId,
      userId: req.user!.uid,
    });
    
    // Note: Actual execution logic would be handled by a background job/queue
    // This just creates the execution record and returns it
    
    res.status(202).json({
      executionId: execution.id,
      status: execution.status,
      message: 'Use case execution started',
    });
  })
);

// Get use case executions
router.get('/:useCaseId/executions',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { useCaseId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    
    const executions = await UseCaseExecutionModel.findByUseCase(
      useCaseId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({
      executions,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: executions.length,
      },
    });
  })
);

// Get execution by ID
router.get('/executions/:executionId',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { executionId } = req.params;
    
    const execution = await UseCaseExecutionModel.findById(executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    // Check access permissions
    if (req.user!.role !== 'admin' && execution.userId !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(execution);
  })
);

// Cancel execution
router.post('/executions/:executionId/cancel',
  requirePermission('use_cases.execute'),
  asyncHandler(async (req, res) => {
    const { executionId } = req.params;
    
    const execution = await UseCaseExecutionModel.findById(executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    // Check access permissions
    if (req.user!.role !== 'admin' && execution.userId !== req.user!.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!['pending', 'running'].includes(execution.status)) {
      return res.status(400).json({ 
        error: 'Can only cancel pending or running executions' 
      });
    }
    
    const success = await UseCaseExecutionModel.cancel(executionId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to cancel execution' });
    }
    
    logger.info('Use case execution cancelled', {
      executionId,
      userId: req.user!.uid,
    });
    
    res.json({ message: 'Execution cancelled successfully' });
  })
);

// Get execution statistics
router.get('/executions/stats',
  requirePermission('use_cases.read'),
  asyncHandler(async (req, res) => {
    const { organizationId, startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string),
      };
    }
    
    const stats = await UseCaseExecutionModel.getStats(
      organizationId as string,
      dateRange
    );
    
    res.json(stats);
  })
);

export default router;