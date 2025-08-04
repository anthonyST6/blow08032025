import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { workflowRegistry } from './workflow-registry';
import { UseCaseWorkflow } from './types/workflow.types';

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  industryId: string;
  useCaseId: string;
  version: string;
  variables: TemplateVariable[];
  sections: TemplateSection[];
  defaults: Record<string, any>;
  validation: TemplateValidation;
  metadata: {
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    complexity: 'low' | 'medium' | 'high';
  };
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'enum';
  label: string;
  description?: string;
  required: boolean;
  default?: any;
  validation?: VariableValidation;
  options?: VariableOption[]; // For enum types
  dependsOn?: string[]; // Other variables this depends on
  visibility?: VisibilityCondition;
}

export interface VariableValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  custom?: string; // Custom validation function name
}

export interface VariableOption {
  value: any;
  label: string;
  description?: string;
}

export interface VisibilityCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'in' | 'not_in' | 'exists';
  value: any;
}

export interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  variables: string[]; // Variable names in this section
  collapsed?: boolean;
  visibility?: VisibilityCondition;
}

export interface TemplateValidation {
  rules: ValidationRule[];
  crossFieldValidation?: CrossFieldValidation[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CrossFieldValidation {
  fields: string[];
  validator: string; // Function name
  message: string;
}

export interface Configuration {
  templateId: string;
  values: Record<string, any>;
  metadata: {
    createdAt: Date;
    createdBy?: string;
    name?: string;
    description?: string;
  };
}

export interface ConfigVariant {
  id: string;
  baseConfigId: string;
  name: string;
  description?: string;
  overrides: Record<string, any>;
  metadata: {
    createdAt: Date;
    purpose?: string;
    performance?: Record<string, any>;
  };
}

export class ConfigTemplateEngine {
  private static instance: ConfigTemplateEngine;
  private templates: Map<string, ConfigTemplate> = new Map();
  private configurations: Map<string, Configuration> = new Map();
  private validators: Map<string, Function> = new Map();

  private constructor() {
    this.initializeBuiltInValidators();
    this.loadDefaultTemplates();
  }

  static getInstance(): ConfigTemplateEngine {
    if (!ConfigTemplateEngine.instance) {
      ConfigTemplateEngine.instance = new ConfigTemplateEngine();
    }
    return ConfigTemplateEngine.instance;
  }

  /**
   * Load a template for a specific industry and use case
   */
  async loadTemplate(industryId: string, useCaseId: string): Promise<ConfigTemplate | null> {
    const templateKey = `${industryId}:${useCaseId}`;
    
    // Check cache first
    if (this.templates.has(templateKey)) {
      return this.templates.get(templateKey)!;
    }

    // Try to load from workflow registry
    const workflow = workflowRegistry.getWorkflow(useCaseId);
    if (!workflow || workflow.industry !== industryId) {
      logger.warn('No workflow found for template', { industryId, useCaseId });
      return null;
    }

    // Generate template from workflow
    const template = this.generateTemplateFromWorkflow(workflow, industryId);
    this.templates.set(templateKey, template);

    return template;
  }

  /**
   * Apply data to a template to create a configuration
   */
  applyData(template: ConfigTemplate, data: any): Configuration {
    // Merge with defaults
    const values = { ...template.defaults };

    // Apply provided data
    for (const variable of template.variables) {
      if (data[variable.name] !== undefined) {
        values[variable.name] = this.castValue(data[variable.name], variable.type);
      } else if (variable.required && values[variable.name] === undefined) {
        throw new Error(`Required variable '${variable.name}' is missing`);
      }
    }

    // Create configuration
    const config: Configuration = {
      templateId: template.id,
      values,
      metadata: {
        createdAt: new Date(),
        name: data._name || `${template.name} Configuration`,
        description: data._description
      }
    };

    return config;
  }

  /**
   * Validate a configuration against its template
   */
  validate(config: Configuration): ValidationResult {
    const template = Array.from(this.templates.values())
      .find(t => t.id === config.templateId);

    if (!template) {
      return {
        valid: false,
        errors: [{ field: 'templateId', message: 'Template not found', severity: 'error' }]
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate each variable
    for (const variable of template.variables) {
      const value = config.values[variable.name];

      // Check required
      if (variable.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: variable.name,
          message: `${variable.label} is required`,
          severity: 'error'
        });
        continue;
      }

      // Skip validation if not required and empty
      if (!variable.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (!this.validateType(value, variable.type)) {
        errors.push({
          field: variable.name,
          message: `${variable.label} must be of type ${variable.type}`,
          severity: 'error'
        });
        continue;
      }

      // Variable-specific validation
      if (variable.validation) {
        const validationErrors = this.validateVariable(value, variable);
        errors.push(...validationErrors.filter(e => e.severity === 'error'));
        warnings.push(...validationErrors.filter(e => e.severity === 'warning'));
      }
    }

    // Cross-field validation
    if (template.validation.crossFieldValidation) {
      for (const rule of template.validation.crossFieldValidation) {
        const validator = this.validators.get(rule.validator);
        if (validator) {
          const fieldValues = rule.fields.map(f => config.values[f]);
          if (!validator(...fieldValues)) {
            errors.push({
              field: rule.fields.join(','),
              message: rule.message,
              severity: 'error'
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate configuration variants
   */
  generateVariants(baseConfig: Configuration, variations: VariationRule[]): ConfigVariant[] {
    const variants: ConfigVariant[] = [];

    for (const variation of variations) {
      const variant = this.applyVariation(baseConfig, variation);
      variants.push(variant);
    }

    return variants;
  }

  /**
   * Register a custom validator
   */
  registerValidator(name: string, validator: Function): void {
    this.validators.set(name, validator);
    logger.info(`Registered custom validator: ${name}`);
  }

  /**
   * Get all templates for an industry
   */
  getTemplatesByIndustry(industryId: string): ConfigTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.industryId === industryId);
  }

  /**
   * Save a configuration
   */
  saveConfiguration(config: Configuration): string {
    const configId = uuidv4();
    this.configurations.set(configId, config);
    return configId;
  }

  /**
   * Load a saved configuration
   */
  loadConfiguration(configId: string): Configuration | null {
    return this.configurations.get(configId) || null;
  }

  /**
   * Export template as JSON
   */
  exportTemplate(template: ConfigTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(json: string): ConfigTemplate {
    const template = JSON.parse(json) as ConfigTemplate;
    const key = `${template.industryId}:${template.useCaseId}`;
    this.templates.set(key, template);
    return template;
  }

  // Private helper methods

  private generateTemplateFromWorkflow(workflow: UseCaseWorkflow, industryId: string): ConfigTemplate {
    const template: ConfigTemplate = {
      id: uuidv4(),
      name: `${workflow.name} Configuration`,
      description: workflow.description,
      industryId,
      useCaseId: workflow.useCaseId,
      version: '1.0.0',
      variables: this.extractVariablesFromWorkflow(workflow),
      sections: this.generateSections(workflow),
      defaults: this.extractDefaults(workflow),
      validation: {
        rules: this.generateValidationRules(workflow)
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: workflow.metadata.tags,
        complexity: workflow.metadata.criticality as any
      }
    };

    return template;
  }

  private extractVariablesFromWorkflow(workflow: UseCaseWorkflow): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Extract variables from workflow steps
    for (const step of workflow.steps) {
      const stepVars = this.extractStepVariables(step);
      variables.push(...stepVars);
    }

    // Add common workflow variables
    variables.push(
      {
        name: 'executionTimeout',
        type: 'number',
        label: 'Execution Timeout (seconds)',
        description: 'Maximum time allowed for workflow execution',
        required: false,
        default: 3600,
        validation: { min: 60, max: 86400 }
      },
      {
        name: 'retryAttempts',
        type: 'number',
        label: 'Retry Attempts',
        description: 'Number of retry attempts on failure',
        required: false,
        default: 3,
        validation: { min: 0, max: 10 }
      },
      {
        name: 'notificationChannels',
        type: 'array',
        label: 'Notification Channels',
        description: 'Channels to send notifications',
        required: false,
        default: ['email']
      }
    );

    // Remove duplicates
    const uniqueVars = new Map<string, TemplateVariable>();
    variables.forEach(v => uniqueVars.set(v.name, v));

    return Array.from(uniqueVars.values());
  }

  private extractStepVariables(step: any): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Extract from step parameters
    if (step.parameters) {
      Object.entries(step.parameters).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
          const varName = value.slice(2, -1);
          variables.push({
            name: varName,
            type: this.inferType(varName),
            label: this.humanizeVariableName(varName),
            required: true,
            default: null
          });
        }
      });
    }

    return variables;
  }

  private generateSections(workflow: UseCaseWorkflow): TemplateSection[] {
    const sections: TemplateSection[] = [
      {
        id: 'general',
        name: 'General Configuration',
        order: 1,
        variables: ['executionTimeout', 'retryAttempts', 'notificationChannels']
      }
    ];

    // Group variables by step type
    const stepTypes = new Set(workflow.steps.map(s => s.type));
    let order = 2;

    stepTypes.forEach(type => {
      sections.push({
        id: type,
        name: `${this.humanizeVariableName(type)} Settings`,
        order: order++,
        variables: [] // Would be populated with step-specific variables
      });
    });

    return sections;
  }

  private extractDefaults(workflow: UseCaseWorkflow): Record<string, any> {
    const defaults: Record<string, any> = {
      executionTimeout: workflow.metadata.estimatedDuration || 3600000,
      retryAttempts: 3,
      notificationChannels: ['email']
    };

    // Extract defaults from workflow steps
    workflow.steps.forEach(step => {
      if (step.parameters) {
        Object.entries(step.parameters).forEach(([key, value]) => {
          if (typeof value !== 'string' || !value.startsWith('${')) {
            defaults[`${step.id}_${key}`] = value;
          }
        });
      }
    });

    return defaults;
  }

  private generateValidationRules(workflow: UseCaseWorkflow): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // Add rules based on workflow metadata
    if (workflow.metadata.criticality === 'critical') {
      rules.push({
        field: 'executionTimeout',
        rule: 'min:300',
        message: 'Critical workflows require at least 5 minutes timeout',
        severity: 'error'
      });
    }

    return rules;
  }

  private castValue(value: any, type: TemplateVariable['type']): any {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  private validateType(value: any, type: TemplateVariable['type']): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  private validateVariable(value: any, variable: TemplateVariable): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = variable.validation;

    if (!validation) return errors;

    // Number validations
    if (variable.type === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push({
          field: variable.name,
          message: `${variable.label} must be at least ${validation.min}`,
          severity: 'error'
        });
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push({
          field: variable.name,
          message: `${variable.label} must be at most ${validation.max}`,
          severity: 'error'
        });
      }
    }

    // String validations
    if (variable.type === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        errors.push({
          field: variable.name,
          message: `${variable.label} must be at least ${validation.minLength} characters`,
          severity: 'error'
        });
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        errors.push({
          field: variable.name,
          message: `${variable.label} must be at most ${validation.maxLength} characters`,
          severity: 'error'
        });
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: variable.name,
            message: `${variable.label} format is invalid`,
            severity: 'error'
          });
        }
      }
    }

    // Custom validation
    if (validation.custom) {
      const validator = this.validators.get(validation.custom);
      if (validator && !validator(value)) {
        errors.push({
          field: variable.name,
          message: `${variable.label} validation failed`,
          severity: 'error'
        });
      }
    }

    return errors;
  }

  private applyVariation(baseConfig: Configuration, variation: VariationRule): ConfigVariant {
    const overrides: Record<string, any> = {};

    // Apply variation rules
    for (const [field, rule] of Object.entries(variation.changes)) {
      const baseValue = baseConfig.values[field];
      overrides[field] = this.applyVariationRule(baseValue, rule);
    }

    return {
      id: uuidv4(),
      baseConfigId: baseConfig.templateId,
      name: variation.name,
      description: variation.description,
      overrides,
      metadata: {
        createdAt: new Date(),
        purpose: variation.purpose
      }
    };
  }

  private applyVariationRule(baseValue: any, rule: any): any {
    if (typeof rule === 'object' && rule.operation) {
      switch (rule.operation) {
        case 'multiply':
          return baseValue * rule.factor;
        case 'add':
          return baseValue + rule.value;
        case 'replace':
          return rule.value;
        default:
          return baseValue;
      }
    }
    return rule;
  }

  private inferType(varName: string): TemplateVariable['type'] {
    const lowerName = varName.toLowerCase();
    
    if (lowerName.includes('count') || lowerName.includes('number') || 
        lowerName.includes('timeout') || lowerName.includes('limit')) {
      return 'number';
    }
    if (lowerName.includes('enable') || lowerName.includes('is') || 
        lowerName.includes('has') || lowerName.includes('should')) {
      return 'boolean';
    }
    if (lowerName.includes('date') || lowerName.includes('time')) {
      return 'date';
    }
    if (lowerName.includes('list') || lowerName.includes('array') || 
        lowerName.includes('items')) {
      return 'array';
    }
    
    return 'string';
  }

  private humanizeVariableName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  private initializeBuiltInValidators(): void {
    // Email validator
    this.validators.set('email', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // URL validator
    this.validators.set('url', (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Date range validator
    this.validators.set('dateRange', (startDate: Date, endDate: Date) => {
      return startDate < endDate;
    });

    // Sum validator
    this.validators.set('sum', (values: number[], total: number) => {
      const sum = values.reduce((a, b) => a + b, 0);
      return Math.abs(sum - total) < 0.01;
    });
  }

  private loadDefaultTemplates(): void {
    // Load some default templates
    const energyTemplate: ConfigTemplate = {
      id: 'energy-default',
      name: 'Energy Use Case Configuration',
      description: 'Default configuration template for energy use cases',
      industryId: 'energy',
      useCaseId: 'grid-anomaly',
      version: '1.0.0',
      variables: [
        {
          name: 'anomalyThreshold',
          type: 'number',
          label: 'Anomaly Detection Threshold',
          description: 'Threshold for detecting grid anomalies (0-1)',
          required: true,
          default: 0.85,
          validation: { min: 0, max: 1 }
        },
        {
          name: 'alertingEnabled',
          type: 'boolean',
          label: 'Enable Real-time Alerting',
          required: false,
          default: true
        },
        {
          name: 'alertChannels',
          type: 'array',
          label: 'Alert Channels',
          required: false,
          default: ['email', 'sms'],
          visibility: {
            field: 'alertingEnabled',
            operator: '=',
            value: true
          }
        }
      ],
      sections: [
        {
          id: 'detection',
          name: 'Detection Settings',
          order: 1,
          variables: ['anomalyThreshold']
        },
        {
          id: 'alerting',
          name: 'Alerting Configuration',
          order: 2,
          variables: ['alertingEnabled', 'alertChannels']
        }
      ],
      defaults: {
        anomalyThreshold: 0.85,
        alertingEnabled: true,
        alertChannels: ['email', 'sms']
      },
      validation: {
        rules: []
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['energy', 'grid', 'anomaly'],
        complexity: 'medium'
      }
    };

    this.templates.set('energy:grid-anomaly', energyTemplate);
  }
}

// Supporting interfaces
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface VariationRule {
  name: string;
  description?: string;
  purpose?: string;
  changes: Record<string, any>;
}

// Export singleton instance
export const configTemplateEngine = ConfigTemplateEngine.getInstance();