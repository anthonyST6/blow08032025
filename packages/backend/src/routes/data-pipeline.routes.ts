import { Router, Response } from 'express';
import { dataPipelineOrchestrator } from '../orchestration/data-pipeline.orchestrator';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Ingest data from JSON payload
 * POST /api/data-pipeline/ingest/json
 */
router.post(
  '/ingest/json',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data, name, schema } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }

      // Create a temporary in-memory dataset
      const dataset = await dataPipelineOrchestrator.ingest(
        {
          type: 'api',
          location: 'inline',
          metadata: {
            source: 'json-payload',
            userId: req.user?.uid
          }
        },
        {
          type: 'json',
          encoding: 'utf-8',
          schema
        },
        { name }
      );

      res.json({
        success: true,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          rowCount: dataset.metadata.rowCount,
          sizeBytes: dataset.metadata.sizeBytes,
          schema: dataset.schema
        }
      });
    } catch (error) {
      logger.error('Failed to ingest JSON data', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to ingest JSON data' });
    }
  }
);

/**
 * Ingest data from API endpoint
 * POST /api/data-pipeline/ingest/api
 */
router.post(
  '/ingest/api',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { url, headers, format = 'json', name } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const dataset = await dataPipelineOrchestrator.ingest(
        {
          type: 'api',
          location: url,
          credentials: { headers },
          metadata: { method: 'GET' }
        },
        {
          type: format,
          encoding: 'utf-8'
        },
        { name }
      );

      res.json({
        success: true,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          rowCount: dataset.metadata.rowCount,
          sizeBytes: dataset.metadata.sizeBytes,
          schema: dataset.schema
        }
      });
    } catch (error) {
      logger.error('Failed to ingest from API', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to ingest from API' });
    }
  }
);

/**
 * Transform a dataset
 * POST /api/data-pipeline/transform/:datasetId
 */
router.post(
  '/transform/:datasetId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const { rules, inPlace = false } = req.body;

      if (!rules || !Array.isArray(rules)) {
        return res.status(400).json({ error: 'Transform rules are required' });
      }

      const dataset = dataPipelineOrchestrator.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const transformedDataset = await dataPipelineOrchestrator.transform(
        dataset,
        rules,
        { inPlace }
      );

      res.json({
        success: true,
        dataset: {
          id: transformedDataset.id,
          name: transformedDataset.name,
          rowCount: transformedDataset.metadata.rowCount,
          sizeBytes: transformedDataset.metadata.sizeBytes
        }
      });
    } catch (error) {
      logger.error('Failed to transform dataset', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to transform dataset' });
    }
  }
);

/**
 * Validate a dataset
 * POST /api/data-pipeline/validate/:datasetId
 */
router.post(
  '/validate/:datasetId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const { schema } = req.body;

      if (!schema) {
        return res.status(400).json({ error: 'Validation schema is required' });
      }

      const dataset = dataPipelineOrchestrator.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const report = await dataPipelineOrchestrator.validate(dataset, schema);

      res.json({
        success: true,
        report
      });
    } catch (error) {
      logger.error('Failed to validate dataset', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to validate dataset' });
    }
  }
);

/**
 * Deploy a dataset
 * POST /api/data-pipeline/deploy/:datasetId
 */
router.post(
  '/deploy/:datasetId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const { target, options } = req.body;

      if (!target) {
        return res.status(400).json({ error: 'Deployment target is required' });
      }

      const dataset = dataPipelineOrchestrator.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const status = await dataPipelineOrchestrator.deploy(dataset, target, options);

      res.json({
        success: true,
        status
      });
    } catch (error) {
      logger.error('Failed to deploy dataset', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to deploy dataset' });
    }
  }
);

/**
 * Execute a full pipeline
 * POST /api/data-pipeline/execute
 */
router.post(
  '/execute',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { source, format, transformRules, validationSchema, target, options } = req.body;

      if (!source || !format || !target) {
        return res.status(400).json({ 
          error: 'Source, format, and target are required' 
        });
      }

      const results = await dataPipelineOrchestrator.executePipeline(
        source,
        format,
        transformRules || [],
        validationSchema || { rules: [], errorHandling: 'log' },
        target,
        options
      );

      res.json({
        success: true,
        results: {
          dataset: {
            id: results.dataset.id,
            name: results.dataset.name,
            rowCount: results.dataset.metadata.rowCount
          },
          validation: results.validationReport,
          deployment: results.deploymentStatus
        }
      });
    } catch (error) {
      logger.error('Failed to execute pipeline', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to execute pipeline' });
    }
  }
);

/**
 * Get dataset details
 * GET /api/data-pipeline/datasets/:datasetId
 */
router.get(
  '/datasets/:datasetId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const dataset = dataPipelineOrchestrator.getDataset(datasetId);

      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      res.json({
        success: true,
        dataset
      });
    } catch (error) {
      logger.error('Failed to get dataset', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get dataset' });
    }
  }
);

/**
 * Get dataset preview (first 10 rows)
 * GET /api/data-pipeline/datasets/:datasetId/preview
 */
router.get(
  '/datasets/:datasetId/preview',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const dataset = dataPipelineOrchestrator.getDataset(datasetId);

      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const previewData = dataset.data?.slice(0, 10) || [];

      res.json({
        success: true,
        preview: {
          data: previewData,
          totalRows: dataset.metadata.rowCount,
          schema: dataset.schema
        }
      });
    } catch (error) {
      logger.error('Failed to get dataset preview', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get dataset preview' });
    }
  }
);

