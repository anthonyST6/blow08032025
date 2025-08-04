import { logger } from '../utils/logger';
import { UseCaseWorkflow, WorkflowDefinition } from './types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowRegistry {
  private static instance: WorkflowRegistry;
  private workflows: Map<string, UseCaseWorkflow> = new Map();
  private workflowsByIndustry: Map<string, Set<string>> = new Map();
  private workflowVersions: Map<string, UseCaseWorkflow[]> = new Map();

  private constructor() {
    // Delay initialization to avoid circular dependencies
    setTimeout(() => this.initializeDefaultWorkflows(), 0);
  }

  static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  /**
   * Register a new workflow or update existing one
   */
  registerWorkflow(workflow: UseCaseWorkflow): void {
    const existingWorkflow = this.workflows.get(workflow.useCaseId);
    
    // Store version history
    if (existingWorkflow) {
      const versions = this.workflowVersions.get(workflow.useCaseId) || [];
      versions.push(existingWorkflow);
      this.workflowVersions.set(workflow.useCaseId, versions);
    }

    // Update workflow
    workflow.updatedAt = new Date();
    if (!existingWorkflow) {
      workflow.createdAt = new Date();
    }
    
    this.workflows.set(workflow.useCaseId, workflow);
    
    // Update industry index
    if (!this.workflowsByIndustry.has(workflow.industry)) {
      this.workflowsByIndustry.set(workflow.industry, new Set());
    }
    this.workflowsByIndustry.get(workflow.industry)!.add(workflow.useCaseId);
    
    logger.info(`Workflow registered: ${workflow.useCaseId} v${workflow.version}`);
  }

  /**
   * Get workflow by use case ID
   */
  getWorkflow(useCaseId: string): UseCaseWorkflow | undefined {
    return this.workflows.get(useCaseId);
  }

  /**
   * Get all workflows for an industry
   */
  getWorkflowsByIndustry(industry: string): UseCaseWorkflow[] {
    const useCaseIds = this.workflowsByIndustry.get(industry) || new Set();
    return Array.from(useCaseIds)
      .map(id => this.workflows.get(id))
      .filter((w): w is UseCaseWorkflow => w !== undefined);
  }

  /**
   * Get all registered workflows
   */
  getAllWorkflows(): UseCaseWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow version history
   */
  getWorkflowVersions(useCaseId: string): UseCaseWorkflow[] {
    return this.workflowVersions.get(useCaseId) || [];
  }

  /**
   * Check if workflow exists
   */
  hasWorkflow(useCaseId: string): boolean {
    return this.workflows.has(useCaseId);
  }

  /**
   * Remove workflow
   */
  removeWorkflow(useCaseId: string): boolean {
    const workflow = this.workflows.get(useCaseId);
    if (!workflow) return false;

    this.workflows.delete(useCaseId);
    
    // Update industry index
    const industrySet = this.workflowsByIndustry.get(workflow.industry);
    if (industrySet) {
      industrySet.delete(useCaseId);
      if (industrySet.size === 0) {
        this.workflowsByIndustry.delete(workflow.industry);
      }
    }

    logger.info(`Workflow removed: ${useCaseId}`);
    return true;
  }

  /**
   * Get workflow statistics
   */
  getStatistics(): {
    totalWorkflows: number;
    workflowsByIndustry: Record<string, number>;
    workflowsByCriticality: Record<string, number>;
  } {
    const stats = {
      totalWorkflows: this.workflows.size,
      workflowsByIndustry: {} as Record<string, number>,
      workflowsByCriticality: {} as Record<string, number>
    };

    // Count by industry
    this.workflowsByIndustry.forEach((useCaseIds, industry) => {
      stats.workflowsByIndustry[industry] = useCaseIds.size;
    });

    // Count by criticality
    this.workflows.forEach(workflow => {
      const criticality = workflow.metadata.criticality;
      stats.workflowsByCriticality[criticality] = 
        (stats.workflowsByCriticality[criticality] || 0) + 1;
    });

    return stats;
  }

  /**
   * Initialize default workflows
   */
  private initializeDefaultWorkflows(): void {
    try {
      const workflowModules = [
        { name: 'energy', path: './workflows/energy' },
        { name: 'energy-complete', path: './workflows/energy-complete' },
        { name: 'energy-remaining', path: './workflows/energy-remaining' },
        { name: 'energy-missing', path: './workflows/energy-missing' },
        { name: 'healthcare', path: './workflows/healthcare' },
        { name: 'finance', path: './workflows/finance' },
        { name: 'manufacturing', path: './workflows/manufacturing' },
        { name: 'retail', path: './workflows/retail' },
        { name: 'transportation', path: './workflows/transportation' },
        { name: 'education', path: './workflows/education' },
        { name: 'pharmaceuticals', path: './workflows/pharmaceuticals' },
        { name: 'government', path: './workflows/government' },
        { name: 'telecommunications', path: './workflows/telecommunications' },
        { name: 'real-estate', path: './workflows/real-estate' },
        { name: 'agriculture', path: './workflows/agriculture' },
        { name: 'logistics', path: './workflows/logistics' },
        { name: 'hospitality', path: './workflows/hospitality' },
        { name: 'energy-extended', path: './workflows/energy-extended' },
        { name: 'healthcare-extended', path: './workflows/healthcare-extended' },
        { name: 'finance-extended', path: './workflows/finance-extended' },
        { name: 'final-extended', path: './workflows/final-extended' },
        { name: 'missing-use-cases', path: './workflows/missing-use-cases' },
        { name: 'missing-use-cases-complete', path: './workflows/missing-use-cases-complete' },
        { name: 'missing-use-cases-remaining', path: './workflows/missing-use-cases-remaining' },
        { name: 'missing-use-cases-final', path: './workflows/missing-use-cases-final' }
      ];

      const allWorkflows: WorkflowDefinition[] = [];

      for (const module of workflowModules) {
        try {
          const workflowModule = require(module.path);
          if (workflowModule.workflows && Array.isArray(workflowModule.workflows)) {
            allWorkflows.push(...workflowModule.workflows);
          } else if (workflowModule.default && Array.isArray(workflowModule.default)) {
            // Handle ES6 default exports - these are already UseCaseWorkflow objects
            allWorkflows.push(...workflowModule.default.map((workflow: UseCaseWorkflow) => ({ workflow } as WorkflowDefinition)));
          }
        } catch (error) {
          // Skip missing workflow files
          logger.debug(`Workflow module not found: ${module.name}`);
        }
      }

      allWorkflows.forEach((definition: WorkflowDefinition | UseCaseWorkflow) => {
        try {
          // Handle both WorkflowDefinition and direct UseCaseWorkflow objects
          const workflow = (definition as WorkflowDefinition).workflow || (definition as UseCaseWorkflow);
          if (workflow && this.validateWorkflow(workflow)) {
            this.registerWorkflow(workflow);
          }
        } catch (error) {
          logger.error(`Failed to register workflow:`, error);
        }
      });

      logger.info(`Initialized ${this.workflows.size} default workflows`);
    } catch (error) {
      logger.error('Failed to initialize default workflows:', error);
    }
  }

  /**
   * Export workflows to JSON
   */
  exportWorkflows(): string {
    const workflows = Array.from(this.workflows.values());
    return JSON.stringify(workflows, null, 2);
  }

  /**
   * Import workflows from JSON
   */
  importWorkflows(json: string): number {
    try {
      const workflows = JSON.parse(json) as UseCaseWorkflow[];
      let imported = 0;
      
      workflows.forEach(workflow => {
        if (this.validateWorkflow(workflow)) {
          this.registerWorkflow(workflow);
          imported++;
        }
      });

      return imported;
    } catch (error) {
      logger.error('Failed to import workflows', { error });
      throw new Error('Invalid workflow JSON format');
    }
  }

  /**
   * Validate workflow structure
   */
  private validateWorkflow(workflow: any): workflow is UseCaseWorkflow {
    return (
      workflow &&
      typeof workflow.useCaseId === 'string' &&
      typeof workflow.name === 'string' &&
      typeof workflow.industry === 'string' &&
      typeof workflow.version === 'string' &&
      Array.isArray(workflow.steps) &&
      workflow.steps.length > 0 &&
      workflow.metadata &&
      Array.isArray(workflow.metadata.requiredServices) &&
      Array.isArray(workflow.metadata.requiredAgents)
    );
  }

  /**
   * Clone workflow with new ID
   */
  cloneWorkflow(useCaseId: string, newUseCaseId: string): UseCaseWorkflow | null {
    const original = this.workflows.get(useCaseId);
    if (!original) return null;

    const cloned: UseCaseWorkflow = {
      ...original,
      id: uuidv4(),
      useCaseId: newUseCaseId,
      name: `${original.name} (Clone)`,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.registerWorkflow(cloned);
    return cloned;
  }

  /**
   * Search workflows by criteria
   */
  searchWorkflows(criteria: {
    industry?: string;
    criticality?: string;
    tags?: string[];
    compliance?: string[];
  }): UseCaseWorkflow[] {
    let results = Array.from(this.workflows.values());

    if (criteria.industry) {
      results = results.filter(w => w.industry === criteria.industry);
    }

    if (criteria.criticality) {
      results = results.filter(w => w.metadata.criticality === criteria.criticality);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(w => 
        criteria.tags!.some(tag => w.metadata.tags.includes(tag))
      );
    }

    if (criteria.compliance && criteria.compliance.length > 0) {
      results = results.filter(w => 
        criteria.compliance!.some(comp => w.metadata.compliance.includes(comp))
      );
    }

    return results;
  }
}

// Export singleton instance
export const workflowRegistry = WorkflowRegistry.getInstance();