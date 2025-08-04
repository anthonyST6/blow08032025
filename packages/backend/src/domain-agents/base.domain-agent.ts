import { logger } from '../utils/logger';

export interface DomainAgentConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
}

export abstract class BaseDomainAgent<TInput, TOutput> {
  protected config: DomainAgentConfig;

  constructor(config: DomainAgentConfig) {
    this.config = config;
    logger.info(`Initialized domain agent: ${config.name} (${config.id})`);
  }

  /**
   * Get agent configuration
   */
  getConfig(): DomainAgentConfig {
    return { ...this.config };
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [...this.config.capabilities];
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(capability: string): boolean {
    return this.config.capabilities.includes(capability);
  }

  /**
   * Abstract method that each domain agent must implement
   */
  abstract process(input: TInput): Promise<TOutput>;

  /**
   * Validate input before processing
   */
  protected validateInput(input: TInput): void {
    if (!input) {
      throw new Error('Input is required');
    }
  }

  /**
   * Log helper method
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logData = {
      agentId: this.config.id,
      agentName: this.config.name,
      ...data,
    };

    switch (level) {
      case 'info':
        logger.info(`[${this.config.name}] ${message}`, logData);
        break;
      case 'warn':
        logger.warn(`[${this.config.name}] ${message}`, logData);
        break;
      case 'error':
        logger.error(`[${this.config.name}] ${message}`, logData);
        break;
    }
  }
}