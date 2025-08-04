import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface ContractClause {
  id: string;
  type: 'royalty' | 'bonus' | 'term' | 'extension' | 'termination' | 'assignment' | 'audit' | 'force_majeure' | 'indemnification' | 'environmental' | 'custom';
  title: string;
  text: string;
  startPosition: number;
  endPosition: number;
  risk: 'high' | 'medium' | 'low';
  issues?: string[];
  suggestions?: string[];
  metadata?: {
    royaltyRate?: number;
    bonusAmount?: number;
    termLength?: number;
    dates?: Date[];
    parties?: string[];
  };
}

export interface ContractAnalysis {
  documentId: string;
  leaseId?: string;
  fileName: string;
  analysisDate: Date;
  clauses: ContractClause[];
  missingClauses: Array<{
    type: string;
    importance: 'critical' | 'important' | 'recommended';
    description: string;
    suggestedText?: string;
  }>;
  riskAssessment: {
    overallRisk: 'high' | 'medium' | 'low';
    riskFactors: Array<{
      factor: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      mitigation?: string;
    }>;
  };
  keyTerms: {
    effectiveDate?: Date;
    expirationDate?: Date;
    royaltyRate?: number;
    bonusPayment?: number;
    primaryTerm?: number;
    acreage?: number;
    lessor?: string;
    lessee?: string;
  };
  obligations: Array<{
    party: 'lessor' | 'lessee' | 'both';
    obligation: string;
    deadline?: Date;
    frequency?: string;
  }>;
  financialTerms: Array<{
    type: string;
    amount?: number;
    percentage?: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'lease' | 'amendment' | 'assignment' | 'termination';
  clauses: Array<{
    type: string;
    title: string;
    text: string;
    isRequired: boolean;
    variables?: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'select';
      options?: string[];
    }>;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    jurisdiction?: string;
  };
}

export interface ContractComparison {
  documentIds: string[];
  differences: Array<{
    clauseType: string;
    documents: Array<{
      documentId: string;
      value: any;
      text?: string;
    }>;
    significance: 'major' | 'minor';
    recommendation?: string;
  }>;
  commonalities: Array<{
    clauseType: string;
    value: any;
  }>;
  recommendation: string;
}

class ContractService {
  private openAIApiKey: string;
  private openAIEndpoint: string;

  constructor() {
    this.openAIApiKey = process.env.OPENAI_API_KEY || '';
    this.openAIEndpoint = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Analyze a contract document using NLP
   */
  async analyzeContract(
    documentText: string,
    documentMetadata: {
      fileName: string;
      leaseId?: string;
      documentType?: string;
    }
  ): Promise<ContractAnalysis> {
    try {
      logger.info('Starting contract analysis', { fileName: documentMetadata.fileName });

      // Extract clauses
      const clauses = await this.extractClauses(documentText);
      
      // Identify missing clauses
      const missingClauses = this.identifyMissingClauses(clauses);
      
      // Extract key terms
      const keyTerms = await this.extractKeyTerms(documentText, clauses);
      
      // Extract obligations
      const obligations = await this.extractObligations(documentText);
      
      // Extract financial terms
      const financialTerms = await this.extractFinancialTerms(documentText);
      
      // Perform risk assessment
      const riskAssessment = this.assessContractRisk(clauses, missingClauses, keyTerms);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        clauses,
        missingClauses,
        riskAssessment,
        keyTerms
      );

      const analysis: ContractAnalysis = {
        documentId: uuidv4(),
        leaseId: documentMetadata.leaseId,
        fileName: documentMetadata.fileName,
        analysisDate: new Date(),
        clauses,
        missingClauses,
        riskAssessment,
        keyTerms,
        obligations,
        financialTerms,
        recommendations,
      };

      logger.info('Contract analysis completed', {
        documentId: analysis.documentId,
        clauseCount: clauses.length,
        overallRisk: riskAssessment.overallRisk,
      });

      return analysis;
    } catch (error) {
      logger.error('Contract analysis failed', { error, fileName: documentMetadata.fileName });
      throw error;
    }
  }

