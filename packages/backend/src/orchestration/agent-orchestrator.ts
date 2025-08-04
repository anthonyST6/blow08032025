import { logger } from '../utils/logger';
import { promptRouter } from './prompt-router';
import { useCaseBinder } from './use-case-binder';
import { domainAgentRegistry } from '../domain-agents';
import { vanguardOrchestrator, VanguardContext, VanguardSession } from '../vanguards/orchestrator';
import { reportBuilder } from './report-builder';
import { LLMOutput } from '../agents/base.agent';

export interface OrchestrationRequest {
  prompt: string;
  userId: string;
  sessionId?: string;
  metadata?: {
    source?: string;
    priority?: 'low' | 'normal' | 'high';
    tags?: string[];
  };
  options?: {
    skipDomainAnalysis?: boolean;
    skipVanguardAnalysis?: boolean;
    generateReport?: boolean;
    reportFormat?: 'json' | 'pdf' | 'html' | 'markdown';
  };
}

export interface OrchestrationResponse {
  sessionId: string;
  status: 'success' | 'partial' | 'failed';
  results: {
    routing?: any;
    binding?: any;
    domainAnalysis?: any;
    vanguardAnalysis?: any;
    report?: any;
  };
  errors: Array<{
    stage: string;
    error: string;
    details?: any;
  }>;
  metadata: {
    startTime: Date;
    endTime: Date;
    processingTime: number;
    stagesCompleted: string[];
  };
}

