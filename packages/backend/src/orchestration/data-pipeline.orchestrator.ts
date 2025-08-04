import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { serviceRegistry } from './service-registry';
import { workflowRegistry } from './workflow-registry';
import { vanguardActionsService } from '../services/vanguard-actions.service';

export interface DataSource {
  type: 'file' | 'api' | 'database' | 'stream';
  location: string;
  credentials?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DataFormat {
  type: 'csv' | 'json' | 'xml' | 'parquet' | 'excel' | 'text';
  encoding?: string;
  delimiter?: string;
  headers?: boolean;
  schema?: DataSchema;
}

export interface DataSchema {
  fields: SchemaField[];
  primaryKey?: string[];
  indexes?: string[];
  constraints?: SchemaConstraint[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  unique?: boolean;
  default?: any;
  validation?: FieldValidation;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: string; // Custom validation function name
}

export interface SchemaConstraint {
  type: 'unique' | 'foreign_key' | 'check';
  fields: string[];
  reference?: string;
  condition?: string;
}

export interface TransformRule {
  type: 'map' | 'filter' | 'aggregate' | 'join' | 'pivot' | 'custom';
  config: Record<string, any>;
  order: number;
}

export interface ValidationSchema {
  rules: ValidationRule[];
  errorHandling: 'stop' | 'skip' | 'log';
  maxErrors?: number;
}

export interface ValidationRule {
  field?: string;
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom';
  config: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
}

export interface DeploymentTarget {
  type: 'database' | 'api' | 'file' | 'queue' | 'stream';
  environment: 'development' | 'staging' | 'production';
  location: string;
  credentials?: Record<string, any>;
  options?: Record<string, any>;
}

export interface Dataset {
  id: string;
  name: string;
  source: DataSource;
  format: DataFormat;
  schema?: DataSchema;
  metadata: {
    rowCount?: number;
    sizeBytes?: number;
    createdAt: Date;
    updatedAt: Date;
    checksum?: string;
    tags?: string[];
  };
  data?: any[]; // For in-memory datasets
  location?: string; // For file-based datasets
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current: number;
    total: number;
    stage: string;
    message?: string;
  };
  stages: StageExecution[];
  startedAt: Date;
  completedAt?: Date;
  error?: Error;
  results?: PipelineResults;
}

export interface StageExecution {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  metrics?: Record<string, any>;
  error?: Error;
}

export interface PipelineResults {
  dataset: Dataset;
  validationReport?: ValidationReport;
  transformationMetrics?: Record<string, any>;
  deploymentStatus?: DeploymentStatus;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    skippedRecords: number;
  };
}

export interface ValidationError {
  row?: number;
  field?: string;
  value?: any;
  rule: string;
  message: string;
}

export interface ValidationWarning {
  row?: number;
  field?: string;
  message: string;
}

export interface DeploymentStatus {
  deployed: boolean;
  target: DeploymentTarget;
  recordsDeployed?: number;
  deploymentTime?: number;
  rollbackAvailable?: boolean;
  error?: Error;
}

export class DataPipelineOrchestrator extends EventEmitter {
  private static instance: DataPipelineOrchestrator;
  private activeExecutions: Map<string, PipelineExecution> = new Map();
  private datasets: Map<string, Dataset> = new Map();

  private constructor() {
    super();
  }

  static getInstance(): DataPipelineOrchestrator {
    if (!DataPipelineOrchestrator.instance) {
      DataPipelineOrchestrator.instance = new DataPipelineOrchestrator();
    }
    return DataPipelineOrchestrator.instance;
  }

  /**
   * Ingest data from a source
   */
  async ingest(
    source: DataSource,
    format: DataFormat,
    options?: {
      name?: string;
      batchSize?: number;
      parallel?: boolean;
    }
  ): Promise<Dataset> {
    const executionId = uuidv4();
    const datasetId = uuidv4();
    
    logger.info('Starting data ingestion', {
      executionId,
      sourceType: source.type,
      formatType: format.type
    });

    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: 'ingestion',
      status: 'running',
      progress: {
        current: 0,
        total: 100,
        stage: 'ingestion'
      },
      stages: [],
      startedAt: new Date()
    };

    this.activeExecutions.set(executionId, execution);
    this.emit('ingestion:started', { executionId, source, format });

