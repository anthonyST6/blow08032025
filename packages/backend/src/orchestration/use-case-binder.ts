import { logger } from '../utils/logger';
import { PromptRoute } from './prompt-router';

export interface UseCase {
  id: string;
  name: string;
  description: string;
  vertical: string;
  workflow: WorkflowDefinition;
  requiredAgents: string[];
  regulations?: string[];
  thresholds?: Record<string, { min?: number; max?: number }>;
  metadata?: Record<string, any>;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  parallelExecution?: boolean;
  timeout?: number; // milliseconds
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  config?: Record<string, any>;
  dependencies?: string[]; // Step IDs that must complete before this step
  optional?: boolean;
  timeout?: number;
}

export interface UseCaseBinding {
  id: string;
  useCaseId: string;
  promptRoute: PromptRoute;
  workflow: WorkflowDefinition;
  context: UseCaseContext;
  timestamp: Date;
}

export interface UseCaseContext {
  vertical: string;
  useCase: string;
  regulations: string[];
  thresholds: Record<string, { min?: number; max?: number }>;
  domainSpecificData?: Record<string, any>;
}

export class UseCaseBinder {
  private useCases: Map<string, UseCase> = new Map();

  constructor() {
    this.initializeUseCases();
  }

  /**
   * Initialize predefined use cases
   */
  private initializeUseCases(): void {
    // Energy - O&G Land Lease Use Case
    this.registerUseCase({
      id: 'energy-oil-gas-lease',
      name: 'Oil & Gas Land Lease Review',
      description: 'Comprehensive review of oil and gas lease agreements including mineral rights, royalties, and environmental compliance',
      vertical: 'energy',
      workflow: {
        steps: [
          {
            id: 'domain-analysis',
            name: 'Energy Domain Analysis',
            agentId: 'energy-domain-agent',
            config: {
              focus: ['mineral-rights', 'royalties', 'environmental'],
            },
          },
          {
            id: 'security-check',
            name: 'Security Validation',
            agentId: 'security-sentinel',
            dependencies: ['domain-analysis'],
          },
          {
            id: 'integrity-check',
            name: 'Integrity Verification',
            agentId: 'integrity-auditor',
            dependencies: ['security-check'],
          },
          {
            id: 'accuracy-check',
            name: 'Accuracy Validation',
            agentId: 'accuracy-engine',
            dependencies: ['integrity-check'],
          },
          {
            id: 'lease-validation',
            name: 'Lease Terms Validation',
            agentId: 'lease-validator',
            dependencies: ['accuracy-check'],
            optional: true,
          },
        ],
        timeout: 300000, // 5 minutes
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 2,
        },
      },
      requiredAgents: [
        'energy-domain-agent',
        'security-sentinel',
        'integrity-auditor',
        'accuracy-engine',
      ],
      regulations: ['EPA', 'FERC', 'State Energy Regulations'],
      thresholds: {
        'royalty-rate': { min: 0.125, max: 0.25 }, // 12.5% - 25%
        'lease-term-years': { min: 3, max: 10 },
        'bonus-per-acre': { min: 100, max: 10000 },
      },
    });

    // Government - LED Use Case
    this.registerUseCase({
      id: 'government-led',
      name: 'LED Lighting Contract Review',
      description: 'Review of government LED lighting procurement contracts for compliance and cost-effectiveness',
      vertical: 'government',
      workflow: {
        steps: [
          {
            id: 'domain-analysis',
            name: 'Government Domain Analysis',
            agentId: 'government-domain-agent',
            config: {
              focus: ['procurement', 'compliance', 'cost-analysis'],
            },
          },
          {
            id: 'security-check',
            name: 'Security Validation',
            agentId: 'security-sentinel',
            dependencies: ['domain-analysis'],
          },
          {
            id: 'integrity-check',
            name: 'Integrity Verification',
            agentId: 'integrity-auditor',
            dependencies: ['security-check'],
          },
          {
            id: 'accuracy-check',
            name: 'Accuracy Validation',
            agentId: 'accuracy-engine',
            dependencies: ['integrity-check'],
          },
          {
            id: 'procurement-validation',
            name: 'Procurement Rules Validation',
            agentId: 'procurement-validator',
            dependencies: ['accuracy-check'],
          },
        ],
        timeout: 240000, // 4 minutes
      },
      requiredAgents: [
        'government-domain-agent',
        'security-sentinel',
        'integrity-auditor',
        'accuracy-engine',
        'procurement-validator',
      ],
      regulations: ['FAR', 'State Procurement Laws', 'Energy Star Requirements'],
      thresholds: {
        'cost-per-unit': { max: 500 },
        'warranty-years': { min: 5 },
        'energy-efficiency-lumens-per-watt': { min: 100 },
      },
    });

