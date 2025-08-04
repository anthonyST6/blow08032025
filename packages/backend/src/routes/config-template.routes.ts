import { Router, Response } from 'express';
import { configTemplateEngine } from '../orchestration/config-template.engine';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get template for a specific use case
 * GET /api/config-templates/:industryId/:useCaseId
 */
router.get(
  '/:industryId/:useCaseId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId, useCaseId } = req.params;
      
      const template = await configTemplateEngine.loadTemplate(industryId, useCaseId);
      
      if (!template) {
        return res.status(404).json({ 
          error: 'Template not found for the specified industry and use case' 
        });
      }

      res.json({
        success: true,
        template
      });
    } catch (error) {
      logger.error('Failed to load template', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to load template' });
    }
  }
);

/**
 * Get all templates for an industry
 * GET /api/config-templates/industry/:industryId
 */
router.get(
  '/industry/:industryId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId } = req.params;
      
      const templates = configTemplateEngine.getTemplatesByIndustry(industryId);

      res.json({
        success: true,
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          useCaseId: t.useCaseId,
          version: t.version,
          complexity: t.metadata.complexity,
          variableCount: t.variables.length
        }))
      });
    } catch (error) {
      logger.error('Failed to get industry templates', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get industry templates' });
    }
  }
);

/**
 * Apply data to a template to create configuration
 * POST /api/config-templates/:industryId/:useCaseId/apply
 */
router.post(
  '/:industryId/:useCaseId/apply',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId, useCaseId } = req.params;
      const { data } = req.body;

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Data object is required' });
      }

      const template = await configTemplateEngine.loadTemplate(industryId, useCaseId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const configuration = configTemplateEngine.applyData(template, data);
      
      // Validate the configuration
      const validation = configTemplateEngine.validate(configuration);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Configuration validation failed',
          validation
        });
      }

      // Save the configuration
      const configId = configTemplateEngine.saveConfiguration(configuration);

      res.json({
        success: true,
        configuration: {
          id: configId,
          templateId: configuration.templateId,
          values: configuration.values,
          metadata: configuration.metadata
        },
        validation
      });
    } catch (error) {
      logger.error('Failed to apply template', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to apply template' });
    }
  }
);

/**
 * Validate configuration data against template
 * POST /api/config-templates/:industryId/:useCaseId/validate
 */
router.post(
  '/:industryId/:useCaseId/validate',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId, useCaseId } = req.params;
      const { data } = req.body;

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Data object is required' });
      }

      const template = await configTemplateEngine.loadTemplate(industryId, useCaseId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Create temporary configuration for validation
      const tempConfig = {
        templateId: template.id,
        values: data,
        metadata: { createdAt: new Date() }
      };

      const validation = configTemplateEngine.validate(tempConfig);

      res.json({
        success: true,
        validation
      });
    } catch (error) {
      logger.error('Failed to validate configuration', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to validate configuration' });
    }
  }
);

/**
 * Generate configuration variants
 * POST /api/config-templates/configurations/:configId/variants
 */
router.post(
  '/configurations/:configId/variants',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { configId } = req.params;
      const { variations } = req.body;

      if (!variations || !Array.isArray(variations)) {
        return res.status(400).json({ error: 'Variations array is required' });
      }

      const configuration = configTemplateEngine.loadConfiguration(configId);
      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      const variants = configTemplateEngine.generateVariants(configuration, variations);

      res.json({
        success: true,
        variants: variants.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          overrides: v.overrides,
          metadata: v.metadata
        }))
      });
    } catch (error) {
      logger.error('Failed to generate variants', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to generate variants' });
    }
  }
);

/**
 * Get saved configuration
 * GET /api/config-templates/configurations/:configId
 */
router.get(
  '/configurations/:configId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { configId } = req.params;
      
      const configuration = configTemplateEngine.loadConfiguration(configId);
      
      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({
        success: true,
        configuration
      });
    } catch (error) {
      logger.error('Failed to load configuration', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to load configuration' });
    }
  }
);

/**
 * Export template as JSON
 * GET /api/config-templates/:industryId/:useCaseId/export
 */
