/**
 * Seraphim Vanguards - Core Agent Exports
 * 
 * The Vanguard architecture consists of three sequential agents:
 * 1. Security Sentinel (Blue) - First line of defense
 * 2. Integrity Auditor (Red) - Cross-reference and validation
 * 3. Accuracy Engine (Green) - Precision and correctness
 * 
 * Orchestrated by the VanguardOrchestrator for sequential processing
 */

// Export individual Vanguard agents
export {
  SecuritySentinel,
  securitySentinel,
  type SecuritySentinelInput,
  type SecuritySentinelOutput,
  type SecurityCheckResult
} from './security-sentinel';

export {
  IntegrityAuditor,
  integrityAuditor,
  type IntegrityAuditorInput,
  type IntegrityAuditorOutput,
  type IntegrityCheckResult
} from './integrity-auditor';

export {
  AccuracyEngine,
  accuracyEngine,
  type AccuracyEngineInput,
  type AccuracyEngineOutput,
  type AccuracyCheckResult
} from './accuracy-engine';

export {
  OptimizationVanguard,
  optimizationVanguard,
  type OptimizationInput,
  type OptimizationOutput
} from './optimization-vanguard';

export {
  NegotiationVanguard,
  negotiationVanguard,
  type NegotiationInput,
  type NegotiationOutput
} from './negotiation-vanguard';

// Export orchestrator
export {
  VanguardOrchestrator,
  vanguardOrchestrator,
  type VanguardContext,
  type VanguardSession,
  type VanguardReport,
  type OrchestratorConfig
} from './orchestrator';

// Re-export base agent types for convenience
export type { 
  AgentResult, 
  AgentFlag, 
  LLMOutput 
} from '../agents/base.agent';

/**
 * Quick start function to execute the full Vanguard pipeline
 */
export async function executeVanguardPipeline(
  input: import('../agents/base.agent').LLMOutput,
  context: import('./orchestrator').VanguardContext,
  options?: {
    documentMetadata?: any;
    externalDataSources?: any[];
    referenceData?: any;
  }
): Promise<import('./orchestrator').VanguardReport> {
  const { vanguardOrchestrator } = await import('./orchestrator');
  
  return vanguardOrchestrator.executeWorkflow(
    input,
    context,
    options?.documentMetadata,
    options?.externalDataSources,
    options?.referenceData
  );
}

/**
 * Vanguard status colors for UI representation
 */
export const VANGUARD_COLORS = {
  security: '#3A88F5', // Blue
  integrity: '#DC3E40', // Red
  accuracy: '#3BD16F', // Green
} as const;

/**
 * Vanguard status thresholds
 */
export const VANGUARD_THRESHOLDS = {
  critical: 90,
  high: 75,
  medium: 50,
  low: 25,
} as const;

/**
 * Get Vanguard status based on score
 */
export function getVanguardStatus(score: number): 'critical' | 'high' | 'medium' | 'low' | 'pass' {
  if (score >= VANGUARD_THRESHOLDS.critical) return 'pass';
  if (score >= VANGUARD_THRESHOLDS.high) return 'low';
  if (score >= VANGUARD_THRESHOLDS.medium) return 'medium';
  if (score >= VANGUARD_THRESHOLDS.low) return 'high';
  return 'critical';
}

/**
 * Format Vanguard score for display
 */
export function formatVanguardScore(score: number): string {
  return `${Math.round(score)}/100`;
}

/**
 * Get Vanguard icon based on type
 */
export function getVanguardIcon(type: 'security' | 'integrity' | 'accuracy'): string {
  const icons = {
    security: '🛡️',
    integrity: '⚖️',
    accuracy: '✓',
  };
  return icons[type];
}