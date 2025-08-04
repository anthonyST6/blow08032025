/**
 * Orchestration Module Index
 * 
 * This module exports all orchestration components that manage
 * the flow of prompts through the Seraphim Vanguards system.
 */

// Core orchestration components
export * from './prompt-router';
export * from './use-case-binder';
export * from './report-builder';
export * from './agent-orchestrator';

// Re-export singleton instances
export { promptRouter } from './prompt-router';
export { useCaseBinder } from './use-case-binder';
export { reportBuilder } from './report-builder';
export { agentOrchestrator, orchestratePrompt } from './agent-orchestrator';

// Orchestration utilities
export function getOrchestrationStatus(): {
  components: string[];
  ready: boolean;
  version: string;
} {
  return {
    components: [
      'prompt-router',
      'use-case-binder',
      'report-builder',
      'agent-orchestrator',
    ],
    ready: true,
    version: '2.0.0',
  };
}

// Quick start function for orchestration
import { orchestratePrompt as orchestratePromptFunc } from './agent-orchestrator';

export async function quickOrchestrate(
  prompt: string,
  userId: string,
  options?: {
    generateReport?: boolean;
    reportFormat?: 'json' | 'pdf' | 'html' | 'markdown';
  }
): Promise<any> {
  return orchestratePromptFunc(prompt, userId, {
    generateReport: options?.generateReport ?? true,
    reportFormat: options?.reportFormat ?? 'pdf',
  });
}