  /**
   * Extract clauses from contract text
   */
  private async extractClauses(documentText: string): Promise<ContractClause[]> {
    const clauses: ContractClause[] = [];
    
    // Define clause patterns
    const clausePatterns = [
      {
        type: 'royalty' as const,
        pattern: /(?:royalty|royalties)[\s\S]{0,500}?(?:percent|%|\d+\/\d+)/gi,
        title: 'Royalty Clause',
      },
      {
        type: 'bonus' as const,
        pattern: /(?:bonus|signing bonus)[\s\S]{0,300}?(?:\$[\d,]+|dollars)/gi,
        title: 'Bonus Payment',
      },
      {
        type: 'term' as const,
        pattern: /(?:primary term|lease term)[\s\S]{0,300}?(?:\d+\s*years?)/gi,
        title: 'Primary Term',
      },
      {
        type: 'extension' as const,
        pattern: /(?:extension|renewal|option to extend)[\s\S]{0,500}/gi,
        title: 'Extension Options',
      },
      {
        type: 'termination' as const,
        pattern: /(?:termination|terminate|cessation)[\s\S]{0,500}/gi,
        title: 'Termination',
      },
      {
        type: 'force_majeure' as const,
        pattern: /(?:force majeure|act of god|unforeseeable)[\s\S]{0,500}/gi,
        title: 'Force Majeure',
      },
      {
        type: 'audit' as const,
        pattern: /(?:audit|inspection|examine books)[\s\S]{0,400}/gi,
        title: 'Audit Rights',
      },
      {
        type: 'assignment' as const,
        pattern: /(?:assignment|assign|transfer)[\s\S]{0,400}/gi,
        title: 'Assignment',
      },
      {
        type: 'indemnification' as const,
        pattern: /(?:indemnif|hold harmless|defend)[\s\S]{0,500}/gi,
        title: 'Indemnification',
      },
      {
        type: 'environmental' as const,
        pattern: /(?:environmental|pollution|contamination|remediation)[\s\S]{0,500}/gi,
        title: 'Environmental',
      },
    ];

    // Extract clauses using patterns
    for (const { type, pattern, title } of clausePatterns) {
      const matches = documentText.matchAll(pattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const clauseText = match[0];
          const clause: ContractClause = {
            id: uuidv4(),
            type,
            title,
            text: clauseText.trim(),
            startPosition: match.index,
            endPosition: match.index + clauseText.length,
            risk: this.assessClauseRisk(type, clauseText),
            metadata: this.extractClauseMetadata(type, clauseText),
          };

          // Identify issues
          clause.issues = this.identifyClauseIssues(type, clauseText, clause.metadata);
          
          // Generate suggestions
          if (clause.issues && clause.issues.length > 0) {
            clause.suggestions = this.generateClauseSuggestions(type, clause.issues);
          }

          clauses.push(clause);
        }
      }
    }

    // Sort clauses by position
    clauses.sort((a, b) => a.startPosition - b.startPosition);

    // If we have OpenAI API access, enhance with AI analysis
    if (this.openAIApiKey) {
      try {
        const enhancedClauses = await this.enhanceClausesWithAI(documentText, clauses);
        return enhancedClauses;
      } catch (error) {
        logger.warn('AI clause enhancement failed, using pattern matching only', { error });
      }
    }

