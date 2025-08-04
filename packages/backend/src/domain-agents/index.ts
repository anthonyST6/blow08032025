/**
 * Domain Agents Index
 * 
 * This module exports all domain-specific agents that analyze documents
 * based on vertical industry requirements and regulations.
 */

export * from './base.domain-agent';
export * from './energy.agent';
export * from './government.agent';
export * from './insurance.agent';

// Re-export singleton instances for easy access
export { energyDomainAgent } from './energy.agent';
export { governmentDomainAgent } from './government.agent';
export { insuranceDomainAgent } from './insurance.agent';

// Domain agent registry for managing all domain agents
import { logger } from '../utils/logger';
import { BaseDomainAgent } from './base.domain-agent';
import { energyDomainAgent } from './energy.agent';
import { governmentDomainAgent } from './government.agent';
import { insuranceDomainAgent } from './insurance.agent';

export class DomainAgentRegistry {
  private agents: Map<string, BaseDomainAgent<any, any>> = new Map();

  constructor() {
    // Register default domain agents
    this.register(energyDomainAgent);
    this.register(governmentDomainAgent);
    this.register(insuranceDomainAgent);
  }

  /**
   * Register a domain agent
   */
  register(agent: BaseDomainAgent<any, any>): void {
    const config = agent.getConfig();
    if (this.agents.has(config.id)) {
      logger.warn(`Domain agent ${config.id} is already registered, overwriting`);
    }
    this.agents.set(config.id, agent);
    logger.info(`Registered domain agent: ${config.name} (${config.id})`);
  }

  /**
   * Get a domain agent by ID
   */
  get(agentId: string): BaseDomainAgent<any, any> | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get domain agent by vertical
   */
  getByVertical(vertical: string): BaseDomainAgent<any, any> | undefined {
    const verticalMapping: Record<string, string> = {
      'energy': 'energy-domain-agent',
      'oil-gas': 'energy-domain-agent',
      'government': 'government-domain-agent',
      'federal': 'government-domain-agent',
      'insurance': 'insurance-domain-agent',
      'healthcare': 'healthcare-domain-agent', // Future
      'finance': 'finance-domain-agent', // Future
    };

    const agentId = verticalMapping[vertical.toLowerCase()];
    return agentId ? this.get(agentId) : undefined;
  }

  /**
   * Get all registered domain agents
   */
  getAll(): BaseDomainAgent<any, any>[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all agent configurations
   */
  getAllConfigs(): Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  }> {
    return this.getAll().map(agent => {
      const config = agent.getConfig();
      return {
        id: config.id,
        name: config.name,
        description: config.description,
        capabilities: config.capabilities,
      };
    });
  }

  /**
   * Check if an agent has a specific capability
   */
  findByCapability(capability: string): BaseDomainAgent<any, any>[] {
    return this.getAll().filter(agent => agent.hasCapability(capability));
  }
}

// Export singleton registry instance
export const domainAgentRegistry = new DomainAgentRegistry();

// Utility function to get domain agent for a vertical
export function getDomainAgent(vertical: string): BaseDomainAgent<any, any> | undefined {
  return domainAgentRegistry.getByVertical(vertical);
}

// Utility function to process with appropriate domain agent
export async function processWithDomainAgent(
  vertical: string,
  input: any
): Promise<any> {
  const agent = getDomainAgent(vertical);
  if (!agent) {
    throw new Error(`No domain agent found for vertical: ${vertical}`);
  }
  return agent.process(input);
}