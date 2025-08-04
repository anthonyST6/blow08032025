import { UseCaseAuditConfig } from './use-case-audit-config';
import { allWorkflowAuditConfigs, uuidToWorkflowIdMap } from './audit-config-all-workflows';
import { remainingWorkflowAuditConfigs } from './audit-config-remaining-workflows';
import { finalWorkflowAuditConfigs, additionalUuidMappings } from './audit-config-final-workflows';

// Combine all UUID mappings
export const masterUuidMappings: Record<string, string> = {
  ...uuidToWorkflowIdMap,
  ...additionalUuidMappings
};

// Combine all audit configurations
export const masterAuditConfigs: Record<string, UseCaseAuditConfig> = {
  ...allWorkflowAuditConfigs,
  ...remainingWorkflowAuditConfigs,
  ...finalWorkflowAuditConfigs
};

// Master function to get audit config by any ID format
export function getMasterAuditConfig(id: string): UseCaseAuditConfig | undefined {
  // Direct match in master configs
  if (masterAuditConfigs[id]) {
    return masterAuditConfigs[id];
  }
  
  // Check if it's a UUID that maps to a workflow ID
  const workflowId = masterUuidMappings[id];
  if (workflowId && masterAuditConfigs[workflowId]) {
    return {
      ...masterAuditConfigs[workflowId],
      useCaseId: id // Keep the original ID
    };
  }
  
  // Check if it's a readable ID that needs to be mapped to a workflow ID
  const workflowIdWithSuffix = id.endsWith('-workflow') ? id : `${id}-workflow`;
  if (masterAuditConfigs[workflowIdWithSuffix]) {
    return {
      ...masterAuditConfigs[workflowIdWithSuffix],
      useCaseId: id // Keep the original ID
    };
  }
  
  return undefined;
}

// Get all configured use case IDs
export function getAllMasterConfiguredIds(): string[] {
  const allIds = new Set<string>();
  
  // Add all direct config IDs
  Object.keys(masterAuditConfigs).forEach(id => allIds.add(id));
  
  // Add all UUID mappings
  Object.keys(masterUuidMappings).forEach(id => allIds.add(id));
  
  return Array.from(allIds);
}

// Check if a use case has audit configuration
export function hasMasterAuditConfig(id: string): boolean {
  return getMasterAuditConfig(id) !== undefined;
}

// Export a summary of coverage
export function getAuditCoverageSummary(): {
  totalConfigs: number;
  totalUuidMappings: number;
  configuredWorkflows: string[];
  missingWorkflows: string[];
} {
  const configuredWorkflows = Object.keys(masterAuditConfigs);
  const uuidMappings = Object.keys(masterUuidMappings);
  
  return {
    totalConfigs: configuredWorkflows.length,
    totalUuidMappings: uuidMappings.length,
    configuredWorkflows,
    missingWorkflows: [] // To be populated by verification script
  };
}