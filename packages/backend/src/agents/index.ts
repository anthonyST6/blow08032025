// Export all agents
export * from './base.agent';
export * from './accuracy.agent';
export * from './accuracy-engine.agent';
export * from './bias.agent';
export * from './volatility.agent';
export * from './redFlag.agent';
export * from './explainability.agent';
export * from './sourceVerifier.agent';
export * from './decisionTree.agent';
export * from './ethicalAlignment.agent';
export * from './security-sentinel.agent';
export * from './integrity-auditor.agent';

// Import all agents to ensure they register themselves
import './accuracy.agent';
import './accuracy-engine.agent';
import './bias.agent';
import './volatility.agent';
import './redFlag.agent';
import './explainability.agent';
import './sourceVerifier.agent';
import './decisionTree.agent';
import './ethicalAlignment.agent';
import './security-sentinel.agent';
import './integrity-auditor.agent';

// Re-export the agent registry for convenience
import { agentRegistry } from './base.agent';
export { agentRegistry };

// Export a function to get all registered agents
export function getAllAgents() {
  return agentRegistry.getAll();
}

// Export a function to get agent by ID
export function getAgentById(id: string) {
  return agentRegistry.get(id);
}