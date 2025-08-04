import { logger } from '../utils/logger';

export interface ServiceRegistration {
  name: string;
  service: any;
  description?: string;
  version?: string;
  capabilities?: string[];
  requiredConfig?: string[];
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceRegistration> = new Map();
  private serviceCapabilities: Map<string, Set<string>> = new Map();

  private constructor() {
    this.initializeDefaultServices();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service
   */
  registerService(name: string, service: any, metadata?: Omit<ServiceRegistration, 'name' | 'service'>): void {
    const registration: ServiceRegistration = {
      name,
      service,
      ...metadata
    };

    this.services.set(name, registration);

    // Index capabilities
    if (metadata?.capabilities) {
      metadata.capabilities.forEach(capability => {
        if (!this.serviceCapabilities.has(capability)) {
          this.serviceCapabilities.set(capability, new Set());
        }
        this.serviceCapabilities.get(capability)!.add(name);
      });
    }

    logger.info(`Service registered: ${name}`, { 
      version: metadata?.version,
      capabilities: metadata?.capabilities 
    });
  }

  /**
   * Get a service by name
   */
  getService(name: string): any {
    const registration = this.services.get(name);
    if (!registration) {
      // Try to fallback to generic orchestration service
      const genericService = this.services.get('generic-orchestration');
      if (genericService) {
        logger.warn(`Service ${name} not found, falling back to generic orchestration`);
        return genericService.service;
      }
      throw new Error(`Service not found: ${name}`);
    }
    return registration.service;
  }

  /**
   * Get service registration details
   */
  getServiceRegistration(name: string): ServiceRegistration | undefined {
    return this.services.get(name);
  }

  /**
   * Get all services with a specific capability
   */
  getServicesByCapability(capability: string): ServiceRegistration[] {
    const serviceNames = this.serviceCapabilities.get(capability) || new Set();
    return Array.from(serviceNames)
      .map(name => this.services.get(name))
      .filter((reg): reg is ServiceRegistration => reg !== undefined);
  }

  /**
   * Check if a service exists
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered services
   */
  getAllServices(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  /**
   * Remove a service
   */
  removeService(name: string): boolean {
    const registration = this.services.get(name);
    if (!registration) return false;

    // Remove from capabilities index
    if (registration.capabilities) {
      registration.capabilities.forEach(capability => {
        const serviceSet = this.serviceCapabilities.get(capability);
        if (serviceSet) {
          serviceSet.delete(name);
          if (serviceSet.size === 0) {
            this.serviceCapabilities.delete(capability);
          }
        }
      });
    }

    this.services.delete(name);
    logger.info(`Service removed: ${name}`);
    return true;
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    totalServices: number;
    servicesByCapability: Record<string, number>;
  } {
    const stats = {
      totalServices: this.services.size,
      servicesByCapability: {} as Record<string, number>
    };

    this.serviceCapabilities.forEach((services, capability) => {
      stats.servicesByCapability[capability] = services.size;
    });

    return stats;
  }

  /**
   * Initialize default services
   */
  private initializeDefaultServices(): void {
    // Import existing services
    const { orchestrationService } = require('../services/orchestration.service');
    const { oilfieldReportsService } = require('../services/oilfield-reports.service');
    const { certificationService } = require('../services/certification.service');
    const { notificationService } = require('../services/notification.service');
    const { vanguardActionsService } = require('../services/vanguard-actions.service');
    const { unifiedReportsService } = require('../services/unified-reports.service');
    const { leaseService } = require('../services/lease.service');
    
    // Import new dedicated services individually to handle failures gracefully
    
    // Grid Anomaly Service
    try {
      const { GridAnomalyService } = require('../services/grid-anomaly.service');
      this.registerService('grid-anomaly', GridAnomalyService.getInstance(), {
        description: 'Grid anomaly detection and response service',
        version: '1.0.0',
        capabilities: ['grid', 'anomaly-detection', 'real-time', 'energy']
      });
    } catch (error) {
      logger.debug('Grid anomaly service not available yet');
    }
    
    // Methane Detection Service
    try {
      const { MethaneDetectionService } = require('../services/methane-detection.service');
      this.registerService('methane-detection', MethaneDetectionService.getInstance(), {
        description: 'Methane leak detection and response service',
        version: '1.0.0',
        capabilities: ['methane', 'detection', 'environmental', 'compliance']
      });
    } catch (error) {
      logger.debug('Methane detection service not available yet', { error });
    }
    
    // Renewable Optimization Service
    try {
      const { RenewableOptimizationService } = require('../services/renewable-optimization.service');
      this.registerService('renewable-optimization', RenewableOptimizationService.getInstance(), {
        description: 'Renewable energy optimization service',
        version: '1.0.0',
        capabilities: ['renewable', 'optimization', 'energy', 'solar', 'wind']
      });
    } catch (error) {
      logger.debug('Renewable optimization service not available yet');
    }
    
    // Drilling Risk Service
    try {
      const { DrillingRiskService } = require('../services/drilling-risk.service');
      this.registerService('drilling-risk', DrillingRiskService.getInstance(), {
        description: 'Drilling risk assessment service',
        version: '1.0.0',
        capabilities: ['drilling', 'risk-assessment', 'safety', 'energy']
      });
    } catch (error) {
      logger.debug('Drilling risk service not available yet');
    }

    // Register core services
    this.registerService('generic-orchestration', orchestrationService, {
      description: 'Generic workflow orchestration service',
      version: '1.0.0',
      capabilities: ['workflow', 'orchestration', 'generic']
    });

    this.registerService('oilfield', oilfieldReportsService, {
      description: 'Oilfield land lease management and reporting service',
      version: '1.0.0',
      capabilities: ['lease-management', 'oilfield', 'energy', 'reporting']
    });

    this.registerService('certification', certificationService, {
      description: 'SIA certification and scoring service',
      version: '1.0.0',
      capabilities: ['certification', 'scoring', 'compliance']
    });

    this.registerService('notification', notificationService, {
      description: 'Multi-channel notification service',
      version: '1.0.0',
      capabilities: ['notification', 'alerting', 'communication']
    });

    this.registerService('vanguard-actions', vanguardActionsService, {
      description: 'Vanguard agent action tracking service',
      version: '1.0.0',
      capabilities: ['action-tracking', 'audit', 'proof-of-action']
    });

    this.registerService('unified-reports', unifiedReportsService, {
      description: 'Unified reporting service',
      version: '1.0.0',
      capabilities: ['reporting', 'analytics', 'export']
    });

    this.registerService('lease', leaseService, {
      description: 'Generic lease management service',
      version: '1.0.0',
      capabilities: ['lease', 'contract', 'management']
    });

    // Register placeholder services for use cases that need dedicated implementations
    this.registerPlaceholderServices();

    logger.info(`Initialized ${this.services.size} default services`);
  }

  /**
   * Register placeholder services for use cases without dedicated implementations
   */
  private registerPlaceholderServices(): void {
    const placeholderUseCases = [
      { name: 'grid-resilience', capabilities: ['grid', 'resilience', 'outage'] },
      { name: 'insurance-risk', capabilities: ['insurance', 'risk-assessment'] },
      { name: 'phmsa-compliance', capabilities: ['phmsa', 'compliance', 'regulatory'] },
      { name: 'patient-risk', capabilities: ['healthcare', 'patient', 'risk'] },
      { name: 'fraud-detection', capabilities: ['finance', 'fraud', 'detection'] },
      { name: 'predictive-maintenance', capabilities: ['manufacturing', 'maintenance', 'predictive'] },
      { name: 'supply-chain', capabilities: ['retail', 'supply-chain', 'optimization'] },
      { name: 'fleet-maintenance', capabilities: ['transportation', 'fleet', 'maintenance'] },
      { name: 'student-performance', capabilities: ['education', 'student', 'analytics'] },
      { name: 'drug-discovery', capabilities: ['pharmaceuticals', 'drug', 'discovery'] },
      { name: 'citizen-services', capabilities: ['government', 'citizen', 'services'] },
      { name: 'network-optimization', capabilities: ['telecommunications', 'network', 'optimization'] }
    ];

    placeholderUseCases.forEach(({ name, capabilities }) => {
      // Only register placeholder if dedicated service wasn't already registered
      if (!this.hasService(name)) {
        // For now, use the generic orchestration service as a placeholder
        // These will be replaced with dedicated implementations
        const { orchestrationService } = require('../services/orchestration.service');
        this.registerService(name, orchestrationService, {
          description: `Placeholder service for ${name} use case`,
          version: '0.1.0',
          capabilities
        });
      }
    });
  }

  /**
   * Create a service proxy that logs all method calls
   */
  createServiceProxy(name: string): any {
    const service = this.getService(name);
    
    return new Proxy(service, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        if (typeof value === 'function') {
          return function(...args: any[]) {
            logger.debug(`Service call: ${name}.${String(prop)}`, { 
              args: args.length 
            });
            
            try {
              const result = value.apply(target, args);
              
              // Handle promises
              if (result && typeof result.then === 'function') {
                return result
                  .then((res: any) => {
                    logger.debug(`Service call completed: ${name}.${String(prop)}`);
                    return res;
                  })
                  .catch((error: any) => {
                    logger.error(`Service call failed: ${name}.${String(prop)}`, { error });
                    throw error;
                  });
              }
              
              logger.debug(`Service call completed: ${name}.${String(prop)}`);
              return result;
            } catch (error) {
              logger.error(`Service call failed: ${name}.${String(prop)}`, { error });
              throw error;
            }
          };
        }
        
        return value;
      }
    });
  }

  /**
   * Validate service health
   */
  async validateServiceHealth(name: string): Promise<{
    healthy: boolean;
    details?: any;
    error?: string;
  }> {
    try {
      const service = this.getService(name);
      
      // Check if service has a health check method
      if (typeof service.healthCheck === 'function') {
        const health = await service.healthCheck();
        return {
          healthy: health.status === 'healthy',
          details: health
        };
      }
      
      // Basic check - service exists and is an object
      return {
        healthy: service !== null && typeof service === 'object',
        details: { status: 'no health check available' }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get service dependency graph
   */
  getServiceDependencies(): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    // Analyze service registrations for dependencies
    this.services.forEach((registration, name) => {
      const deps: string[] = [];
      
      // Check for common service dependencies
      if (name !== 'notification' && registration.capabilities?.includes('notification')) {
        deps.push('notification');
      }
      
      if (name !== 'certification' && registration.capabilities?.includes('certification')) {
        deps.push('certification');
      }
      
      if (name !== 'vanguard-actions' && registration.capabilities?.includes('action-tracking')) {
        deps.push('vanguard-actions');
      }
      
      dependencies.set(name, deps);
    });
    
    return dependencies;
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();