    return clauses;
  }

  /**
   * Enhance clause extraction with OpenAI
   */
  private async enhanceClausesWithAI(
    documentText: string,
    existingClauses: ContractClause[]
  ): Promise<ContractClause[]> {
    try {
      const prompt = `
        Analyze this oil and gas lease contract and identify all important clauses.
        For each clause, provide:
        1. Type (royalty, bonus, term, extension, termination, etc.)
        2. The exact text of the clause
        3. Risk level (high, medium, low)
        4. Any issues or concerns
        
        Contract text:
        ${documentText.substring(0, 3000)}...
        
        Return as JSON array of clauses.
      `;

      const response = await axios.post(
        this.openAIEndpoint,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a legal expert specializing in oil and gas lease contracts.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Parse AI response and merge with existing clauses
      const aiClauses = JSON.parse(response.data.choices[0].message.content);
      
      // Merge AI insights with pattern-matched clauses
      // Merge AI insights with pattern-matched clauses
      const mergedClauses = [...existingClauses];
      
      // Add any AI-identified clauses not found by patterns
      for (const aiClause of aiClauses) {
        const exists = existingClauses.some(
          ec => ec.type === aiClause.type &&
          Math.abs(ec.startPosition - aiClause.startPosition) < 50
        );
        
        if (!exists) {
          mergedClauses.push({
            id: uuidv4(),
            type: aiClause.type,
            title: aiClause.title || this.getClauseTitle(aiClause.type),
            text: aiClause.text,
            startPosition: aiClause.startPosition || 0,
            endPosition: aiClause.endPosition || aiClause.text.length,
            risk: aiClause.risk,
            issues: aiClause.issues,
            suggestions: aiClause.suggestions,
            metadata: aiClause.metadata,
          });
        }
      }
      
      return mergedClauses;
    } catch (error) {
      logger.error('OpenAI clause analysis failed', { error });
      return existingClauses;
    }
  }

  /**
   * Assess risk level of a clause
   */
  private assessClauseRisk(type: ContractClause['type'], text: string): 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    
    // High risk indicators
    const highRiskIndicators = [
      'unlimited liability',
      'no audit rights',
      'automatic renewal',
      'no termination',
      'waive',
      'forfeit',
      'penalty',
      'liquidated damages',
    ];
    
    // Check for high risk
    if (highRiskIndicators.some(indicator => lowerText.includes(indicator))) {
      return 'high';
    }
    
    // Type-specific risk assessment
    switch (type) {
      case 'royalty':
        const royaltyMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
        if (royaltyMatch) {
          const rate = parseFloat(royaltyMatch[1]);
          if (rate < 12.5) return 'high';
          if (rate < 15) return 'medium';
        }
        return 'low';
        
      case 'bonus':
        const bonusMatch = text.match(/\$\s*([\d,]+)/);
        if (bonusMatch) {
          const amount = parseFloat(bonusMatch[1].replace(/,/g, ''));
          if (amount < 500) return 'high';
          if (amount < 750) return 'medium';
        }
        return 'low';
        
      case 'force_majeure':
        return lowerText.includes('force majeure') ? 'low' : 'high';
        
      case 'audit':
        return lowerText.includes('audit') && lowerText.includes('right') ? 'low' : 'high';
        
      default:
        return 'medium';
    }
  }

  /**
   * Extract metadata from clause text
   */
  private extractClauseMetadata(type: ContractClause['type'], text: string): ContractClause['metadata'] {
    const metadata: ContractClause['metadata'] = {};
    
    switch (type) {
      case 'royalty':
        const royaltyMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
        if (royaltyMatch) {
          metadata.royaltyRate = parseFloat(royaltyMatch[1]);
        }
        break;
        
      case 'bonus':
        const bonusMatch = text.match(/\$\s*([\d,]+)/);
        if (bonusMatch) {
          metadata.bonusAmount = parseFloat(bonusMatch[1].replace(/,/g, ''));
        }
        break;
        
      case 'term':
        const termMatch = text.match(/(\d+)\s*years?/);
        if (termMatch) {
          metadata.termLength = parseInt(termMatch[1]);
        }
        break;
    }
    
    // Extract dates
    const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
    const dates = text.match(datePattern);
    if (dates) {
      metadata.dates = dates.map(d => new Date(d));
    }
    
    return metadata;
  }

  /**
   * Identify issues in a clause
   */
  private identifyClauseIssues(
    type: ContractClause['type'],
    text: string,
    metadata?: ContractClause['metadata']
  ): string[] {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Common issues
    if (lowerText.includes('waive') || lowerText.includes('waiver')) {
      issues.push('Contains waiver of rights');
    }
    
    if (lowerText.includes('sole discretion')) {
      issues.push('Grants unilateral decision-making power');
    }
    
    // Type-specific issues
    switch (type) {
      case 'royalty':
        if (metadata?.royaltyRate && metadata.royaltyRate < 12.5) {
          issues.push('Royalty rate below industry standard (12.5%)');
        }
        if (!lowerText.includes('market price') && !lowerText.includes('market value')) {
          issues.push('No reference to market pricing for royalty calculations');
        }
        break;
        
      case 'bonus':
        if (metadata?.bonusAmount && metadata.bonusAmount < 500) {
          issues.push('Bonus payment below market rate ($500/acre)');
        }
        break;
        
      case 'audit':
        if (!lowerText.includes('reasonable notice')) {
          issues.push('No reasonable notice requirement for audits');
        }
        if (!lowerText.includes('business hours')) {
          issues.push('No restriction to business hours for audits');
        }
        break;
        
      case 'termination':
        if (!lowerText.includes('notice')) {
          issues.push('No notice requirement for termination');
        }
        if (!lowerText.includes('cure')) {
          issues.push('No opportunity to cure defaults');
        }
        break;
        
      case 'indemnification':
        if (lowerText.includes('gross negligence') && lowerText.includes('except')) {
          issues.push('Indemnification may cover gross negligence');
        }
        break;
    }
    
    return issues;
  }

  /**
   * Generate suggestions for clause improvements
   */
  private generateClauseSuggestions(type: ContractClause['type'], issues: string[]): string[] {
    const suggestions: string[] = [];
    
    for (const issue of issues) {
      switch (issue) {
        case 'Royalty rate below industry standard (12.5%)':
          suggestions.push('Negotiate royalty rate to at least 12.5% or include escalation provisions');
          break;
          
        case 'No reference to market pricing for royalty calculations':
          suggestions.push('Add language requiring royalties based on market price at time of sale');
          break;
          
        case 'Bonus payment below market rate ($500/acre)':
          suggestions.push('Request bonus payment increase to market rate of $750-1000/acre');
          break;
          
        case 'No reasonable notice requirement for audits':
          suggestions.push('Add requirement for 30-day written notice before audits');
          break;
          
        case 'No opportunity to cure defaults':
          suggestions.push('Include 30-day cure period for monetary defaults, 60 days for non-monetary');
          break;
          
        case 'Contains waiver of rights':
          suggestions.push('Remove or limit waiver provisions to specific, negotiated items');
          break;
          
        default:
          suggestions.push(`Review and address: ${issue}`);
      }
    }
    
    return suggestions;
  }

  /**
   * Identify missing critical clauses
   */
  private identifyMissingClauses(
    existingClauses: ContractClause[]
  ): ContractAnalysis['missingClauses'] {
    const requiredClauses = [
      {
        type: 'force_majeure',
        importance: 'critical' as const,
        description: 'Protection against unforeseeable events',
        suggestedText: 'Neither party shall be liable for delays or failures in performance resulting from acts beyond the reasonable control of such party, including but not limited to acts of God, acts of war, terrorism, pandemic, government regulations, or natural disasters.',
      },
      {
        type: 'audit',
        importance: 'critical' as const,
        description: 'Right to verify royalty calculations',
        suggestedText: 'Lessee shall maintain accurate records of all operations and production. Lessor shall have the right, upon 30 days written notice, to audit such records during normal business hours.',
      },
      {
        type: 'assignment',
        importance: 'important' as const,
        description: 'Control over lease transfers',
        suggestedText: 'This lease may not be assigned in whole or in part without the prior written consent of Lessor, which consent shall not be unreasonably withheld.',
      },
      {
        type: 'environmental',
        importance: 'critical' as const,
        description: 'Environmental protection and liability',
        suggestedText: 'Lessee shall conduct all operations in compliance with applicable environmental laws and shall indemnify Lessor against any environmental damages arising from Lessee\'s operations.',
      },
      {
        type: 'indemnification',
        importance: 'critical' as const,
        description: 'Protection against third-party claims',
        suggestedText: 'Lessee shall indemnify, defend, and hold harmless Lessor from any claims arising out of Lessee\'s operations, except for claims resulting from Lessor\'s gross negligence or willful misconduct.',
      },
    ];
    
    const existingTypes = new Set(existingClauses.map(c => c.type));
    const missingClauses = requiredClauses
      .filter(req => !existingTypes.has(req.type as ContractClause['type']))
      .map(req => ({
        type: req.type,
        importance: req.importance,
        description: req.description,
        suggestedText: req.suggestedText,
      }));
    
    return missingClauses;
  }

  /**
   * Extract key terms from contract
   */
  private async extractKeyTerms(
    documentText: string,
    clauses: ContractClause[]
  ): Promise<ContractAnalysis['keyTerms']> {
    const keyTerms: ContractAnalysis['keyTerms'] = {};
    
    // Extract from clauses
    for (const clause of clauses) {
      if (clause.metadata) {
        if (clause.metadata.royaltyRate !== undefined) {
          keyTerms.royaltyRate = clause.metadata.royaltyRate;
        }
        if (clause.metadata.bonusAmount !== undefined) {
          keyTerms.bonusPayment = clause.metadata.bonusAmount;
        }
        if (clause.metadata.termLength !== undefined) {
          keyTerms.primaryTerm = clause.metadata.termLength;
        }
      }
    }
    
    // Extract dates
    const effectiveDateMatch = documentText.match(/effective\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
    if (effectiveDateMatch) {
      keyTerms.effectiveDate = new Date(effectiveDateMatch[1]);
    }
    
    // Extract parties
    const lessorMatch = documentText.match(/lessor[:\s]+([A-Za-z\s&.,]+?)(?:\n|,\s*(?:a|an))/i);
    if (lessorMatch) {
      keyTerms.lessor = lessorMatch[1].trim();
    }
    
    const lesseeMatch = documentText.match(/lessee[:\s]+([A-Za-z\s&.,]+?)(?:\n|,\s*(?:a|an))/i);
    if (lesseeMatch) {
      keyTerms.lessee = lesseeMatch[1].trim();
    }
    
    // Extract acreage
    const acreageMatch = documentText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?/i);
    if (acreageMatch) {
      keyTerms.acreage = parseFloat(acreageMatch[1].replace(/,/g, ''));
    }
    
    return keyTerms;
  }

  /**
   * Extract obligations from contract
   */
  private async extractObligations(documentText: string): Promise<ContractAnalysis['obligations']> {
    const obligations: ContractAnalysis['obligations'] = [];
    
    // Common obligation patterns
    const obligationPatterns = [
      {
        pattern: /shall\s+(?:pay|deliver|provide|maintain|submit|file)[\s\S]{0,200}/gi,
        party: 'lessee' as const,
      },
      {
        pattern: /lessor\s+shall[\s\S]{0,200}/gi,
        party: 'lessor' as const,
      },
      {
        pattern: /must\s+(?:pay|deliver|provide|maintain|submit|file)[\s\S]{0,200}/gi,
        party: 'lessee' as const,
      },
    ];
    
    for (const { pattern, party } of obligationPatterns) {
      const matches = documentText.matchAll(pattern);
      
      for (const match of matches) {
        const obligationText = match[0].trim();
        
        // Extract deadline if present
        const deadlineMatch = obligationText.match(/within\s+(\d+)\s+(days?|months?|years?)/i);
        let deadline: Date | undefined;
        if (deadlineMatch) {
          const amount = parseInt(deadlineMatch[1]);
          const unit = deadlineMatch[2].toLowerCase();
          deadline = new Date();
          
          switch (unit) {
            case 'day':
            case 'days':
              deadline.setDate(deadline.getDate() + amount);
              break;
            case 'month':
            case 'months':
              deadline.setMonth(deadline.getMonth() + amount);
              break;
            case 'year':
            case 'years':
              deadline.setFullYear(deadline.getFullYear() + amount);
              break;
          }
        }
        
        // Extract frequency if present
        const frequencyMatch = obligationText.match(/(?:monthly|quarterly|annually|yearly|weekly)/i);
        const frequency = frequencyMatch ? frequencyMatch[0].toLowerCase() : undefined;
        
        obligations.push({
          party,
          obligation: obligationText,
          deadline,
          frequency,
        });
      }
    }
    
    return obligations;
  }

  /**
   * Extract financial terms
   */
  private async extractFinancialTerms(documentText: string): Promise<ContractAnalysis['financialTerms']> {
    const financialTerms: ContractAnalysis['financialTerms'] = [];
    
    // Dollar amount patterns
    const dollarPattern = /\$\s*([\d,]+(?:\.\d{2})?)\s*(?:per\s+(\w+))?/g;
    const dollarMatches = documentText.matchAll(dollarPattern);
    
    for (const match of dollarMatches) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const unit = match[2] || '';
      
      financialTerms.push({
        type: 'payment',
        amount,
        description: `$${match[1]}${unit ? ' per ' + unit : ''}`,
      });
    }
    
    // Percentage patterns
    const percentPattern = /(\d+(?:\.\d+)?)\s*%\s*(?:of\s+)?([^.]+)/g;
    const percentMatches = documentText.matchAll(percentPattern);
    
    for (const match of percentMatches) {
      const percentage = parseFloat(match[1]);
      const context = match[2].trim();
      
      financialTerms.push({
        type: 'percentage',
        percentage,
        description: `${percentage}% ${context}`,
      });
    }
    
    return financialTerms;
  }

  /**
   * Assess overall contract risk
   */
  private assessContractRisk(
    clauses: ContractClause[],
    missingClauses: ContractAnalysis['missingClauses'],
    keyTerms: ContractAnalysis['keyTerms']
  ): ContractAnalysis['riskAssessment'] {
    const riskFactors: ContractAnalysis['riskAssessment']['riskFactors'] = [];
    
    // Check for high-risk clauses
    const highRiskClauses = clauses.filter(c => c.risk === 'high');
    if (highRiskClauses.length > 0) {
      riskFactors.push({
        factor: 'High-risk clauses',
        severity: 'high',
        description: `${highRiskClauses.length} clauses identified as high risk`,
        mitigation: 'Review and negotiate modifications to high-risk clauses',
      });
    }
    
    // Check for critical missing clauses
    const criticalMissing = missingClauses.filter(c => c.importance === 'critical');
    if (criticalMissing.length > 0) {
      riskFactors.push({
        factor: 'Missing critical clauses',
        severity: 'high',
        description: `${criticalMissing.length} critical protective clauses are missing`,
        mitigation: 'Add missing clauses before execution',
      });
    }
    
    // Check financial terms
    if (keyTerms.royaltyRate && keyTerms.royaltyRate < 12.5) {
      riskFactors.push({
        factor: 'Below-market royalty',
        severity: 'medium',
        description: `Royalty rate of ${keyTerms.royaltyRate}% is below market standard`,
        mitigation: 'Negotiate to market rate or add escalation provisions',
      });
    }
    
    // Check for audit rights
    const hasAuditRights = clauses.some(c => c.type === 'audit');
    if (!hasAuditRights) {
      riskFactors.push({
        factor: 'No audit rights',
        severity: 'high',
        description: 'Contract lacks provisions for verifying royalty calculations',
        mitigation: 'Include audit rights clause with reasonable notice provisions',
      });
    }
    
    // Determine overall risk
    const highRiskCount = riskFactors.filter(f => f.severity === 'high').length;
    const mediumRiskCount = riskFactors.filter(f => f.severity === 'medium').length;
    
    let overallRisk: 'high' | 'medium' | 'low' = 'low';
    if (highRiskCount >= 2 || (highRiskCount === 1 && mediumRiskCount >= 2)) {
      overallRisk = 'high';
    } else if (highRiskCount === 1 || mediumRiskCount >= 2) {
      overallRisk = 'medium';
    }
    
    return {
      overallRisk,
      riskFactors,
    };
  }

  /**
   * Generate contract recommendations
   */
  private generateRecommendations(
    clauses: ContractClause[],
    missingClauses: ContractAnalysis['missingClauses'],
    riskAssessment: ContractAnalysis['riskAssessment'],
    keyTerms: ContractAnalysis['keyTerms']
  ): string[] {
    const recommendations: string[] = [];
    
    // High-level recommendation based on risk
    if (riskAssessment.overallRisk === 'high') {
      recommendations.push('CRITICAL: Significant modifications required before execution. Consider legal review.');
    } else if (riskAssessment.overallRisk === 'medium') {
      recommendations.push('Several improvements recommended to reduce risk and improve terms.');
    }
    
    // Missing clause recommendations
    if (missingClauses.length > 0) {
      recommendations.push(
        `Add ${missingClauses.length} missing protective clauses, especially: ${
          missingClauses.filter(c => c.importance === 'critical').map(c => c.type).join(', ')
        }`
      );
    }
    
    // Financial recommendations
    if (keyTerms.royaltyRate && keyTerms.royaltyRate < 15) {
      recommendations.push('Negotiate royalty rate to 15% or higher to match current market conditions');
    }
    
    if (keyTerms.bonusPayment && keyTerms.bonusPayment < 750) {
      recommendations.push('Request bonus payment increase to $750-1000 per acre based on regional comparables');
    }
    
    // Clause-specific recommendations
    const highRiskClauses = clauses.filter(c => c.risk === 'high');
    if (highRiskClauses.length > 0) {
      recommendations.push(
        `Review and modify ${highRiskClauses.length} high-risk clauses: ${
          highRiskClauses.map(c => c.title).join(', ')
        }`
      );
    }
    
    // Term recommendations
    if (keyTerms.primaryTerm && keyTerms.primaryTerm > 5) {
      recommendations.push('Consider negotiating shorter primary term (3-5 years) with extension options');
    }
    
    // Audit recommendations
    const hasAuditRights = clauses.some(c => c.type === 'audit');
    if (!hasAuditRights) {
      recommendations.push('Include comprehensive audit rights with 30-day notice provision');
    }
    
    return recommendations;
  }

  /**
   * Get clause title by type
   */
  private getClauseTitle(type: string): string {
    const titles: Record<string, string> = {
      royalty: 'Royalty Clause',
      bonus: 'Bonus Payment',
      term: 'Primary Term',
      extension: 'Extension Options',
      termination: 'Termination',
      assignment: 'Assignment',
      audit: 'Audit Rights',
      force_majeure: 'Force Majeure',
      indemnification: 'Indemnification',
      environmental: 'Environmental',
      custom: 'Custom Provision',
    };
    
    return titles[type] || 'Other Provision';
  }

  /**
   * Compare multiple contracts
   */
  async compareContracts(
    contracts: Array<{
      documentId: string;
      documentText: string;
      fileName: string;
    }>
  ): Promise<ContractComparison> {
    try {
      logger.info('Starting contract comparison', { count: contracts.length });

      // Analyze each contract
      const analyses = await Promise.all(
        contracts.map(contract =>
          this.analyzeContract(contract.documentText, {
            fileName: contract.fileName,
          })
        )
      );

      // Compare clauses
      const clauseTypes = new Set<string>();
      analyses.forEach(analysis => {
        analysis.clauses.forEach(clause => clauseTypes.add(clause.type));
      });

      const differences: ContractComparison['differences'] = [];
      const commonalities: ContractComparison['commonalities'] = [];

      // Compare each clause type
      for (const clauseType of clauseTypes) {
        const clausesPerDoc = analyses.map((analysis, idx) => ({
          documentId: contracts[idx].documentId,
          clause: analysis.clauses.find(c => c.type === clauseType),
        }));

        const hasClause = clausesPerDoc.filter(doc => doc.clause).length;
        
        if (hasClause === contracts.length) {
          // All documents have this clause - check for differences
          const values = clausesPerDoc.map(doc => doc.clause?.metadata);
          const allSame = values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));
          
          if (allSame) {
            commonalities.push({
              clauseType,
              value: values[0],
            });
          } else {
            differences.push({
              clauseType,
              documents: clausesPerDoc.map(doc => ({
                documentId: doc.documentId,
                value: doc.clause?.metadata,
                text: doc.clause?.text,
              })),
              significance: 'major',
              recommendation: `Standardize ${clauseType} across all contracts`,
            });
          }
        } else {
          // Not all documents have this clause
          differences.push({
            clauseType,
            documents: clausesPerDoc.map(doc => ({
              documentId: doc.documentId,
              value: doc.clause ? doc.clause.metadata : null,
              text: doc.clause?.text,
            })),
            significance: 'major',
            recommendation: `Ensure ${clauseType} is included in all contracts`,
          });
        }
      }

      // Generate overall recommendation
      const recommendation = this.generateComparisonRecommendation(differences, commonalities);

      return {
        documentIds: contracts.map(c => c.documentId),
        differences,
        commonalities,
        recommendation,
      };
    } catch (error) {
      logger.error('Contract comparison failed', { error });
      throw error;
    }
  }

  /**
   * Generate comparison recommendation
   */
  private generateComparisonRecommendation(
    differences: ContractComparison['differences'],
    commonalities: ContractComparison['commonalities']
  ): string {
    const majorDifferences = differences.filter(d => d.significance === 'major');
    
    if (majorDifferences.length === 0) {
      return 'Contracts are substantially similar. Minor standardization may improve consistency.';
    } else if (majorDifferences.length < 3) {
      return `Address ${majorDifferences.length} major differences to ensure consistency across portfolio.`;
    } else {
      return 'Significant variations detected. Comprehensive standardization recommended to reduce risk and improve management efficiency.';
    }
  }

  /**
   * Generate contract from template
   */
  async generateContract(
    template: ContractTemplate,
    variables: Record<string, any>
  ): Promise<string> {
    try {
      logger.info('Generating contract from template', { templateId: template.id });

      let contractText = '';
      
      // Add header
      contractText += `${template.name.toUpperCase()}\n\n`;
      contractText += `This ${template.type} agreement is entered into as of ${
        variables.effectiveDate || new Date().toLocaleDateString()
      }\n\n`;
      
      // Add parties
      if (variables.lessor && variables.lessee) {
        contractText += `BETWEEN:\n`;
        contractText += `${variables.lessor} ("Lessor")\n`;
        contractText += `AND:\n`;
        contractText += `${variables.lessee} ("Lessee")\n\n`;
      }
      
      // Add clauses
      for (const clause of template.clauses) {
        if (clause.isRequired || variables[`include_${clause.type}`] !== false) {
          contractText += `${clause.title.toUpperCase()}\n\n`;
          
          // Replace variables in clause text
          let clauseText = clause.text;
          if (clause.variables) {
            for (const variable of clause.variables) {
              const value = variables[variable.name] || `[${variable.name}]`;
              clauseText = clauseText.replace(
                new RegExp(`\\{${variable.name}\\}`, 'g'),
                value.toString()
              );
            }
          }
          
          contractText += `${clauseText}\n\n`;
        }
      }
      
      // Add signature block
      contractText += `\nIN WITNESS WHEREOF, the parties have executed this ${template.type} as of the date first written above.\n\n`;
      contractText += `LESSOR:\n\n_______________________\n${variables.lessor || '[Lessor Name]'}\n\n`;
      contractText += `LESSEE:\n\n_______________________\n${variables.lessee || '[Lessee Name]'}\n`;
      
      logger.info('Contract generated successfully', { length: contractText.length });
      
      return contractText;
    } catch (error) {
      logger.error('Contract generation failed', { error, templateId: template.id });
      throw error;
    }
  }

  /**
   * Create a standard lease template
   */
  createStandardLeaseTemplate(): ContractTemplate {
    return {
      id: uuidv4(),
      name: 'Standard Oil and Gas Lease',
      type: 'lease',
      clauses: [
        {
          type: 'granting',
          title: 'Granting Clause',
          text: 'Lessor hereby grants, leases, and lets exclusively to Lessee the land described below for the purpose of exploring, drilling, mining, and operating for oil, gas, and all other minerals.',
          isRequired: true,
        },
        {
          type: 'description',
          title: 'Land Description',
          text: 'The leased premises consist of {acreage} acres, more or less, located in {county} County, {state}, and more particularly described as: {legal_description}',
          isRequired: true,
          variables: [
            { name: 'acreage', type: 'number' },
            { name: 'county', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'legal_description', type: 'text' },
          ],
        },
        {
          type: 'term',
          title: 'Primary Term',
          text: 'This lease shall remain in force for a primary term of {primary_term} years from the date hereof, and as long thereafter as oil, gas, or other minerals are produced in paying quantities.',
          isRequired: true,
          variables: [
            { name: 'primary_term', type: 'number' },
          ],
        },
        {
          type: 'royalty',
          title: 'Royalty',
          text: 'Lessee shall pay Lessor a royalty of {royalty_rate}% of the gross proceeds from the sale of oil, gas, and other minerals produced from the leased premises.',
          isRequired: true,
          variables: [
            { name: 'royalty_rate', type: 'number' },
          ],
        },
        {
          type: 'bonus',
          title: 'Bonus Payment',
          text: 'Lessee shall pay Lessor a bonus of ${bonus_amount} per acre upon execution of this lease, receipt of which is hereby acknowledged.',
          isRequired: true,
          variables: [
            { name: 'bonus_amount', type: 'number' },
          ],
        },
        {
          type: 'audit',
          title: 'Audit Rights',
          text: 'Lessor shall have the right, upon thirty (30) days written notice, to audit Lessee\'s records relating to production and royalty payments during normal business hours.',
          isRequired: true,
        },
        {
          type: 'force_majeure',
          title: 'Force Majeure',
          text: 'Neither party shall be liable for delays or failures in performance resulting from acts beyond their reasonable control, including acts of God, acts of war, government regulations, or natural disasters.',
          isRequired: true,
        },
        {
          type: 'assignment',
          title: 'Assignment',
          text: 'This lease may be assigned by Lessee in whole or in part. No change in ownership of the leased premises shall be binding on Lessee until Lessee has been furnished with written notice and proof of such change.',
          isRequired: false,
        },
        {
          type: 'environmental',
          title: 'Environmental Protection',
          text: 'Lessee shall conduct all operations in compliance with applicable environmental laws and regulations, and shall indemnify Lessor against any environmental damages arising from Lessee\'s operations.',
          isRequired: true,
        },
        {
          type: 'indemnification',
          title: 'Indemnification',
          text: 'Lessee shall indemnify, defend, and hold harmless Lessor from any claims, damages, or liabilities arising out of Lessee\'s operations on the leased premises, except those resulting from Lessor\'s gross negligence or willful misconduct.',
          isRequired: true,
        },
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        jurisdiction: 'Texas',
      },
    };
  }
}

export const contractService = new ContractService();