    try {
      // Stage 1: Connect to source
      const connectStage = await this.executeStage(execution, 'connect', async () => {
        return await this.connectToSource(source);
      });

      // Stage 2: Read data
      const readStage = await this.executeStage(execution, 'read', async () => {
        return await this.readData(source, format, options?.batchSize);
      });

      // Stage 3: Parse data
      const parseStage = await this.executeStage(execution, 'parse', async () => {
        return await this.parseData(readStage.result, format);
      });

      // Stage 4: Infer schema
      const schemaStage = await this.executeStage(execution, 'schema', async () => {
        return await this.inferSchema(parseStage.result, format);
      });

      // Create dataset
      const dataset: Dataset = {
        id: datasetId,
        name: options?.name || `dataset-${Date.now()}`,
        source,
        format,
        schema: schemaStage.result,
        metadata: {
          rowCount: parseStage.result.length,
          sizeBytes: JSON.stringify(parseStage.result).length,
          createdAt: new Date(),
          updatedAt: new Date(),
          checksum: this.calculateChecksum(parseStage.result)
        },
        data: parseStage.result
      };

      this.datasets.set(datasetId, dataset);

      // Complete execution
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.results = { dataset };

      this.emit('ingestion:completed', { executionId, dataset });

      // Log vanguard action
      await vanguardActionsService.logAction({
        agent: 'data-pipeline',
        systemTargeted: 'data-ingestion',
        actionType: 'Write',
        recordAffected: datasetId,
        payloadSummary: {
          source: source.type,
          format: format.type,
          records: dataset.metadata.rowCount
        },
        responseConfirmation: 'Data ingested successfully',
        status: 'success'
      });

      return dataset;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error as Error;

      this.emit('ingestion:failed', { executionId, error });
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Transform dataset with rules
   */
  async transform(
    dataset: Dataset,
    rules: TransformRule[],
    options?: {
      inPlace?: boolean;
      parallel?: boolean;
    }
  ): Promise<Dataset> {
    const executionId = uuidv4();
    
    logger.info('Starting data transformation', {
      executionId,
      datasetId: dataset.id,
      ruleCount: rules.length
    });

    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: 'transformation',
      status: 'running',
      progress: {
        current: 0,
        total: rules.length,
        stage: 'transformation'
      },
      stages: [],
      startedAt: new Date()
    };

    this.activeExecutions.set(executionId, execution);
    this.emit('transformation:started', { executionId, dataset, rules });

    try {
      let transformedData = options?.inPlace ? (dataset.data || []) : [...(dataset.data || [])];
      const sortedRules = [...rules].sort((a, b) => a.order - b.order);

      for (const rule of sortedRules) {
        const stage = await this.executeStage(
          execution,
          `transform-${rule.type}`,
          async () => {
            return await this.applyTransformRule(transformedData || [], rule);
          }
        );
        transformedData = stage.result;
        
        execution.progress.current++;
        this.emit('transformation:progress', {
          executionId,
          progress: execution.progress
        });
      }

      // Create new dataset or update existing
      const transformedDataset: Dataset = options?.inPlace ? dataset : {
        ...dataset,
        id: uuidv4(),
        name: `${dataset.name}-transformed`,
        data: transformedData,
        metadata: {
          ...dataset.metadata,
          rowCount: transformedData?.length || 0,
          updatedAt: new Date(),
          tags: [...(dataset.metadata.tags || []), 'transformed']
        }
      };

      if (options?.inPlace) {
        dataset.data = transformedData;
        dataset.metadata.updatedAt = new Date();
      } else {
        this.datasets.set(transformedDataset.id, transformedDataset);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.results = { dataset: transformedDataset };

      this.emit('transformation:completed', { executionId, dataset: transformedDataset });

      return transformedDataset;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error as Error;

      this.emit('transformation:failed', { executionId, error });
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Validate dataset against schema
   */
  async validate(
    dataset: Dataset,
    schema: ValidationSchema
  ): Promise<ValidationReport> {
    const executionId = uuidv4();
    
    logger.info('Starting data validation', {
      executionId,
      datasetId: dataset.id,
      ruleCount: schema.rules.length
    });

    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: 'validation',
      status: 'running',
      progress: {
        current: 0,
        total: dataset.metadata.rowCount || 0,
        stage: 'validation'
      },
      stages: [],
      startedAt: new Date()
    };

    this.activeExecutions.set(executionId, execution);
    this.emit('validation:started', { executionId, dataset, schema });

    try {
      const report: ValidationReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: {
          totalRecords: dataset.metadata.rowCount || 0,
          validRecords: 0,
          invalidRecords: 0,
          skippedRecords: 0
        }
      };

      const data = dataset.data || [];
      
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const recordErrors: ValidationError[] = [];
        const recordWarnings: ValidationWarning[] = [];

        for (const rule of schema.rules) {
          const validation = await this.validateRecord(record, rule, i);
          
          if (validation.error) {
            if (rule.severity === 'error') {
              recordErrors.push(validation.error);
            } else if (rule.severity === 'warning') {
              recordWarnings.push({
                row: i,
                field: validation.error.field,
                message: validation.error.message
              });
            }
          }
        }

        if (recordErrors.length > 0) {
          report.errors.push(...recordErrors);
          report.summary.invalidRecords++;
          
          if (schema.errorHandling === 'stop') {
            report.valid = false;
            break;
          }
        } else {
          report.summary.validRecords++;
        }

        report.warnings.push(...recordWarnings);

        execution.progress.current = i + 1;
        if (i % 100 === 0) {
          this.emit('validation:progress', {
            executionId,
            progress: execution.progress
          });
        }
      }

      report.valid = report.errors.length === 0 || 
                    (schema.errorHandling !== 'stop' && 
                     (!schema.maxErrors || report.errors.length <= schema.maxErrors));

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.results = { 
        dataset,
        validationReport: report 
      };

      this.emit('validation:completed', { executionId, report });

      return report;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error as Error;

      this.emit('validation:failed', { executionId, error });
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Deploy dataset to target
   */
  async deploy(
    dataset: Dataset,
    target: DeploymentTarget,
    options?: {
      batchSize?: number;
      overwrite?: boolean;
      dryRun?: boolean;
    }
  ): Promise<DeploymentStatus> {
    const executionId = uuidv4();
    
    logger.info('Starting data deployment', {
      executionId,
      datasetId: dataset.id,
      targetType: target.type,
      environment: target.environment
    });

    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: 'deployment',
      status: 'running',
      progress: {
        current: 0,
        total: dataset.metadata.rowCount || 0,
        stage: 'deployment'
      },
      stages: [],
      startedAt: new Date()
    };

    this.activeExecutions.set(executionId, execution);
    this.emit('deployment:started', { executionId, dataset, target });

    try {
      // Check if dry run
      if (options?.dryRun) {
        logger.info('Dry run mode - simulating deployment');
        
        const status: DeploymentStatus = {
          deployed: false,
          target,
          recordsDeployed: dataset.metadata.rowCount,
          deploymentTime: 0,
          rollbackAvailable: false
        };

        execution.status = 'completed';
        execution.completedAt = new Date();
        
        this.emit('deployment:completed', { executionId, status, dryRun: true });
        return status;
      }

      // Stage 1: Connect to target
      const connectStage = await this.executeStage(execution, 'connect', async () => {
        return await this.connectToTarget(target);
      });

      // Stage 2: Prepare data
      const prepareStage = await this.executeStage(execution, 'prepare', async () => {
        return await this.prepareDataForDeployment(dataset, target);
      });

      // Stage 3: Deploy data
      const deployStage = await this.executeStage(execution, 'deploy', async () => {
        return await this.deployData(
          prepareStage.result,
          target,
          connectStage.result,
          options
        );
      });

      const status: DeploymentStatus = {
        deployed: true,
        target,
        recordsDeployed: deployStage.result.recordsDeployed,
        deploymentTime: Date.now() - execution.startedAt.getTime(),
        rollbackAvailable: true
      };

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.results = {
        dataset,
        deploymentStatus: status
      };

      this.emit('deployment:completed', { executionId, status });

      // Log vanguard action
      await vanguardActionsService.logAction({
        agent: 'data-pipeline',
        systemTargeted: 'data-deployment',
        actionType: 'Write',
        recordAffected: dataset.id,
        payloadSummary: {
          target: target.type,
          environment: target.environment,
          records: status.recordsDeployed
        },
        responseConfirmation: 'Data deployed successfully',
        status: 'success'
      });

      return status;
    } catch (error) {
      const status: DeploymentStatus = {
        deployed: false,
        target,
        error: error as Error
      };

      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error as Error;

      this.emit('deployment:failed', { executionId, error });
      
      return status;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute a full pipeline
   */
  async executePipeline(
    source: DataSource,
    format: DataFormat,
    transformRules: TransformRule[],
    validationSchema: ValidationSchema,
    target: DeploymentTarget,
    options?: {
      name?: string;
      stopOnValidationError?: boolean;
    }
  ): Promise<PipelineResults> {
    logger.info('Executing full data pipeline', {
      source: source.type,
      target: target.type
    });

    try {
      // Step 1: Ingest
      const dataset = await this.ingest(source, format, { name: options?.name });

      // Step 2: Transform
      const transformedDataset = await this.transform(dataset, transformRules);

      // Step 3: Validate
      const validationReport = await this.validate(transformedDataset, validationSchema);

      if (!validationReport.valid && options?.stopOnValidationError) {
        throw new Error(`Validation failed with ${validationReport.errors.length} errors`);
      }

      // Step 4: Deploy
      const deploymentStatus = await this.deploy(transformedDataset, target);

      return {
        dataset: transformedDataset,
        validationReport,
        deploymentStatus
      };
    } catch (error) {
      logger.error('Pipeline execution failed', { error });
      throw error;
    }
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): PipelineExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get dataset by ID
   */
  getDataset(datasetId: string): Dataset | undefined {
    return this.datasets.get(datasetId);
  }

  /**
   * List all datasets
   */
  listDatasets(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  /**
   * Delete dataset
   */
  deleteDataset(datasetId: string): boolean {
    return this.datasets.delete(datasetId);
  }

  // Private helper methods

  private async executeStage(
    execution: PipelineExecution,
    stageName: string,
    fn: () => Promise<any>
  ): Promise<{ result: any; stage: StageExecution }> {
    const stage: StageExecution = {
      name: stageName,
      status: 'running',
      startedAt: new Date()
    };

    execution.stages.push(stage);

    try {
      const result = await fn();
      stage.status = 'completed';
      stage.completedAt = new Date();
      return { result, stage };
    } catch (error) {
      stage.status = 'failed';
      stage.completedAt = new Date();
      stage.error = error as Error;
      throw error;
    }
  }

  private async connectToSource(source: DataSource): Promise<any> {
    // Implementation would connect to various sources
    logger.info('Connecting to data source', { type: source.type });
    return { connected: true };
  }

  private async readData(
    source: DataSource,
    format: DataFormat,
    batchSize?: number
  ): Promise<any> {
    // Implementation would read data from source
    logger.info('Reading data from source', { 
      type: source.type,
      format: format.type,
      batchSize 
    });
    
    // Mock data for demonstration
    return [
      { id: 1, name: 'Sample 1', value: 100 },
      { id: 2, name: 'Sample 2', value: 200 },
      { id: 3, name: 'Sample 3', value: 300 }
    ];
  }

  private async parseData(rawData: any, format: DataFormat): Promise<any[]> {
    // Implementation would parse different formats
    logger.info('Parsing data', { format: format.type });
    return Array.isArray(rawData) ? rawData : [rawData];
  }

  private async inferSchema(data: any[], format: DataFormat): Promise<DataSchema> {
    // Implementation would infer schema from data
    logger.info('Inferring schema from data');
    
    if (!data.length) {
      return { fields: [] };
    }

    const sample = data[0];
    const fields: SchemaField[] = Object.keys(sample).map(key => ({
      name: key,
      type: this.inferFieldType(sample[key]),
      required: true
    }));

    return { fields };
  }

  private inferFieldType(value: any): SchemaField['type'] {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  }

  private calculateChecksum(data: any): string {
    // Simple checksum for demonstration
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
  }

  private async applyTransformRule(data: any[], rule: TransformRule): Promise<any[]> {
    logger.info('Applying transform rule', { type: rule.type });
    
    switch (rule.type) {
      case 'map':
        return data.map(record => rule.config.mapper(record));
      
      case 'filter':
        return data.filter(record => rule.config.predicate(record));
      
      case 'aggregate':
        // Implementation would handle aggregations
        return data;
      
      default:
        return data;
    }
  }

  private async validateRecord(
    record: any,
    rule: ValidationRule,
    rowIndex: number
  ): Promise<{ error?: ValidationError }> {
    try {
      switch (rule.type) {
        case 'required':
          if (rule.field && !record[rule.field]) {
            return {
              error: {
                row: rowIndex,
                field: rule.field,
                value: record[rule.field],
                rule: 'required',
                message: `Field ${rule.field} is required`
              }
            };
          }
          break;
        
        case 'type':
          // Type validation logic
          break;
        
        case 'range':
          // Range validation logic
          break;
        
        case 'pattern':
          // Pattern validation logic
          break;
      }
      
      return {};
    } catch (error) {
      return {
        error: {
          row: rowIndex,
          rule: rule.type,
          message: `Validation error: ${error}`
        }
      };
    }
  }

  private async connectToTarget(target: DeploymentTarget): Promise<any> {
    logger.info('Connecting to deployment target', { 
      type: target.type,
      environment: target.environment 
    });
    return { connected: true };
  }

  private async prepareDataForDeployment(
    dataset: Dataset,
    target: DeploymentTarget
  ): Promise<any> {
    logger.info('Preparing data for deployment', {
      datasetId: dataset.id,
      targetType: target.type
    });
    return dataset.data;
  }

  private async deployData(
    data: any,
    target: DeploymentTarget,
    connection: any,
    options?: any
  ): Promise<{ recordsDeployed: number }> {
    logger.info('Deploying data to target', {
      targetType: target.type,
      recordCount: Array.isArray(data) ? data.length : 1
    });
    
    // Implementation would deploy to various targets
    return {
      recordsDeployed: Array.isArray(data) ? data.length : 1
    };
  }
}

// Export singleton instance
export const dataPipelineOrchestrator = DataPipelineOrchestrator.getInstance();