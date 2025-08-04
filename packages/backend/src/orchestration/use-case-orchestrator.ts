import { UseCaseModel, UseCaseExecutionModel, VerticalModel } from '../models';
import { agentRegistry } from '../agents/base.agent';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { auditTrailService, UseCaseAuditParticulars } from '../services/audit-trail.service';
import { vanguardActionsService, VanguardAction } from '../services/vanguard-actions.service';
import { extractCustomParticulars } from '../config/use-case-audit-config';

export interface OrchestrationStep {
  agentId: string;
  order: number;
  required: boolean;
  config: Record<string, any>;
  timeout?: number;
}

export interface OrchestrationResult {
  executionId: string;
  useCaseId: string;
  status: 'completed' | 'failed' | 'partial';
  results: Record<string, any>;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  duration: number;
  errors?: Array<{
    agentId: string;
    error: string;
    timestamp: Date;
  }>;
}

export class UseCaseOrchestrator extends EventEmitter {
  private activeExecutions: Map<string, AbortController> = new Map();

  /**
   * Execute a use case with its configured agents
   */
  async executeUseCase(
    executionId: string,
    useCaseId: string,
    promptData: any,
    configuration: Record<string, any>
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const abortController = new AbortController();
    this.activeExecutions.set(executionId, abortController);

    let useCase: any;
    let vertical: any;

    try {
      // Update execution status to running
      await UseCaseExecutionModel.updateStatus(executionId, 'running');
      this.emit('execution:started', { executionId, useCaseId });

      // Get use case details
      useCase = await UseCaseModel.findById(useCaseId);
      if (!useCase) {
        throw new Error('Use case not found');
      }

      // Get vertical-specific agents
      vertical = await VerticalModel.findById(useCase.verticalId);
      if (!vertical) {
        throw new Error('Vertical not found');
      }

      // Generate vanguard actions for this use case
      vanguardActionsService.generateUseCaseActions(useCaseId);

      // Log use case execution start
      await auditTrailService.logUseCaseExecution(
        promptData.userId || 'system',
        promptData.userEmail || 'system@seraphim.ai',
        useCaseId,
        useCase.name,
        executionId,
        useCase.verticalId,
        'started',
        {
          useCaseId,
          useCaseName: useCase.name,
          executionId,
          verticalId: useCase.verticalId,
          customFields: {
            complexity: useCase.complexity,
            estimatedTime: useCase.estimatedTime,
            configuration,
            ...extractCustomParticulars(useCaseId, { promptData, configuration })
          }
        }
      );

      // Determine agents to execute based on use case configuration
      const orchestrationSteps = this.determineOrchestrationSteps(
        useCase,
        vertical,
        configuration
      );

      // Execute agents in order
      const results: Record<string, any> = {};
      const errors: any[] = [];
      let allSuccessful = true;
      const executedActions: VanguardAction[] = [];

      for (const step of orchestrationSteps) {
        if (abortController.signal.aborted) {
          throw new Error('Execution cancelled');
        }

        try {
          const stepResult = await this.executeAgent(
            step,
            promptData,
            configuration,
            abortController.signal
          );
          
          results[step.agentId] = stepResult;
          
          // Log vanguard action for this agent
          const agentAction: VanguardAction = {
            id: `${executionId}-${step.agentId}`,
            agent: step.agentId,
            systemTargeted: 'Use Case Orchestrator',
            actionType: 'Update',
            recordAffected: `execution-${executionId}`,
            payloadSummary: stepResult,
            responseConfirmation: `Agent ${step.agentId} completed successfully`,
            timestamp: new Date().toISOString(),
            status: 'success'
          };
          executedActions.push(agentAction);
          await vanguardActionsService.logAction(agentAction);
          
          this.emit('step:completed', {
            executionId,
            agentId: step.agentId,
            result: stepResult
          });

          // Log agent execution to audit trail
          await auditTrailService.logUseCaseAction(
            promptData.userId || 'system',
            promptData.userEmail || 'system@seraphim.ai',
            `agent.${step.agentId}.completed`,
            'agent_execution',
            {
              useCaseId,
              useCaseName: useCase.name,
              executionId,
              verticalId: useCase.verticalId,
              agentActions: [agentAction],
              customFields: {
                agentId: step.agentId,
                order: step.order,
                required: step.required,
                result: stepResult,
                ...extractCustomParticulars(useCaseId, {
                  promptData,
                  configuration,
                  results: { [step.agentId]: stepResult }
                })
              }
            }
          );
        } catch (error: any) {
          logger.error('Agent execution failed', {
            executionId,
            agentId: step.agentId,
            error: error.message
          });

          errors.push({
            agentId: step.agentId,
            error: error.message,
            timestamp: new Date()
          });

          // Log failed vanguard action
          const failedAction: VanguardAction = {
            id: `${executionId}-${step.agentId}`,
            agent: step.agentId,
            systemTargeted: 'Use Case Orchestrator',
            actionType: 'Reject',
            recordAffected: `execution-${executionId}`,
            payloadSummary: { error: error.message },
            responseConfirmation: `Agent ${step.agentId} failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            status: 'failed'
          };
          executedActions.push(failedAction);
          await vanguardActionsService.logAction(failedAction);

          // Log agent failure to audit trail
          await auditTrailService.logUseCaseAction(
            promptData.userId || 'system',
            promptData.userEmail || 'system@seraphim.ai',
            `agent.${step.agentId}.failed`,
            'agent_execution',
            {
              useCaseId,
              useCaseName: useCase.name,
              executionId,
              verticalId: useCase.verticalId,
              agentActions: [failedAction],
              customFields: {
                agentId: step.agentId,
                order: step.order,
                required: step.required,
                error: error.message,
                ...extractCustomParticulars(useCaseId, {
                  promptData,
                  configuration,
                  results: { [step.agentId]: { error: error.message } }
                })
              }
            },
            'failure',
            error.message
          );

          if (step.required) {
            allSuccessful = false;
            break;
          }
        }
      }

      // Calculate final SIA scores based on agent results
      const siaScores = this.calculateSIAScores(results, useCase.siaScores);

      // Prepare final result
      const duration = Date.now() - startTime;
      const status = allSuccessful ? 'completed' : 'failed';

      const orchestrationResult: OrchestrationResult = {
        executionId,
        useCaseId,
        status,
        results,
        siaScores,
        duration,
        errors: errors.length > 0 ? errors : undefined
      };

      // Update execution record
      await UseCaseExecutionModel.update(executionId, {
        status,
        completedAt: new Date(),
        duration,
        results: {
          siaScores,
          agentResults: results,
          metrics: this.extractMetrics(results),
          recommendations: this.generateRecommendations(results, siaScores),
          flags: this.extractFlags(results)
        },
        error: errors.length > 0 ? { 
          code: 'PARTIAL_FAILURE', 
          message: 'Some agents failed', 
          details: errors 
        } : undefined
      });

      // Log use case execution completion
      const auditParticulars: UseCaseAuditParticulars = {
        useCaseId,
        useCaseName: useCase.name,
        executionId,
        verticalId: useCase.verticalId,
        agentActions: executedActions,
        siaScores,
        customFields: {
          duration,
          status,
          totalAgents: orchestrationSteps.length,
          successfulAgents: Object.keys(results).length,
          failedAgents: errors.length,
          metrics: this.extractMetrics(results),
          recommendations: this.generateRecommendations(results, siaScores),
          ...extractCustomParticulars(useCaseId, {
            promptData,
            configuration,
            results
          })
        }
      };

      await auditTrailService.logUseCaseExecution(
        promptData.userId || 'system',
        promptData.userEmail || 'system@seraphim.ai',
        useCaseId,
        useCase.name,
        executionId,
        useCase.verticalId,
        status === 'completed' ? 'completed' : 'failed',
        auditParticulars
      );

      this.emit('execution:completed', orchestrationResult);
      return orchestrationResult;

    } catch (error: any) {
      logger.error('Use case execution failed', {
        executionId,
        useCaseId,
        error: error.message
      });

      await UseCaseExecutionModel.updateStatus(executionId, 'failed', {
        code: 'EXECUTION_ERROR',
        message: error.message
      });

      // Log use case execution failure
      if (useCase) {
        await auditTrailService.logUseCaseExecution(
          promptData.userId || 'system',
          promptData.userEmail || 'system@seraphim.ai',
          useCaseId,
          useCase.name,
          executionId,
          useCase.verticalId,
          'failed',
          {
            useCaseId,
            useCaseName: useCase.name,
            executionId,
            verticalId: useCase.verticalId,
            customFields: {
              error: error.message,
              errorCode: 'EXECUTION_ERROR',
              ...extractCustomParticulars(useCaseId, {
                promptData,
                configuration
              })
            }
          }
        );
      }

      this.emit('execution:failed', { executionId, error: error.message });
      throw error;

    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Cancel an active execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      await UseCaseExecutionModel.cancel(executionId);
      this.emit('execution:cancelled', { executionId });
      return true;
    }
    return false;
  }

  /**
   * Determine which agents to execute and in what order
   */
  private determineOrchestrationSteps(
    useCase: any,
    vertical: any,
    configuration: Record<string, any>
  ): OrchestrationStep[] {
    const steps: OrchestrationStep[] = [];

    // Base agents for all use cases
    const baseAgents = ['accuracy-engine', 'integrity-auditor', 'security-sentinel'];
    
    // Add base agents
    baseAgents.forEach((agentId, index) => {
      steps.push({
        agentId,
        order: index,
        required: true,
        config: {
          ...configuration,
          useCaseContext: {
            id: useCase.id,
            name: useCase.name,
            vertical: vertical.id,
            complexity: useCase.complexity
          }
        }
      });
    });

    // Add vertical-specific agents
    if (vertical.aiAgents && vertical.aiAgents.length > 0) {
      vertical.aiAgents.forEach((agentId: string, index: number) => {
        const agent = agentRegistry.get(agentId);
        if (agent && agent.isEnabled()) {
          steps.push({
            agentId,
            order: baseAgents.length + index,
            required: false,
            config: {
              ...configuration,
              verticalSpecific: true
            }
          });
        }
      });
    }

    // Sort by execution order
    return steps.sort((a, b) => a.order - b.order);
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(
    step: OrchestrationStep,
    promptData: any,
    configuration: Record<string, any>,
    signal: AbortSignal
  ): Promise<any> {
    const agent = agentRegistry.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    if (!agent.isEnabled()) {
      throw new Error(`Agent ${step.agentId} is disabled`);
    }

    // Set timeout if specified
    const timeout = step.timeout || 30000; // Default 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Agent execution timeout')), timeout);
    });

    // Execute agent with timeout and cancellation
    const executionPromise = agent.analyze({
      ...promptData,
      configuration: { ...configuration, ...step.config }
    });

    // Race between execution, timeout, and cancellation
    const abortPromise = new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Execution cancelled')));
    });

    return Promise.race([executionPromise, timeoutPromise, abortPromise]);
  }

  /**
   * Calculate final SIA scores based on agent results
   */
  private calculateSIAScores(
    results: Record<string, any>,
    baseSiaScores: { security: number; integrity: number; accuracy: number }
  ): { security: number; integrity: number; accuracy: number } {
    let securityScore = baseSiaScores.security;
    let integrityScore = baseSiaScores.integrity;
    let accuracyScore = baseSiaScores.accuracy;

    // Adjust scores based on agent findings
    Object.values(results).forEach((result: any) => {
      if (result.score !== undefined) {
        // Weight agent scores
        const weight = result.confidence || 0.5;
        
        if (result.type === 'security') {
          securityScore = (securityScore * (1 - weight)) + (result.score * weight);
        } else if (result.type === 'integrity') {
          integrityScore = (integrityScore * (1 - weight)) + (result.score * weight);
        } else if (result.type === 'accuracy') {
          accuracyScore = (accuracyScore * (1 - weight)) + (result.score * weight);
        }
      }

      // Deduct points for critical issues
      if (result.flags) {
        result.flags.forEach((flag: any) => {
          if (flag.severity === 'critical') {
            if (flag.category === 'security') securityScore -= 5;
            if (flag.category === 'integrity') integrityScore -= 5;
            if (flag.category === 'accuracy') accuracyScore -= 5;
          }
        });
      }
    });

    // Ensure scores stay within bounds
    return {
      security: Math.max(0, Math.min(100, Math.round(securityScore))),
      integrity: Math.max(0, Math.min(100, Math.round(integrityScore))),
      accuracy: Math.max(0, Math.min(100, Math.round(accuracyScore)))
    };
  }

  /**
   * Extract metrics from agent results
   */
  private extractMetrics(results: Record<string, any>): Record<string, any> {
    const metrics: Record<string, any> = {
      totalAgentsExecuted: Object.keys(results).length,
      successfulAgents: Object.values(results).filter(r => r.status === 'success').length,
      totalFlags: 0,
      criticalFlags: 0,
      processingTime: {}
    };

    Object.entries(results).forEach(([agentId, result]) => {
      if (result.flags) {
        metrics.totalFlags += result.flags.length;
        metrics.criticalFlags += result.flags.filter((f: any) => f.severity === 'critical').length;
      }
      if (result.processingTime) {
        metrics.processingTime[agentId] = result.processingTime;
      }
    });

    return metrics;
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(
    results: Record<string, any>,
    siaScores: { security: number; integrity: number; accuracy: number }
  ): string[] {
    const recommendations: string[] = [];

    // SIA score-based recommendations
    if (siaScores.security < 80) {
      recommendations.push('Enhance security measures to improve protection against threats');
    }
    if (siaScores.integrity < 80) {
      recommendations.push('Implement additional data validation and integrity checks');
    }
    if (siaScores.accuracy < 80) {
      recommendations.push('Review and optimize AI model accuracy parameters');
    }

    // Agent-specific recommendations
    Object.values(results).forEach((result: any) => {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    });

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Extract all flags from agent results
   */
  private extractFlags(results: Record<string, any>): any[] {
    const allFlags: any[] = [];

    Object.entries(results).forEach(([agentId, result]) => {
      if (result.flags) {
        result.flags.forEach((flag: any) => {
          allFlags.push({
            ...flag,
            agentId,
            timestamp: new Date()
          });
        });
      }
    });

    // Sort by severity
    return allFlags.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity as keyof typeof severityOrder] || 999) - 
             (severityOrder[b.severity as keyof typeof severityOrder] || 999);
    });
  }
}

// Export singleton instance
export const useCaseOrchestrator = new UseCaseOrchestrator();