    // Insurance - Continental Use Case
    this.registerUseCase({
      id: 'insurance-continental',
      name: 'Continental Insurance Policy Review',
      description: 'Comprehensive review of commercial property insurance policies for coverage adequacy and compliance',
      vertical: 'insurance',
      workflow: {
        steps: [
          {
            id: 'domain-analysis',
            name: 'Insurance Domain Analysis',
            agentId: 'insurance-domain-agent',
            config: {
              focus: ['coverage', 'exclusions', 'premiums', 'deductibles'],
            },
          },
          {
            id: 'security-check',
            name: 'Security Validation',
            agentId: 'security-sentinel',
            dependencies: ['domain-analysis'],
          },
          {
            id: 'integrity-check',
            name: 'Integrity Verification',
            agentId: 'integrity-auditor',
            dependencies: ['security-check'],
          },
          {
            id: 'accuracy-check',
            name: 'Accuracy Validation',
            agentId: 'accuracy-engine',
            dependencies: ['integrity-check'],
          },
          {
            id: 'risk-assessment',
            name: 'Risk Assessment',
            agentId: 'risk-assessor',
            dependencies: ['accuracy-check'],
          },
        ],
        timeout: 300000, // 5 minutes
      },
      requiredAgents: [
        'insurance-domain-agent',
        'security-sentinel',
        'integrity-auditor',
        'accuracy-engine',
        'risk-assessor',
      ],
      regulations: ['State Insurance Laws', 'NAIC Guidelines'],
      thresholds: {
        'coverage-limit': { min: 1000000 },
        'deductible': { max: 50000 },
        'premium-to-coverage-ratio': { max: 0.05 },
      },
    });

    // Healthcare - Compliance Use Case (Scaffolding)
    this.registerUseCase({
      id: 'healthcare-compliance',
      name: 'Healthcare Compliance Review',
      description: 'Review of healthcare documentation for HIPAA compliance and patient privacy',
      vertical: 'healthcare',
      workflow: {
        steps: [
          {
            id: 'domain-analysis',
            name: 'Healthcare Domain Analysis',
            agentId: 'healthcare-domain-agent',
          },
          {
            id: 'security-check',
            name: 'Security Validation',
            agentId: 'security-sentinel',
            dependencies: ['domain-analysis'],
          },
          {
            id: 'integrity-check',
            name: 'Integrity Verification',
            agentId: 'integrity-auditor',
            dependencies: ['security-check'],
          },
          {
            id: 'accuracy-check',
            name: 'Accuracy Validation',
            agentId: 'accuracy-engine',
            dependencies: ['integrity-check'],
          },
        ],
      },
      requiredAgents: [
        'healthcare-domain-agent',
        'security-sentinel',
        'integrity-auditor',
        'accuracy-engine',
      ],
      regulations: ['HIPAA', 'HITECH', 'State Privacy Laws'],
    });