router.get(
  '/:industryId/:useCaseId/export',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId, useCaseId } = req.params;
      
      const template = await configTemplateEngine.loadTemplate(industryId, useCaseId);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const exportData = configTemplateEngine.exportTemplate(template);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename="${industryId}-${useCaseId}-template.json"`
      );
      res.send(exportData);
    } catch (error) {
      logger.error('Failed to export template', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to export template' });
    }
  }
);

/**
 * Import template from JSON
 * POST /api/config-templates/import
 */
router.post(
  '/import',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { templateJson } = req.body;

      if (!templateJson || typeof templateJson !== 'string') {
        return res.status(400).json({ error: 'Template JSON string is required' });
      }

      const template = configTemplateEngine.importTemplate(templateJson);

      res.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          industryId: template.industryId,
          useCaseId: template.useCaseId,
          version: template.version
        }
      });
    } catch (error) {
      logger.error('Failed to import template', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to import template' });
    }
  }
);

/**
 * Register custom validator
 * POST /api/config-templates/validators
 */
router.post(
  '/validators',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, validatorCode } = req.body;

      if (!name || !validatorCode) {
        return res.status(400).json({ 
          error: 'Validator name and code are required' 
        });
      }

      // Create function from code (in production, this would need sandboxing)
      const validatorFunction = new Function('return ' + validatorCode)();
      
      configTemplateEngine.registerValidator(name, validatorFunction);

      res.json({
        success: true,
        message: `Validator '${name}' registered successfully`
      });
    } catch (error) {
      logger.error('Failed to register validator', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to register validator' });
    }
  }
);

/**
 * Get sample configurations for a template
 * GET /api/config-templates/:industryId/:useCaseId/samples
 */
router.get(
  '/:industryId/:useCaseId/samples',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { industryId, useCaseId } = req.params;
      
      // Generate sample configurations based on use case
      const samples = generateSampleConfigurations(industryId, useCaseId);

      res.json({
        success: true,
        samples
      });
    } catch (error) {
      logger.error('Failed to get sample configurations', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get sample configurations' });
    }
  }
);

// Helper function to generate sample configurations
function generateSampleConfigurations(industryId: string, useCaseId: string): any[] {
  const samples: any[] = [];

  if (industryId === 'energy' && useCaseId === 'grid-anomaly') {
    samples.push(
      {
        name: 'High Sensitivity Configuration',
        description: 'Detects even minor anomalies',
        data: {
          anomalyThreshold: 0.95,
          alertingEnabled: true,
          alertChannels: ['email', 'sms', 'dashboard'],
          executionTimeout: 1800,
          retryAttempts: 5
        }
      },
      {
        name: 'Balanced Configuration',
        description: 'Balance between sensitivity and false positives',
        data: {
          anomalyThreshold: 0.85,
          alertingEnabled: true,
          alertChannels: ['email'],
          executionTimeout: 3600,
          retryAttempts: 3
        }
      },
      {
        name: 'Low Sensitivity Configuration',
        description: 'Only major anomalies trigger alerts',
        data: {
          anomalyThreshold: 0.70,
          alertingEnabled: true,
          alertChannels: ['dashboard'],
          executionTimeout: 7200,
          retryAttempts: 2
        }
      }
    );
  } else if (industryId === 'healthcare') {
    samples.push(
      {
        name: 'HIPAA Compliant Configuration',
        description: 'Meets HIPAA security requirements',
        data: {
          encryptionEnabled: true,
          auditLoggingLevel: 'detailed',
          dataRetentionDays: 2555, // 7 years
          accessControlStrict: true
        }
      }
    );
  } else if (industryId === 'finance') {
    samples.push(
      {
        name: 'Real-time Fraud Detection',
        description: 'Immediate fraud detection and response',
        data: {
          processingMode: 'realtime',
          fraudThreshold: 0.90,
          blockSuspiciousTransactions: true,
          notificationDelay: 0
        }
      }
    );
  }

  // Add a default sample for all industries
  samples.push({
    name: 'Default Configuration',
    description: 'Standard configuration with default values',
    data: {
      executionTimeout: 3600,
      retryAttempts: 3,
      notificationChannels: ['email']
    }
  });

  return samples;
}

export default router;