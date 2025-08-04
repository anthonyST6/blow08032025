import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Agent result interfaces
export interface AgentFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  details?: any;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  analysisId: string;
  score: number; // 0-100, where 100 is best
  flags: AgentFlag[];
  metadata: Record<string, any>;
  timestamp: Date;
  confidence: number; // 0-1
  processingTime: number; // milliseconds
}

export interface LLMOutput {
  id: string;
  promptId: string;
  model: string;
  modelVersion: string;
  text: string;
  rawResponse: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  enabled: boolean;
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  customSettings?: Record<string, any>;
}

export interface ThresholdConfig {
  [key: string]: number;
}

// Base Vanguard Agent class
export abstract class VanguardAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly description: string;
  protected config: AgentConfig;

  constructor(
    id: string,
    name: string,
    version: string,
    description: string,
    defaultConfig?: Partial<AgentConfig>
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.description = description;
    this.config = {
      enabled: true,
      thresholds: {
        low: 25,
        medium: 50,
        high: 75,
        critical: 90,
      },
      ...defaultConfig,
    };
  }

  // Abstract method that each agent must implement
  abstract analyze(input: LLMOutput): Promise<AgentResult>;

  // Common methods
  public getConfiguration(): AgentConfig {
    return { ...this.config };
  }

  public updateThresholds(thresholds: ThresholdConfig): void {
    this.config.thresholds = {
      ...this.config.thresholds,
      ...thresholds,
    };
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  // Helper method to create a flag
  protected createFlag(
    severity: AgentFlag['severity'],
    type: string,
    message: string,
    details?: any
  ): AgentFlag {
    return {
      id: uuidv4(),
      severity,
      type,
      message,
      details,
    };
  }

  // Helper method to calculate severity based on score
  protected getSeverityFromScore(score: number): AgentFlag['severity'] {
    const { thresholds } = this.config;
    
    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    if (score >= thresholds.low) return 'low';
    
    return 'low';
  }

  // Helper method to create result
  protected createResult(
    score: number,
    flags: AgentFlag[],
    metadata: Record<string, any>,
    confidence: number,
    startTime: number
  ): AgentResult {
    return {
      agentId: this.id,
      agentName: this.name,
      analysisId: uuidv4(),
      score,
      flags,
      metadata,
      timestamp: new Date(),
      confidence,
      processingTime: Date.now() - startTime,
    };
  }

  // Logging helper
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logData = {
      agentId: this.id,
      agentName: this.name,
      ...data,
    };

    switch (level) {
      case 'info':
        logger.info(`[${this.name}] ${message}`, logData);
        break;
      case 'warn':
        logger.warn(`[${this.name}] ${message}`, logData);
        break;
      case 'error':
        logger.error(`[${this.name}] ${message}`, logData);
        break;
    }
  }

  // Validation helper
  protected validateInput(input: LLMOutput): void {
    if (!input || !input.text) {
      throw new Error('Invalid input: LLM output text is required');
    }
  }
}

// Agent registry to manage all agents
export class AgentRegistry {
  private agents: Map<string, VanguardAgent> = new Map();

  public register(agent: VanguardAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered`);
    }
    this.agents.set(agent.id, agent);
    logger.info(`Registered agent: ${agent.name} (${agent.id})`);
  }

  public get(agentId: string): VanguardAgent | undefined {
    return this.agents.get(agentId);
  }

  public getAll(): VanguardAgent[] {
    return Array.from(this.agents.values());
  }

  public getEnabled(): VanguardAgent[] {
    return this.getAll().filter(agent => agent.isEnabled());
  }

  public async analyzeWithAll(input: LLMOutput): Promise<AgentResult[]> {
    const enabledAgents = this.getEnabled();
    const results = await Promise.allSettled(
      enabledAgents.map(agent => agent.analyze(input))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<AgentResult> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  public async analyzeWithAgent(agentId: string, input: LLMOutput): Promise<AgentResult> {
    const agent = this.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    if (!agent.isEnabled()) {
      throw new Error(`Agent ${agentId} is disabled`);
    }
    return agent.analyze(input);
  }
}

// Global agent registry instance
export const agentRegistry = new AgentRegistry();