    // Finance - Regulatory Use Case (Scaffolding)
    this.registerUseCase({
      id: 'finance-regulatory',
      name: 'Financial Regulatory Review',
      description: 'Review of financial documents for SOX compliance and regulatory requirements',
      vertical: 'finance',
      workflow: {
        steps: [
          {
            id: 'domain-analysis',
            name: 'Finance Domain Analysis',
            agentId: 'finance-domain-agent',
          },
          {
            id: 'security-check',
            name: 'Security Validation',
            agentId: 'security-sentinel',
            dependencies: ['domain-analysis'],
          },
          {
            id: 'integrity-check',
            name: 'Integrity Verification',
            agentId: 'integrity-auditor',
            dependencies: ['security-check'],
          },
          {
            id: 'accuracy-check',
            name: 'Accuracy Validation',
            agentId: 'accuracy-engine',
            dependencies: ['integrity-check'],
          },
        ],
      },
      requiredAgents: [
        'finance-domain-agent',
        'security-sentinel',
        'integrity-auditor',
        'accuracy-engine',
      ],
      regulations: ['SOX', 'SEC Regulations', 'Dodd-Frank'],
    });
  }

  /**
   * Register a new use case
   */
  registerUseCase(useCase: UseCase): void {
    this.useCases.set(useCase.id, useCase);
    logger.info(`Registered use case: ${useCase.name} (${useCase.id})`);
  }

  /**
   * Bind a prompt route to a specific use case
   */
  async bind(route: PromptRoute, useCaseId?: string): Promise<UseCaseBinding> {
    const startTime = Date.now();
    logger.info('Binding prompt route to use case', {
      routeId: route.id,
      providedUseCaseId: useCaseId,
      routeUseCase: route.useCase,
    });

    try {
      // Determine use case
      const selectedUseCaseId = useCaseId || route.useCase || this.inferUseCase(route);
      const useCase = this.useCases.get(selectedUseCaseId);

      if (!useCase) {
        throw new Error(`Use case not found: ${selectedUseCaseId}`);
      }

      // Validate vertical match
      if (useCase.vertical !== route.vertical && route.vertical !== 'general') {
        logger.warn('Vertical mismatch between route and use case', {
          routeVertical: route.vertical,
          useCaseVertical: useCase.vertical,
        });
      }

      // Create context
      const context: UseCaseContext = {
        vertical: useCase.vertical,
        useCase: useCase.id,
        regulations: useCase.regulations || [],
        thresholds: useCase.thresholds || {},
        domainSpecificData: this.extractDomainSpecificData(route, useCase),
      };

      // Create binding
      const binding: UseCaseBinding = {
        id: this.generateBindingId(),
        useCaseId: useCase.id,
        promptRoute: route,
        workflow: this.customizeWorkflow(useCase.workflow, route),
        context,
        timestamp: new Date(),
      };

      logger.info('Use case binding created', {
        bindingId: binding.id,
        useCaseId: binding.useCaseId,
        workflowSteps: binding.workflow.steps.length,
        processingTime: Date.now() - startTime,
      });

      return binding;
    } catch (error) {
      logger.error('Failed to bind use case', { error });
      throw error;
    }
  }

  /**
   * Infer use case from route if not explicitly provided
   */
  private inferUseCase(route: PromptRoute): string {
    // Check if route already has a use case
    if (route.useCase && route.useCase !== 'general') {
      return route.useCase;
    }

    // Try to match based on vertical and metadata
    const verticalUseCases = Array.from(this.useCases.values())
      .filter(uc => uc.vertical === route.vertical);

    if (verticalUseCases.length === 1) {
      return verticalUseCases[0].id;
    }

    // If multiple use cases for vertical, try to match based on keywords
    if (route.metadata?.analysis?.keywords) {
      const keywords = route.metadata.analysis.keywords as string[];
      let bestMatch: { useCase: UseCase; score: number } | null = null;

      for (const useCase of verticalUseCases) {
        let score = 0;
        const useCaseKeywords = useCase.name.toLowerCase().split(/\s+/);
        
        for (const keyword of keywords) {
          if (useCaseKeywords.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { useCase, score };
        }
      }

      if (bestMatch && bestMatch.score > 0) {
        return bestMatch.useCase.id;
      }
    }

    // Default to first use case for vertical or general
    return verticalUseCases[0]?.id || 'general-analysis';
  }

  /**
   * Extract domain-specific data from route
   */
  private extractDomainSpecificData(route: PromptRoute, useCase: UseCase): Record<string, any> {
    const data: Record<string, any> = {};

    // Extract entities from route analysis
    if (route.metadata?.analysis?.entities) {
      data.entities = route.metadata.analysis.entities;
    }

    // Add use case specific data
    switch (useCase.id) {
      case 'energy-oil-gas-lease':
        data.leaseType = 'oil-gas';
        data.requiredValidations = ['mineral-rights', 'environmental-compliance'];
        break;
      case 'government-led':
        data.contractType = 'procurement';
        data.requiredValidations = ['vendor-eligibility', 'cost-reasonableness'];
        break;
      case 'insurance-continental':
        data.policyType = 'commercial-property';
        data.requiredValidations = ['coverage-adequacy', 'premium-calculation'];
        break;
    }

    return data;
  }

  /**
   * Customize workflow based on route specifics
   */
  private customizeWorkflow(baseWorkflow: WorkflowDefinition, route: PromptRoute): WorkflowDefinition {
    const workflow = JSON.parse(JSON.stringify(baseWorkflow)); // Deep clone

    // Add suggested agents from route if not already in workflow
    if (route.suggestedAgents) {
      for (const agentId of route.suggestedAgents) {
        const exists = workflow.steps.some((step: WorkflowStep) => step.agentId === agentId);
        if (!exists && !['security-sentinel', 'integrity-auditor', 'accuracy-engine'].includes(agentId)) {
          // Add as optional step
          workflow.steps.push({
            id: `dynamic-${agentId}`,
            name: `Dynamic ${agentId}`,
            agentId,
            optional: true,
            dependencies: workflow.steps.length > 0 ? [workflow.steps[workflow.steps.length - 1].id] : [],
          });
        }
      }
    }

    // Adjust timeout based on confidence
    if (route.confidence < 0.5) {
      workflow.timeout = (workflow.timeout || 300000) * 1.5; // Increase timeout for low confidence
    }

    return workflow;
  }

  /**
   * Generate unique binding ID
   */
  private generateBindingId(): string {
    return `binding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get use case by ID
   */
  getUseCase(useCaseId: string): UseCase | undefined {
    return this.useCases.get(useCaseId);
  }

  /**
   * Get all use cases
   */
  getAllUseCases(): UseCase[] {
    return Array.from(this.useCases.values());
  }

  /**
   * Get use cases by vertical
   */
  getUseCasesByVertical(vertical: string): UseCase[] {
    return Array.from(this.useCases.values())
      .filter(uc => uc.vertical === vertical);
  }

  /**
   * Update use case
   */
  updateUseCase(useCaseId: string, updates: Partial<UseCase>): void {
    const useCase = this.useCases.get(useCaseId);
    if (!useCase) {
      throw new Error(`Use case not found: ${useCaseId}`);
    }

    const updatedUseCase = { ...useCase, ...updates, id: useCaseId };
    this.useCases.set(useCaseId, updatedUseCase);
    logger.info(`Updated use case: ${useCaseId}`);
  }

  /**
   * Delete use case
   */
  deleteUseCase(useCaseId: string): void {
    if (this.useCases.delete(useCaseId)) {
      logger.info(`Deleted use case: ${useCaseId}`);
    } else {
      throw new Error(`Use case not found: ${useCaseId}`);
    }
  }
}

// Export singleton instance
export const useCaseBinder = new UseCaseBinder();