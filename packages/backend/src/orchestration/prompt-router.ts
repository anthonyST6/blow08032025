import { logger } from '../utils/logger';
import { LLMOutput } from '../agents/base.agent';

export interface PromptRoute {
  id: string;
  vertical: string;
  useCase: string;
  confidence: number;
  suggestedAgents: string[];
  metadata: Record<string, any>;
}

export interface PromptAnalysis {
  detectedVertical: string | null;
  detectedUseCase: string | null;
  keywords: string[];
  entities: Array<{ type: string; value: string }>;
  intent: string;
  confidence: number;
}

export interface RouterConfig {
  verticalKeywords: Record<string, string[]>;
  useCasePatterns: Record<string, RegExp[]>;
  minConfidenceThreshold: number;
}

export class PromptRouter {
  private config: RouterConfig;

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      verticalKeywords: {
        energy: ['oil', 'gas', 'lease', 'mineral rights', 'drilling', 'extraction', 'pipeline', 'refinery', 'petroleum', 'energy'],
        government: ['contract', 'procurement', 'federal', 'state', 'municipal', 'regulation', 'compliance', 'bid', 'RFP', 'government'],
        insurance: ['policy', 'claim', 'premium', 'coverage', 'deductible', 'underwriting', 'risk', 'actuarial', 'insurance', 'liability'],
        healthcare: ['patient', 'medical', 'diagnosis', 'treatment', 'HIPAA', 'clinical', 'pharmaceutical', 'hospital', 'healthcare', 'medicine'],
        finance: ['investment', 'portfolio', 'trading', 'banking', 'loan', 'credit', 'financial', 'securities', 'audit', 'SOX'],
      },
      useCasePatterns: {
        'energy-oil-gas-lease': [
          /oil.*gas.*lease/i,
          /mineral\s+rights/i,
          /drilling\s+contract/i,
          /lease\s+agreement.*energy/i,
        ],
        'government-led': [
          /LED\s+contract/i,
          /lighting\s+procurement/i,
          /municipal.*LED/i,
          /government.*lighting/i,
        ],
        'insurance-continental': [
          /continental.*insurance/i,
          /commercial\s+property.*insurance/i,
          /liability\s+coverage/i,
          /insurance.*claim.*review/i,
        ],
        'healthcare-compliance': [
          /HIPAA.*compliance/i,
          /medical.*records/i,
          /patient.*privacy/i,
          /healthcare.*regulation/i,
        ],
        'finance-regulatory': [
          /financial.*compliance/i,
          /SOX.*audit/i,
          /regulatory.*filing/i,
          /financial.*reporting/i,
        ],
      },
      minConfidenceThreshold: 0.6,
      ...config,
    };
  }

  /**
   * Route a prompt to the appropriate vertical and use case
   */
  async route(prompt: string, context?: { vertical?: string; useCase?: string }): Promise<PromptRoute> {
    const startTime = Date.now();
    logger.info('Routing prompt', { 
      promptLength: prompt.length,
      hasContext: !!context,
      contextVertical: context?.vertical,
      contextUseCase: context?.useCase,
    });

    try {
      // Analyze the prompt
      const analysis = await this.analyzePrompt(prompt);

      // Determine vertical and use case
      let vertical = context?.vertical || analysis.detectedVertical;
      let useCase = context?.useCase || analysis.detectedUseCase;

      // If no vertical detected, try to infer from use case
      if (!vertical && useCase) {
        vertical = this.inferVerticalFromUseCase(useCase);
      }

      // If still no vertical, use default
      if (!vertical) {
        vertical = 'general';
        logger.warn('No vertical detected, using general');
      }

      // Determine suggested agents based on vertical and use case
      const suggestedAgents = this.determineSuggestedAgents(vertical, useCase);

      // Create route
      const route: PromptRoute = {
        id: this.generateRouteId(),
        vertical,
        useCase: useCase || 'general',
        confidence: analysis.confidence,
        suggestedAgents,
        metadata: {
          analysis,
          processingTime: Date.now() - startTime,
          contextProvided: !!context,
        },
      };

      logger.info('Prompt routed successfully', {
        routeId: route.id,
        vertical: route.vertical,
        useCase: route.useCase,
        confidence: route.confidence,
        suggestedAgents: route.suggestedAgents,
      });

      return route;
    } catch (error) {
      logger.error('Failed to route prompt', { error });
      throw error;
    }
  }

  /**
   * Analyze prompt to extract vertical, use case, and other metadata
   */
  private async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
    const lowerPrompt = prompt.toLowerCase();
    const analysis: PromptAnalysis = {
      detectedVertical: null,
      detectedUseCase: null,
      keywords: [],
      entities: [],
      intent: 'unknown',
      confidence: 0,
    };

    // Extract keywords
    analysis.keywords = this.extractKeywords(prompt);

    // Detect vertical
    const verticalScores: Record<string, number> = {};
    for (const [vertical, keywords] of Object.entries(this.config.verticalKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          score += 1;
          // Boost score for exact word matches
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(prompt)) {
            score += 0.5;
          }
        }
      }
      if (score > 0) {
        verticalScores[vertical] = score;
      }
    }

    // Select vertical with highest score
    if (Object.keys(verticalScores).length > 0) {
      const sortedVerticals = Object.entries(verticalScores)
        .sort(([, a], [, b]) => b - a);
      analysis.detectedVertical = sortedVerticals[0][0];
      analysis.confidence = Math.min(sortedVerticals[0][1] / 5, 1); // Normalize confidence
    }

    // Detect use case
    for (const [useCase, patterns] of Object.entries(this.config.useCasePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          analysis.detectedUseCase = useCase;
          analysis.confidence = Math.max(analysis.confidence, 0.8);
          break;
        }
      }
      if (analysis.detectedUseCase) break;
    }

    // Extract entities
    analysis.entities = this.extractEntities(prompt);

    // Determine intent
    analysis.intent = this.determineIntent(prompt, analysis.keywords);

    // Adjust confidence based on analysis completeness
    if (analysis.detectedVertical && analysis.detectedUseCase) {
      analysis.confidence = Math.max(analysis.confidence, 0.7);
    } else if (analysis.detectedVertical || analysis.detectedUseCase) {
      analysis.confidence = Math.max(analysis.confidence, 0.5);
    } else {
      analysis.confidence = Math.min(analysis.confidence, 0.3);
    }

    return analysis;
  }

  /**
   * Extract keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const keywords: string[] = [];
    const words = prompt.toLowerCase().split(/\s+/);
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    ]);

    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        keywords.push(word);
      }
    }

    // Also extract important phrases
    const importantPhrases = [
      'mineral rights',
      'oil and gas',
      'lease agreement',
      'insurance policy',
      'government contract',
      'regulatory compliance',
      'financial audit',
    ];

    for (const phrase of importantPhrases) {
      if (prompt.toLowerCase().includes(phrase)) {
        keywords.push(phrase);
      }
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Extract entities from prompt
   */
  private extractEntities(prompt: string): Array<{ type: string; value: string }> {
    const entities: Array<{ type: string; value: string }> = [];

    // Extract dates
    const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g;
    const dates = prompt.match(datePattern);
    if (dates) {
      dates.forEach(date => entities.push({ type: 'date', value: date }));
    }

    // Extract monetary amounts
    const moneyPattern = /\$[\d,]+(?:\.\d{2})?/g;
    const amounts = prompt.match(moneyPattern);
    if (amounts) {
      amounts.forEach(amount => entities.push({ type: 'money', value: amount }));
    }

    // Extract percentages
    const percentPattern = /\d+(?:\.\d+)?%/g;
    const percentages = prompt.match(percentPattern);
    if (percentages) {
      percentages.forEach(percent => entities.push({ type: 'percentage', value: percent }));
    }

    // Extract organization names (simple heuristic - capitalized words)
    const orgPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|LLC|Corp|Company|Corporation)\b/g;
    const orgs = prompt.match(orgPattern);
    if (orgs) {
      orgs.forEach(org => entities.push({ type: 'organization', value: org }));
    }

    // Extract location references
    const locationPattern = /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/g;
    const locations = prompt.match(locationPattern);
    if (locations) {
      locations.forEach(location => entities.push({ type: 'location', value: location }));
    }

    return entities;
  }

  /**
   * Determine the intent of the prompt
   */
  private determineIntent(prompt: string, keywords: string[]): string {
    const lowerPrompt = prompt.toLowerCase();

    // Check for specific intents
    if (lowerPrompt.includes('review') || lowerPrompt.includes('analyze') || lowerPrompt.includes('evaluate')) {
      return 'review';
    }
    if (lowerPrompt.includes('validate') || lowerPrompt.includes('verify') || lowerPrompt.includes('check')) {
      return 'validation';
    }
    if (lowerPrompt.includes('comply') || lowerPrompt.includes('compliance') || lowerPrompt.includes('regulation')) {
      return 'compliance';
    }
    if (lowerPrompt.includes('calculate') || lowerPrompt.includes('compute') || lowerPrompt.includes('determine')) {
      return 'calculation';
    }
    if (lowerPrompt.includes('compare') || lowerPrompt.includes('contrast') || lowerPrompt.includes('versus')) {
      return 'comparison';
    }
    if (lowerPrompt.includes('risk') || lowerPrompt.includes('threat') || lowerPrompt.includes('vulnerability')) {
      return 'risk-assessment';
    }

    // Check keywords for intent clues
    if (keywords.includes('audit')) return 'audit';
    if (keywords.includes('report')) return 'reporting';
    if (keywords.includes('contract')) return 'contract-review';

    return 'general-analysis';
  }

  /**
   * Infer vertical from use case
   */
  private inferVerticalFromUseCase(useCase: string): string | null {
    const useCaseVerticalMap: Record<string, string> = {
      'energy-oil-gas-lease': 'energy',
      'government-led': 'government',
      'insurance-continental': 'insurance',
      'healthcare-compliance': 'healthcare',
      'finance-regulatory': 'finance',
    };

    return useCaseVerticalMap[useCase] || null;
  }

  /**
   * Determine suggested agents based on vertical and use case
   */
  private determineSuggestedAgents(vertical: string, useCase: string | null): string[] {
    const agents: string[] = [];

    // Always include the core Vanguard agents
    agents.push('security-sentinel', 'integrity-auditor', 'accuracy-engine');

    // Add vertical-specific domain agent
    switch (vertical) {
      case 'energy':
        agents.push('energy-domain-agent');
        break;
      case 'government':
        agents.push('government-domain-agent');
        break;
      case 'insurance':
        agents.push('insurance-domain-agent');
        break;
      case 'healthcare':
        agents.push('healthcare-domain-agent');
        break;
      case 'finance':
        agents.push('finance-domain-agent');
        break;
      default:
        agents.push('general-domain-agent');
    }

    // Add use-case specific agents if applicable
    if (useCase) {
      switch (useCase) {
        case 'energy-oil-gas-lease':
          agents.push('lease-validator', 'mineral-rights-analyzer');
          break;
        case 'government-led':
          agents.push('procurement-validator', 'contract-analyzer');
          break;
        case 'insurance-continental':
          agents.push('policy-analyzer', 'risk-assessor');
          break;
        case 'healthcare-compliance':
          agents.push('hipaa-validator', 'medical-records-analyzer');
          break;
        case 'finance-regulatory':
          agents.push('sox-validator', 'financial-auditor');
          break;
      }
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  /**
   * Generate unique route ID
   */
  private generateRouteId(): string {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update router configuration
   */
  updateConfig(config: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Router configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): RouterConfig {
    return { ...this.config };
  }

  /**
   * Add vertical keywords
   */
  addVerticalKeywords(vertical: string, keywords: string[]): void {
    if (!this.config.verticalKeywords[vertical]) {
      this.config.verticalKeywords[vertical] = [];
    }
    this.config.verticalKeywords[vertical].push(...keywords);
    // Remove duplicates
    this.config.verticalKeywords[vertical] = [...new Set(this.config.verticalKeywords[vertical])];
    logger.info(`Added ${keywords.length} keywords to ${vertical} vertical`);
  }

  /**
   * Add use case pattern
   */
  addUseCasePattern(useCase: string, pattern: RegExp): void {
    if (!this.config.useCasePatterns[useCase]) {
      this.config.useCasePatterns[useCase] = [];
    }
    this.config.useCasePatterns[useCase].push(pattern);
    logger.info(`Added pattern to ${useCase} use case`);
  }
}

// Export singleton instance
export const promptRouter = new PromptRouter();