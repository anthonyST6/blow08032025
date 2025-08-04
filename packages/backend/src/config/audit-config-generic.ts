import { UseCaseAuditConfig } from './use-case-audit-config';

/**
 * Generic audit configuration for use cases without specific configurations
 * This ensures all use cases have at least basic audit trail functionality
 */
export function createGenericAuditConfig(useCaseId: string): UseCaseAuditConfig {
  return {
    useCaseId,
    customParticulars: {
      fields: [
        { name: 'executionId', type: 'string', required: true, description: 'Unique execution identifier' },
        { name: 'startTime', type: 'string', required: true, description: 'Execution start time' },
        { name: 'endTime', type: 'string', required: false, description: 'Execution end time' },
        { name: 'status', type: 'string', required: true, description: 'Execution status' },
        { name: 'itemsProcessed', type: 'number', required: false, description: 'Number of items processed' },
        { name: 'successRate', type: 'number', required: false, description: 'Success rate percentage' },
        { name: 'errors', type: 'array', required: false, description: 'Errors encountered' },
        { name: 'metrics', type: 'object', required: false, description: 'Performance metrics' },
        { name: 'results', type: 'object', required: false, description: 'Execution results' },
        { name: 'recommendations', type: 'array', required: false, description: 'Generated recommendations' }
      ],
      extractors: {
        executionId: (context) => context.executionId || context.id || 'unknown',
        startTime: (context) => context.startTime || new Date().toISOString(),
        endTime: (context) => context.endTime || context.results?.completedAt,
        status: (context) => context.status || context.results?.status || 'completed',
        itemsProcessed: (context) => context.results?.processed?.count || context.results?.totalProcessed || 0,
        successRate: (context) => context.results?.metrics?.successRate || context.results?.accuracy || 100,
        errors: (context) => context.results?.errors || context.errors || [],
        metrics: (context) => context.results?.metrics || context.metrics || {},
        results: (context) => context.results || {},
        recommendations: (context) => context.results?.recommendations || context.recommendations || []
      }
    }
  };
}

/**
 * Get audit configuration for any use case
 * Returns specific config if available, otherwise returns generic config
 */
export function getAuditConfigWithFallback(
  useCaseId: string, 
  specificConfigs: Record<string, UseCaseAuditConfig>
): UseCaseAuditConfig {
  // Check for direct match
  if (specificConfigs[useCaseId]) {
    return specificConfigs[useCaseId];
  }
  
  // Check with -workflow suffix
  const workflowId = useCaseId.endsWith('-workflow') ? useCaseId : `${useCaseId}-workflow`;
  if (specificConfigs[workflowId]) {
    return {
      ...specificConfigs[workflowId],
      useCaseId // Keep the original ID
    };
  }
  
  // Check without -workflow suffix
  const baseId = useCaseId.endsWith('-workflow') ? useCaseId.slice(0, -9) : useCaseId;
  if (specificConfigs[baseId]) {
    return {
      ...specificConfigs[baseId],
      useCaseId // Keep the original ID
    };
  }
  
  // Return generic configuration
  return createGenericAuditConfig(useCaseId);
}