export interface OrchestrationSession {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'failed';
  request: OrchestrationRequest;
  response?: OrchestrationResponse;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentOrchestrator {
  private sessions: Map<string, OrchestrationSession> = new Map();

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute the full orchestration workflow
   * Flow: Prompt → Router → Binder → Domain Agent → Vanguards → Report
   */
  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const startTime = new Date();
    const sessionId = request.sessionId || this.generateSessionId();
    const errors: Array<{ stage: string; error: string; details?: any }> = [];
    const stagesCompleted: string[] = [];
    const results: any = {};

    // Create session
    const session: OrchestrationSession = {
      id: sessionId,
      userId: request.userId,
      status: 'active',
      request,
      createdAt: startTime,
      updatedAt: startTime,
    };
    this.sessions.set(sessionId, session);

    logger.info('Orchestration started', {
      sessionId,
      userId: request.userId,
      promptLength: request.prompt.length,
    });

    try {
      // Stage 1: Route the prompt
      logger.info('Stage 1: Routing prompt', { sessionId });
      try {
        const routingResult = await promptRouter.route(request.prompt);
        results.routing = routingResult;
        stagesCompleted.push('routing');
        logger.info('Routing completed', {
          sessionId,
          vertical: routingResult.vertical,
          confidence: routingResult.confidence,
        });
      } catch (error) {
        logger.error('Routing failed', { sessionId, error });
        errors.push({
          stage: 'routing',
          error: 'Failed to route prompt',
          details: error,
        });
        throw error; // Critical failure - cannot proceed
      }

      // Stage 2: Bind to use case
      logger.info('Stage 2: Binding to use case', { sessionId });
      try {
        const bindingResult = await useCaseBinder.bind(results.routing);
        results.binding = bindingResult;
        stagesCompleted.push('binding');
        logger.info('Binding completed', {
          sessionId,
          useCaseId: bindingResult.useCaseId,
          vertical: bindingResult.context.vertical,
        });
      } catch (error) {
        logger.error('Binding failed', { sessionId, error });
        errors.push({
          stage: 'binding',
          error: 'Failed to bind to use case',
          details: error,
        });
        throw error; // Critical failure - cannot proceed
      }

      // Stage 3: Domain-specific analysis
      if (!request.options?.skipDomainAnalysis) {
        logger.info('Stage 3: Domain analysis', { sessionId });
        try {
          const domainAgent = domainAgentRegistry.getByVertical(results.routing.vertical);
          if (domainAgent) {
            const domainInput = this.prepareDomainInput(
              request.prompt,
              results.routing,
              results.binding
            );
            const domainResult = await domainAgent.process(domainInput);
            results.domainAnalysis = domainResult;
            stagesCompleted.push('domain-analysis');
            logger.info('Domain analysis completed', {
              sessionId,
              agentId: domainAgent.getId(),
            });
          } else {
            logger.warn('No domain agent found for vertical', {
              sessionId,
              vertical: results.routing.vertical,
            });
          }
        } catch (error) {
          logger.error('Domain analysis failed', { sessionId, error });
          errors.push({
            stage: 'domain-analysis',
            error: 'Domain analysis failed',
            details: error,
          });
          // Non-critical - continue with workflow
        }
      }

      // Stage 4: Vanguard analysis
      if (!request.options?.skipVanguardAnalysis) {
        logger.info('Stage 4: Vanguard analysis', { sessionId });
        try {
          const { llmOutput, context, documentMetadata } = this.prepareVanguardInput(
            request.prompt,
            results.routing,
            results.binding,
            results.domainAnalysis
          );
          
          const vanguardReport = await vanguardOrchestrator.executeWorkflow(
            llmOutput,
            context,
            documentMetadata
          );
          
          // Get the full session data
          const vanguardSession = vanguardOrchestrator.getSession(vanguardReport.sessionId);
          results.vanguardAnalysis = vanguardSession;
          stagesCompleted.push('vanguard-analysis');
          
          logger.info('Vanguard analysis completed', {
            sessionId,
            vanguardSessionId: vanguardReport.sessionId,
            overallScore: vanguardReport.overallScore,
          });
        } catch (error) {
          logger.error('Vanguard analysis failed', { sessionId, error });
          errors.push({
            stage: 'vanguard-analysis',
            error: 'Vanguard analysis failed',
            details: error,
          });
          // Non-critical - continue with workflow
        }
      }

      // Stage 5: Generate report
      if (request.options?.generateReport && results.vanguardAnalysis?.aggregatedReport) {
        logger.info('Stage 5: Generating report', { sessionId });
        try {
          const vanguardSession = results.vanguardAnalysis as VanguardSession;
          const reportResult = await reportBuilder.generateReport(
            vanguardSession,
            results.binding,
            {
              format: request.options.reportFormat || 'pdf',
              includeDetails: true,
            }
          );
          results.report = reportResult;
          stagesCompleted.push('report-generation');
          logger.info('Report generated', {
            sessionId,
            reportId: reportResult.id,
            format: reportResult.format,
          });
        } catch (error) {
          logger.error('Report generation failed', { sessionId, error });
          errors.push({
            stage: 'report-generation',
            error: 'Report generation failed',
            details: error,
          });
          // Non-critical - workflow is complete
        }
      }

      // Determine final status
      const status = errors.length === 0 ? 'success' : 
                    stagesCompleted.length >= 2 ? 'partial' : 'failed';

      // Create response
      const response: OrchestrationResponse = {
        sessionId,
        status,
        results,
        errors,
        metadata: {
          startTime,
          endTime: new Date(),
          processingTime: Date.now() - startTime.getTime(),
          stagesCompleted,
        },
      };

      // Update session
      session.status = status === 'success' ? 'completed' : 'failed';
      session.response = response;
      session.updatedAt = new Date();

      logger.info('Orchestration completed', {
        sessionId,
        status,
        processingTime: response.metadata.processingTime,
        stagesCompleted: stagesCompleted.length,
        errors: errors.length,
      });

      return response;
    } catch (error) {
      logger.error('Orchestration failed', { sessionId, error });
      
      const response: OrchestrationResponse = {
        sessionId,
        status: 'failed',
        results,
        errors: errors.length > 0 ? errors : [{
          stage: 'orchestration',
          error: 'Unexpected orchestration failure',
          details: error,
        }],
        metadata: {
          startTime,
          endTime: new Date(),
          processingTime: Date.now() - startTime.getTime(),
          stagesCompleted,
        },
      };

      session.status = 'failed';
      session.response = response;
      session.updatedAt = new Date();

      return response;
    }
  }