/**
 * List all datasets
 * GET /api/data-pipeline/datasets
 */
router.get(
  '/datasets',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const datasets = dataPipelineOrchestrator.listDatasets();

      res.json({
        success: true,
        datasets: datasets.map(d => ({
          id: d.id,
          name: d.name,
          source: d.source.type,
          format: d.format.type,
          rowCount: d.metadata.rowCount,
          sizeBytes: d.metadata.sizeBytes,
          createdAt: d.metadata.createdAt,
          updatedAt: d.metadata.updatedAt
        }))
      });
    } catch (error) {
      logger.error('Failed to list datasets', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to list datasets' });
    }
  }
);

/**
 * Delete a dataset
 * DELETE /api/data-pipeline/datasets/:datasetId
 */
router.delete(
  '/datasets/:datasetId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { datasetId } = req.params;
      const deleted = dataPipelineOrchestrator.deleteDataset(datasetId);

      if (!deleted) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      res.json({
        success: true,
        message: 'Dataset deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete dataset', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to delete dataset' });
    }
  }
);

/**
 * Get active pipeline executions
 * GET /api/data-pipeline/executions
 */
router.get(
  '/executions',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const executions = dataPipelineOrchestrator.getActiveExecutions();

      res.json({
        success: true,
        executions: executions.map(e => ({
          id: e.id,
          pipelineId: e.pipelineId,
          status: e.status,
          progress: e.progress,
          startedAt: e.startedAt,
          completedAt: e.completedAt
        }))
      });
    } catch (error) {
      logger.error('Failed to get executions', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get executions' });
    }
  }
);

/**
 * Get sample transform rules
 * GET /api/data-pipeline/transform-rules/samples
 */
router.get(
  '/transform-rules/samples',
  authMiddleware,
  async (_req: AuthenticatedRequest, res: Response) => {
    const samples = [
      {
        name: 'Uppercase field',
        description: 'Convert a text field to uppercase',
        rule: {
          type: 'map',
          config: {
            field: 'name',
            operation: 'uppercase'
          },
          order: 1
        }
      },
      {
        name: 'Filter by value',
        description: 'Keep only records where value > 100',
        rule: {
          type: 'filter',
          config: {
            field: 'value',
            operator: '>',
            value: 100
          },
          order: 2
        }
      },
      {
        name: 'Add calculated field',
        description: 'Add a new field with calculated value',
        rule: {
          type: 'map',
          config: {
            newField: 'calculated',
            formula: 'value * 1.1'
          },
          order: 3
        }
      },
      {
        name: 'Remove field',
        description: 'Remove unnecessary fields',
        rule: {
          type: 'map',
          config: {
            removeFields: ['temp', 'debug']
          },
          order: 4
        }
      }
    ];

    res.json({ success: true, samples });
  }
);

/**
 * Get sample validation schemas
 * GET /api/data-pipeline/validation-schemas/samples
 */
router.get(
  '/validation-schemas/samples',
  authMiddleware,
  async (_req: AuthenticatedRequest, res: Response) => {
    const samples = [
      {
        name: 'Basic required fields',
        description: 'Ensure essential fields are present',
        schema: {
          rules: [
            {
              field: 'id',
              type: 'required',
              config: {},
              severity: 'error'
            },
            {
              field: 'name',
              type: 'required',
              config: {},
              severity: 'error'
            }
          ],
          errorHandling: 'log',
          maxErrors: 100
        }
      },
      {
        name: 'Type validation',
        description: 'Validate field data types',
        schema: {
          rules: [
            {
              field: 'value',
              type: 'type',
              config: { expectedType: 'number' },
              severity: 'error'
            },
            {
              field: 'date',
              type: 'type',
              config: { expectedType: 'date' },
              severity: 'warning'
            }
          ],
          errorHandling: 'skip'
        }
      },
      {
        name: 'Range validation',
        description: 'Ensure values are within acceptable ranges',
        schema: {
          rules: [
            {
              field: 'age',
              type: 'range',
              config: { min: 0, max: 150 },
              severity: 'error'
            },
            {
              field: 'score',
              type: 'range',
              config: { min: 0, max: 100 },
              severity: 'warning'
            }
          ],
          errorHandling: 'log'
        }
      }
    ];

    res.json({ success: true, samples });
  }
);

/**
 * Get deployment target templates
 * GET /api/data-pipeline/deployment-targets/templates
 */
router.get(
  '/deployment-targets/templates',
  authMiddleware,
  async (_req: AuthenticatedRequest, res: Response) => {
    const templates = [
      {
        name: 'Development Database',
        description: 'Deploy to development PostgreSQL',
        target: {
          type: 'database',
          environment: 'development',
          location: 'postgresql://localhost:5432/dev_db',
          options: {
            table: 'imported_data',
            createTable: true,
            truncate: false
          }
        }
      },
      {
        name: 'API Endpoint',
        description: 'Send data to REST API',
        target: {
          type: 'api',
          environment: 'production',
          location: 'https://api.example.com/data/import',
          options: {
            method: 'POST',
            batchSize: 100,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }
      },
      {
        name: 'File Export',
        description: 'Export to CSV file',
        target: {
          type: 'file',
          environment: 'development',
          location: './exports/data-export.csv',
          options: {
            format: 'csv',
            includeHeaders: true,
            delimiter: ','
          }
        }
      }
    ];

    res.json({ success: true, templates });
  }
);

export default router;