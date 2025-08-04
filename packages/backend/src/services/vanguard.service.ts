import { agentRegistry, VanguardAgent, AgentResult, LLMOutput } from '../agents/base.agent';
import { logger } from '../utils/logger';
import { wsServer } from '../websocket/server';
import { auditTrailService } from './audit-trail.service';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

interface VanguardExecutionRequest {
  id: string;
  useCaseId: string;
  userId: string;
  userEmail: string;
  agentIds?: string[]; // If not provided, run all enabled agents
  input: LLMOutput;
  priority?: number;
  metadata?: Record<string, any>;
}

interface VanguardExecutionResult {
  executionId: string;
  useCaseId: string;
  results: AgentResult[];
  errors: Array<{ agentId: string; error: string }>;
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  status: 'completed' | 'partial' | 'failed';
}

class VanguardService {
  private executionQueue: Queue<VanguardExecutionRequest>;
  private worker: Worker<VanguardExecutionRequest>;
  private redis: Redis;

  constructor() {
    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    // Initialize BullMQ queue for agent execution
    this.executionQueue = new Queue('vanguard-execution', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Initialize worker to process execution requests
    this.worker = new Worker(
      'vanguard-execution',
      async (job: Job<VanguardExecutionRequest>) => {
        return this.processExecution(job.data);
      },
      {
        connection: this.redis,
        concurrency: parseInt(process.env.VANGUARD_CONCURRENCY || '5'),
      }
    );

    // Set up worker event handlers
    this.setupWorkerHandlers();
    
    // Register all agents on service initialization
    this.registerAgents();
  }

  private registerAgents(): void {
    try {
      // Import and register all agents
      const agents = [
        require('../agents/accuracy.agent').AccuracyAgent,
        require('../agents/accuracy-engine.agent').AccuracyEngineAgent,
        require('../agents/bias.agent').BiasDetectorAgent,
        require('../agents/decisionTree.agent').DecisionTreeAgent,
        require('../agents/energyLease.agent').EnergyLeaseAgent,
        require('../agents/ethicalAlignment.agent').EthicalAlignmentAgent,
        require('../agents/explainability.agent').ExplainabilityAgent,
        require('../agents/integrity-auditor.agent').IntegrityAuditorAgent,
        require('../agents/redFlag.agent').RedFlagAgent,
        require('../agents/security-sentinel.agent').SecuritySentinelAgent,
        require('../agents/sourceVerifier.agent').SourceVerifierAgent,
        require('../agents/volatility.agent').VolatilityAgent,
      ];

      agents.forEach(AgentClass => {
        const agent = new AgentClass();
        agentRegistry.register(agent);
      });

      logger.info(`Registered ${agents.length} Vanguard agents`);
    } catch (error) {
      logger.error('Failed to register agents:', error);
    }
  }

  private setupWorkerHandlers(): void {
    this.worker.on('completed', (job, result) => {
      logger.info(`Vanguard execution completed: ${job.data.id}`, {
        executionId: job.data.id,
        useCaseId: job.data.useCaseId,
        duration: result.totalDuration,
      });
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Vanguard execution failed: ${job?.data.id}`, {
        executionId: job?.data.id,
        error: err.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      // Send progress updates via WebSocket
      if (job.data.useCaseId) {
        // Send to users in the use case room
        if ((wsServer as any).io) {
          (wsServer as any).io.to(`usecase:${job.data.useCaseId}`).emit('usecase:execution:progress', {
            executionId: job.data.id,
            progress,
          });
        }
      }
    });
  }

  async executeAgents(request: VanguardExecutionRequest): Promise<string> {
    try {
      // Add to queue for processing
      const job = await this.executionQueue.add('execute', request, {
        priority: request.priority || 0,
      });

      // Send start notification via WebSocket
      if ((wsServer as any).io) {
        (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('usecase:execution:start', {
          executionId: request.id,
          agentIds: request.agentIds,
          timestamp: new Date(),
        });
      }

      // Log audit trail
      await auditTrailService.logUseCaseAction(
        request.userId,
        request.userEmail,
        'vanguard_execution_started',
        'vanguard_agents',
        {
          useCaseId: request.useCaseId,
          useCaseName: request.useCaseId, // Add required field
          executionId: request.id,
          customFields: {
            agentCount: request.agentIds?.length || 'all',
          }
        },
        'success'
      );

      return job.id || request.id;
    } catch (error) {
      logger.error('Failed to queue Vanguard execution:', error);
      throw error;
    }
  }

  private async processExecution(request: VanguardExecutionRequest): Promise<VanguardExecutionResult> {
    const startTime = new Date();
    const results: AgentResult[] = [];
    const errors: Array<{ agentId: string; error: string }> = [];

    try {
      // Get agents to execute
      const agentsToRun = request.agentIds
        ? request.agentIds.map(id => agentRegistry.get(id)).filter(Boolean) as VanguardAgent[]
        : agentRegistry.getEnabled();

      if (agentsToRun.length === 0) {
        throw new Error('No agents available for execution');
      }

      // Execute agents in parallel with progress tracking
      let completed = 0;
      const totalAgents = agentsToRun.length;

      const executionPromises = agentsToRun.map(async (agent) => {
        try {
          // Send individual agent start notification
          if ((wsServer as any).io) {
            (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('vanguard:status', {
              executionId: request.id,
              agentId: agent.id,
              agentName: agent.name,
              status: 'running',
            });
          }

          const result = await agent.analyze(request.input);
          results.push(result);

          // Send individual agent result
          if ((wsServer as any).io) {
            (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('vanguard:result', {
              executionId: request.id,
              agentId: agent.id,
              agentName: agent.name,
              result,
            });
          }

          // Update progress
          completed++;
          await this.updateProgress(request.id, (completed / totalAgents) * 100);

          // Log successful execution
          await auditTrailService.logUseCaseAction(
            request.userId,
            request.userEmail,
            'vanguard_agent_completed',
            `vanguard_agent_${agent.id}`,
            {
              useCaseId: request.useCaseId,
              useCaseName: request.useCaseId, // Add required field
              executionId: request.id,
              customFields: {
                agentId: agent.id,
                score: result.score,
                flagCount: result.flags.length,
              }
            },
            'success'
          );

          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Unknown error';
          errors.push({ agentId: agent.id, error: errorMessage });

          // Send error notification
          if ((wsServer as any).io) {
            (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('vanguard:status', {
              executionId: request.id,
              agentId: agent.id,
              agentName: agent.name,
              status: 'error',
              error: errorMessage,
            });
          }

          // Log failed execution
          await auditTrailService.logUseCaseAction(
            request.userId,
            request.userEmail,
            'vanguard_agent_failed',
            `vanguard_agent_${agent.id}`,
            {
              useCaseId: request.useCaseId,
              useCaseName: request.useCaseId, // Add required field
              executionId: request.id,
              customFields: {
                agentId: agent.id,
              }
            },
            'failure',
            errorMessage
          );

          logger.error(`Agent ${agent.id} execution failed:`, error);
          return null;
        }
      });

      await Promise.allSettled(executionPromises);

      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();

      // Determine overall status
      let status: VanguardExecutionResult['status'];
      if (results.length === 0) {
        status = 'failed';
      } else if (errors.length > 0) {
        status = 'partial';
      } else {
        status = 'completed';
      }

      const executionResult: VanguardExecutionResult = {
        executionId: request.id,
        useCaseId: request.useCaseId,
        results,
        errors,
        startTime,
        endTime,
        totalDuration,
        status,
      };

      // Send completion notification
      if ((wsServer as any).io) {
        (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('usecase:execution:complete', {
          executionId: request.id,
          result: executionResult,
        });
      }

      // Log overall execution result
      await auditTrailService.logUseCaseAction(
        request.userId,
        request.userEmail,
        'vanguard_execution_completed',
        'vanguard_agents',
        {
          useCaseId: request.useCaseId,
          useCaseName: request.useCaseId, // Add required field
          executionId: request.id,
          customFields: {
            totalAgents: agentsToRun.length,
            successfulAgents: results.length,
            failedAgents: errors.length,
            duration: totalDuration,
            status,
          }
        },
        status === 'failed' ? 'failure' : 'success'
      );

      return executionResult;
    } catch (error: any) {
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();

      // Send error notification
      if ((wsServer as any).io) {
        (wsServer as any).io.to(`usecase:${request.useCaseId}`).emit('usecase:execution:error', {
          executionId: request.id,
          error: error.message,
        });
      }

      // Log execution error
      await auditTrailService.logUseCaseAction(
        request.userId,
        request.userEmail,
        'vanguard_execution_failed',
        'vanguard_agents',
        {
          useCaseId: request.useCaseId,
          useCaseName: request.useCaseId, // Add required field
          executionId: request.id,
        },
        'failure',
        error.message
      );

      throw error;
    }
  }

  private async updateProgress(executionId: string, progress: number): Promise<void> {
    const job = await this.executionQueue.getJob(executionId);
    if (job) {
      await job.updateProgress(progress);
    }
  }

  async getExecutionStatus(executionId: string): Promise<any> {
    const job = await this.executionQueue.getJob(executionId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const job = await this.executionQueue.getJob(executionId);
    if (!job) {
      return false;
    }

    await job.remove();
    return true;
  }

  getRegisteredAgents(): VanguardAgent[] {
    return agentRegistry.getAll();
  }

  getEnabledAgents(): VanguardAgent[] {
    return agentRegistry.getEnabled();
  }

  async shutdown(): Promise<void> {
    await this.worker.close();
    await this.executionQueue.close();
    await this.redis.quit();
  }
}

// Export singleton instance
export const vanguardService = new VanguardService();