  /**
   * Prepare input for domain agent
   */
  private prepareDomainInput(
    prompt: string,
    routing: any,
    binding: any
  ): any {
    const baseInput = {
      content: prompt,
      documentType: this.inferDocumentType(prompt, binding),
      context: {
        vertical: routing.vertical,
        useCase: binding.context.useCase,
        regulations: binding.context.regulations,
      },
      metadata: {
        routingConfidence: routing.confidence,
        bindingConfidence: routing.confidence,
        entities: routing.entities,
      },
    };

    // Add vertical-specific fields
    switch (routing.vertical) {
      case 'energy':
        return {
          ...baseInput,
          documentType: baseInput.documentType || 'lease',
          context: {
            ...baseInput.context,
            state: routing.entities.find((e: any) => e.type === 'location')?.value,
          },
        };
      
      case 'government':
        return {
          ...baseInput,
          documentType: baseInput.documentType || 'contract',
          metadata: {
            ...baseInput.metadata,
            agency: routing.entities.find((e: any) => e.type === 'organization')?.value,
          },
        };
      
      case 'insurance':
        return {
          ...baseInput,
          documentType: baseInput.documentType || 'policy',
          context: {
            ...baseInput.context,
            lineOfBusiness: this.inferLineOfBusiness(prompt),
          },
        };
      
      default:
        return baseInput;
    }
  }

  /**
   * Prepare input for Vanguard analysis
   */
  private prepareVanguardInput(
    prompt: string,
    routing: any,
    binding: any,
    domainAnalysis?: any
  ): {
    llmOutput: LLMOutput;
    context: VanguardContext;
    documentMetadata?: any;
  } {
    // Create LLM output format
    const llmOutput: LLMOutput = {
      id: this.generateSessionId(),
      promptId: 'prompt-' + Date.now(),
      model: 'seraphim-v2',
      modelVersion: '2.0.0',
      text: prompt,
      rawResponse: { content: prompt },
      timestamp: new Date(),
      metadata: {},
    };

    // Create Vanguard context
    const context: VanguardContext = {
      vertical: routing.vertical,
      useCase: binding.context.useCase,
      regulations: binding.context.regulations,
    };

    // Prepare document metadata
    const documentMetadata: any = {
      routingConfidence: routing.confidence,
      bindingContext: binding.context,
      entities: routing.entities,
    };

    // Enhance with domain analysis results if available
    if (domainAnalysis) {
      documentMetadata.domainRisks = domainAnalysis.analysis?.risks || [];
      documentMetadata.domainRecommendations = domainAnalysis.recommendations || [];
      documentMetadata.domainCompliance = domainAnalysis.analysis?.regulatoryCompliance ||
                                        domainAnalysis.analysis?.complianceStatus || {};
    }

    return { llmOutput, context, documentMetadata };
  }

  /**
   * Infer document type from prompt and binding
   */
  private inferDocumentType(prompt: string, binding: any): string {
    const promptLower = prompt.toLowerCase();
    
    // Check binding context first
    if (binding.context.documentTypes?.length > 0) {
      return binding.context.documentTypes[0];
    }

    // Infer from prompt content
    const documentTypePatterns = {
      'lease': /lease|lessor|lessee|royalty/i,
      'contract': /contract|agreement|terms/i,
      'policy': /policy|insurance|coverage|premium/i,
      'claim': /claim|loss|damage|incident/i,
      'permit': /permit|license|authorization/i,
      'rfp': /rfp|proposal|solicitation|bid/i,
    };

    for (const [type, pattern] of Object.entries(documentTypePatterns)) {
      if (pattern.test(prompt)) {
        return type;
      }
    }

    return 'document'; // Default
  }

  /**
   * Infer line of business for insurance
   */
  private inferLineOfBusiness(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    const lobPatterns = {
      'property': /property|building|fire|flood/i,
      'casualty': /liability|casualty|injury/i,
      'auto': /auto|vehicle|car|truck/i,
      'cyber': /cyber|data breach|ransomware|network/i,
      'professional': /professional|errors|omissions|malpractice/i,
      'health': /health|medical|dental|vision/i,
      'life': /life insurance|death benefit|beneficiary/i,
    };

    for (const [lob, pattern] of Object.entries(lobPatterns)) {
      if (pattern.test(prompt)) {
        return lob;
      }
    }

    return 'casualty'; // Default
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): OrchestrationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): OrchestrationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clean up old sessions
   */
  cleanupSessions(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt.getTime() < cutoffTime) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    logger.info(`Cleaned up ${cleaned} old sessions`);
    return cleaned;
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();

// Export convenience function for orchestration
export async function orchestratePrompt(
  prompt: string,
  userId: string,
  options?: OrchestrationRequest['options']
): Promise<OrchestrationResponse> {
  return agentOrchestrator.orchestrate({
    prompt,
    userId,
    options,
  });
}