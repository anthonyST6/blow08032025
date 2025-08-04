import { logger } from '../utils/logger';

export abstract class BaseService {
  protected serviceName: string;

  constructor() {
    this.serviceName = this.constructor.name;
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details?: any;
  }> {
    try {
      // Basic health check - can be overridden by subclasses
      return {
        status: 'healthy',
        details: {
          service: this.serviceName,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`Health check failed for ${this.serviceName}`, { error });
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Log service activity
   */
  protected logActivity(action: string, details?: any): void {
    logger.info(`[${this.serviceName}] ${action}`, details);
  }

  /**
   * Log service error
   */
  protected logError(action: string, error: any): void {
    logger.error(`[${this.serviceName}] ${action} failed`, { error });
  }
}