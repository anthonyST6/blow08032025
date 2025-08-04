import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../agents/base.agent';

export interface IntegrityCheckResult {
  dataConsistency: {
    score: number;
    inconsistencies: Array<{
      field: string;
      expected: string;
      actual: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  crossValidation: {
    score: number;
    validationResults: Array<{
      source: string;
      status: 'valid' | 'invalid' | 'unverified';
      details: string;
    }>;
  };
  regulatoryCompliance: {
    compliant: boolean;
    violations: Array<{
      regulation: string;
      requirement: string;
      status: 'violation' | 'warning' | 'compliant';
      details: string;
    }>;
  };
  anomalyDetection: {
    anomaliesFound: number;
    anomalies: Array<{
      type: string;
      description: string;
      confidence: number;
      impact: 'low' | 'medium' | 'high';
    }>;
  };
}

export interface IntegrityAuditorInput extends LLMOutput {
  securityCheckResults?: any; // Results from Security Sentinel
  verticalContext?: {
    vertical: string;
    useCase: string;
    regulations?: string[];
  };
  externalDataSources?: Array<{
    source: string;
    data: any;
    timestamp: Date;
  }>;
}

export interface IntegrityAuditorOutput extends AgentResult {
  integrityScore: number;
  discrepanciesFound: string[];
  complianceIssues: string[];
  checkResults: IntegrityCheckResult;
}

export class IntegrityAuditor extends VanguardAgent {
  constructor() {
    super(
      'integrity-auditor',
      'Integrity Auditor',
      '1.0.0',
      'Cross-references data, validates against external sources, checks compliance',
      {
        thresholds: {
          low: 85,
          medium: 70,
          high: 50,
          critical: 30,
        },
      }
    );
  }

  async analyze(input: IntegrityAuditorInput): Promise<IntegrityAuditorOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting integrity audit', {
      promptId: input.promptId,
      hasSecurityResults: !!input.securityCheckResults,
      vertical: input.verticalContext?.vertical,
      externalSourcesCount: input.externalDataSources?.length || 0,
    });

    try {
      this.validateInput(input);

      // Perform integrity checks
      const checkResults = await this.performIntegrityChecks(input);
      
      // Calculate overall integrity score
      const integrityScore = this.calculateIntegrityScore(checkResults);
      
      // Generate flags based on findings
      const flags = this.generateIntegrityFlags(checkResults, integrityScore);
      
      // Identify discrepancies
      const discrepanciesFound = this.identifyDiscrepancies(checkResults);
      
      // Identify compliance issues
      const complianceIssues = this.identifyComplianceIssues(checkResults);

      // Create the result
      const result: IntegrityAuditorOutput = {
        ...this.createResult(
          integrityScore,
          flags,
          {
            checkResults,
            verticalContext: input.verticalContext,
            securityCheckResults: input.securityCheckResults,
            externalSourcesChecked: input.externalDataSources?.length || 0,
          },
          this.calculateConfidence(checkResults),
          startTime
        ),
        integrityScore,
        discrepanciesFound,
        complianceIssues,
        checkResults,
      };

      this.log('info', 'Integrity audit completed', {
        score: integrityScore,
        discrepanciesCount: discrepanciesFound.length,
        complianceIssuesCount: complianceIssues.length,
        processingTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.log('error', 'Integrity audit failed', { error });
      throw error;
    }
  }

  private async performIntegrityChecks(input: IntegrityAuditorInput): Promise<IntegrityCheckResult> {
    const dataConsistency = await this.checkDataConsistency(input);
    const crossValidation = await this.performCrossValidation(input);
    const regulatoryCompliance = await this.checkRegulatoryCompliance(input);
    const anomalyDetection = await this.detectAnomalies(input);

    return {
      dataConsistency,
      crossValidation,
      regulatoryCompliance,
      anomalyDetection,
    };
  }

  private async checkDataConsistency(input: IntegrityAuditorInput): Promise<IntegrityCheckResult['dataConsistency']> {
    const inconsistencies: IntegrityCheckResult['dataConsistency']['inconsistencies'] = [];
    let score = 100;

    // Extract and validate data fields
    const dataFields = this.extractDataFields(input.text);
    
    // Check for internal consistency
    for (const [field, value] of Object.entries(dataFields)) {
      const validationResult = this.validateFieldConsistency(field, value, dataFields);
      if (!validationResult.isConsistent) {
        inconsistencies.push({
          field,
          expected: validationResult.expected || 'N/A',
          actual: value,
          severity: validationResult.severity || 'medium',
        });
        score -= validationResult.severity === 'high' ? 20 : 
                validationResult.severity === 'medium' ? 10 : 5;
      }
    }

    // Check consistency with security results if available
    if (input.securityCheckResults) {
      const securityConsistency = this.checkSecurityResultsConsistency(
        dataFields,
        input.securityCheckResults
      );
      inconsistencies.push(...securityConsistency.inconsistencies);
      score -= securityConsistency.penaltyPoints;
    }

    return {
      score: Math.max(0, score),
      inconsistencies,
    };
  }

  private async performCrossValidation(input: IntegrityAuditorInput): Promise<IntegrityCheckResult['crossValidation']> {
    const validationResults: IntegrityCheckResult['crossValidation']['validationResults'] = [];
    let score = 100;

    // Validate against external data sources if provided
    if (input.externalDataSources && input.externalDataSources.length > 0) {
      for (const source of input.externalDataSources) {
        const validation = await this.validateAgainstSource(input.text, source);
        validationResults.push(validation);
        
        if (validation.status === 'invalid') {
          score -= 25;
        } else if (validation.status === 'unverified') {
          score -= 10;
        }
      }
    } else {
      // No external sources provided
      validationResults.push({
        source: 'internal',
        status: 'unverified',
        details: 'No external data sources provided for cross-validation',
      });
      score -= 20;
    }

    // Perform vertical-specific validations
    if (input.verticalContext) {
      const verticalValidation = this.performVerticalSpecificValidation(
        input.text,
        input.verticalContext
      );
      validationResults.push(...verticalValidation.results);
      score -= verticalValidation.penaltyPoints;
    }

    return {
      score: Math.max(0, score),
      validationResults,
    };
  }

  private async checkRegulatoryCompliance(input: IntegrityAuditorInput): Promise<IntegrityCheckResult['regulatoryCompliance']> {
    const violations: IntegrityCheckResult['regulatoryCompliance']['violations'] = [];
    let isCompliant = true;

    // Check compliance based on vertical and regulations
    if (input.verticalContext?.regulations) {
      for (const regulation of input.verticalContext.regulations) {
        const complianceCheck = this.checkRegulationCompliance(
          input.text,
          regulation,
          input.verticalContext.vertical
        );
        
        violations.push(...complianceCheck.violations);
        if (complianceCheck.violations.some(v => v.status === 'violation')) {
          isCompliant = false;
        }
      }
    }

    // Check for general compliance issues
    const generalCompliance = this.checkGeneralCompliance(input.text);
    violations.push(...generalCompliance.violations);
    if (generalCompliance.violations.some(v => v.status === 'violation')) {
      isCompliant = false;
    }

    return {
      compliant: isCompliant,
      violations,
    };
  }

  private async detectAnomalies(input: IntegrityAuditorInput): Promise<IntegrityCheckResult['anomalyDetection']> {
    const anomalies: IntegrityCheckResult['anomalyDetection']['anomalies'] = [];

    // Pattern-based anomaly detection
    const patternAnomalies = this.detectPatternAnomalies(input.text);
    anomalies.push(...patternAnomalies);

    // Statistical anomaly detection (simulated)
    const statisticalAnomalies = this.detectStatisticalAnomalies(input.text);
    anomalies.push(...statisticalAnomalies);

    // Contextual anomaly detection
    if (input.verticalContext) {
      const contextualAnomalies = this.detectContextualAnomalies(
        input.text,
        input.verticalContext
      );
      anomalies.push(...contextualAnomalies);
    }

    // Bias detection (ethical alignment check)
    const biasAnomalies = this.detectBiasAnomalies(input.text);
    anomalies.push(...biasAnomalies);

    return {
      anomaliesFound: anomalies.length,
      anomalies,
    };
  }

  private extractDataFields(text: string): Record<string, string> {
    const fields: Record<string, string> = {};
    
    // Extract common data patterns
    const patterns = {
      date: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g,
      amount: /\$[\d,]+\.?\d*/g,
      percentage: /\d+\.?\d*%/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      id: /\b[A-Z]{2,}-\d{4,}\b/g,
    };

    for (const [fieldType, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match, index) => {
          fields[`${fieldType}_${index}`] = match;
        });
      }
    }

    return fields;
  }

  private validateFieldConsistency(
    field: string,
    value: string,
    _allFields: Record<string, string>
  ): { isConsistent: boolean; expected?: string; severity?: 'low' | 'medium' | 'high' } {
    // Date consistency checks
    if (field.startsWith('date_')) {
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return { isConsistent: false, expected: 'Valid date format', severity: 'high' };
      }
      
      // Check if date is reasonable (not too far in past or future)
      const now = new Date();
      const yearDiff = Math.abs(now.getFullYear() - dateValue.getFullYear());
      if (yearDiff > 50) {
        return { isConsistent: false, expected: 'Date within reasonable range', severity: 'medium' };
      }
    }

    // Amount consistency checks
    if (field.startsWith('amount_')) {
      const numericValue = parseFloat(value.replace(/[$,]/g, ''));
      if (isNaN(numericValue) || numericValue < 0) {
        return { isConsistent: false, expected: 'Valid positive amount', severity: 'high' };
      }
    }

    // Percentage consistency checks
    if (field.startsWith('percentage_')) {
      const percentValue = parseFloat(value.replace('%', ''));
      if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
        return { isConsistent: false, expected: 'Percentage between 0-100', severity: 'medium' };
      }
    }

    return { isConsistent: true };
  }

  private checkSecurityResultsConsistency(
    _dataFields: Record<string, string>,
    securityResults: any
  ): { inconsistencies: IntegrityCheckResult['dataConsistency']['inconsistencies']; penaltyPoints: number } {
    const inconsistencies: IntegrityCheckResult['dataConsistency']['inconsistencies'] = [];
    let penaltyPoints = 0;

    // Check if security flagged documents match our data
    if (securityResults.flaggedDocuments && securityResults.flaggedDocuments.length > 0) {
      inconsistencies.push({
        field: 'document_security_status',
        expected: 'No security flags',
        actual: `${securityResults.flaggedDocuments.length} documents flagged`,
        severity: 'high',
      });
      penaltyPoints += 15;
    }

    return { inconsistencies, penaltyPoints };
  }

  private async validateAgainstSource(
    text: string,
    source: NonNullable<IntegrityAuditorInput['externalDataSources']>[0]
  ): Promise<IntegrityCheckResult['crossValidation']['validationResults'][0]> {
    // Simulate validation against external source
    try {
      // In real implementation, would actually validate against the source
      const isValid = !text.toLowerCase().includes('unverified') && 
                     !text.toLowerCase().includes('disputed');
      
      return {
        source: source.source,
        status: isValid ? 'valid' : 'invalid',
        details: isValid ? 
          `Successfully validated against ${source.source}` :
          `Validation failed against ${source.source}`,
      };
    } catch (error) {
      return {
        source: source.source,
        status: 'unverified',
        details: `Unable to validate against ${source.source}: ${error}`,
      };
    }
  }

  private performVerticalSpecificValidation(
    text: string,
    context: NonNullable<IntegrityAuditorInput['verticalContext']>
  ): { results: IntegrityCheckResult['crossValidation']['validationResults']; penaltyPoints: number } {
    const results: IntegrityCheckResult['crossValidation']['validationResults'] = [];
    let penaltyPoints = 0;

    switch (context.vertical.toLowerCase()) {
      case 'energy':
        // Validate energy-specific data
        if (!text.match(/\b(lease|mineral rights|royalty|acre)\b/gi)) {
          results.push({
            source: 'energy-domain-validation',
            status: 'invalid',
            details: 'Missing required energy sector terminology',
          });
          penaltyPoints += 15;
        }
        break;
      
      case 'government':
        // Validate government-specific data
        if (!text.match(/\b(contract|procurement|compliance|regulation)\b/gi)) {
          results.push({
            source: 'government-domain-validation',
            status: 'invalid',
            details: 'Missing required government sector terminology',
          });
          penaltyPoints += 15;
        }
        break;
      
      case 'insurance':
        // Validate insurance-specific data
        if (!text.match(/\b(policy|premium|claim|coverage|deductible)\b/gi)) {
          results.push({
            source: 'insurance-domain-validation',
            status: 'invalid',
            details: 'Missing required insurance sector terminology',
          });
          penaltyPoints += 15;
        }
        break;
    }

    return { results, penaltyPoints };
  }

  private checkRegulationCompliance(
    text: string,
    regulation: string,
    _vertical: string
  ): { violations: IntegrityCheckResult['regulatoryCompliance']['violations'] } {
    const violations: IntegrityCheckResult['regulatoryCompliance']['violations'] = [];

    // Simulate regulation-specific checks
    const regulationChecks: Record<string, () => void> = {
      'GDPR': () => {
        if (text.match(/\b(personal data|email|phone)\b/gi) && 
            !text.match(/\b(consent|privacy|data protection)\b/gi)) {
          violations.push({
            regulation: 'GDPR',
            requirement: 'Personal data handling requires consent documentation',
            status: 'violation',
            details: 'Personal data found without privacy compliance indicators',
          });
        }
      },
      'SOX': () => {
        if (text.match(/\b(financial|accounting|audit)\b/gi) && 
            !text.match(/\b(control|verification|attestation)\b/gi)) {
          violations.push({
            regulation: 'SOX',
            requirement: 'Financial data requires internal controls',
            status: 'warning',
            details: 'Financial data without clear control mechanisms',
          });
        }
      },
      'HIPAA': () => {
        if (text.match(/\b(patient|medical|health)\b/gi) && 
            !text.match(/\b(encrypted|de-identified|authorization)\b/gi)) {
          violations.push({
            regulation: 'HIPAA',
            requirement: 'Health information must be protected',
            status: 'violation',
            details: 'Health data without required protections',
          });
        }
      },
    };

    const checkFunction = regulationChecks[regulation];
    if (checkFunction) {
      checkFunction();
    }

    return { violations };
  }

  private checkGeneralCompliance(text: string): { violations: IntegrityCheckResult['regulatoryCompliance']['violations'] } {
    const violations: IntegrityCheckResult['regulatoryCompliance']['violations'] = [];

    // Check for general compliance red flags
    if (text.match(/\b(non-compliant|violation|breach|penalty)\b/gi)) {
      violations.push({
        regulation: 'General',
        requirement: 'Maintain regulatory compliance',
        status: 'warning',
        details: 'Compliance concerns mentioned in document',
      });
    }

    return { violations };
  }

  private detectPatternAnomalies(text: string): IntegrityCheckResult['anomalyDetection']['anomalies'] {
    const anomalies: IntegrityCheckResult['anomalyDetection']['anomalies'] = [];

    // Check for unusual patterns
    const unusualPatterns = [
      {
        pattern: /(\b\w+\b)\s+\1{3,}/gi,
        type: 'Repeated words',
        impact: 'low' as const,
      },
      {
        pattern: /[A-Z]{10,}/g,
        type: 'Excessive capitalization',
        impact: 'medium' as const,
      },
      {
        pattern: /\d{15,}/g,
        type: 'Unusually long number sequence',
        impact: 'high' as const,
      },
    ];

    for (const { pattern, type, impact } of unusualPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        anomalies.push({
          type,
          description: `Found ${matches.length} instance(s) of ${type.toLowerCase()}`,
          confidence: 0.8,
          impact,
        });
      }
    }

    return anomalies;
  }

  private detectStatisticalAnomalies(text: string): IntegrityCheckResult['anomalyDetection']['anomalies'] {
    const anomalies: IntegrityCheckResult['anomalyDetection']['anomalies'] = [];

    // Simple statistical checks
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    if (avgWordLength > 15) {
      anomalies.push({
        type: 'Statistical anomaly',
        description: 'Unusually high average word length',
        confidence: 0.7,
        impact: 'medium',
      });
    }

    // Check sentence length variation
    const sentences = text.split(/[.!?]+/);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

    if (avgSentenceLength > 50) {
      anomalies.push({
        type: 'Readability anomaly',
        description: 'Extremely long average sentence length',
        confidence: 0.8,
        impact: 'medium',
      });
    }

    return anomalies;
  }

  private detectContextualAnomalies(
    text: string,
    context: NonNullable<IntegrityAuditorInput['verticalContext']>
  ): IntegrityCheckResult['anomalyDetection']['anomalies'] {
    const anomalies: IntegrityCheckResult['anomalyDetection']['anomalies'] = [];

    // Check for context-inappropriate content
    const inappropriateContent: Record<string, string[]> = {
      energy: ['medical', 'patient', 'diagnosis'],
      government: ['profit margin', 'shareholder', 'dividend'],
      insurance: ['drilling', 'mineral rights', 'extraction'],
    };

    const vertical = context.vertical.toLowerCase();
    const inappropriate = inappropriateContent[vertical] || [];

    for (const term of inappropriate) {
      if (text.toLowerCase().includes(term)) {
        anomalies.push({
          type: 'Contextual anomaly',
          description: `Term "${term}" unusual for ${vertical} vertical`,
          confidence: 0.6,
          impact: 'low',
        });
      }
    }

    return anomalies;
  }

  private detectBiasAnomalies(text: string): IntegrityCheckResult['anomalyDetection']['anomalies'] {
    const anomalies: IntegrityCheckResult['anomalyDetection']['anomalies'] = [];

    // Check for potential bias indicators
    const biasPatterns = [
      {
        pattern: /\b(always|never|all|none|every|no one)\b/gi,
        type: 'Absolute language bias',
        confidence: 0.7,
      },
      {
        pattern: /\b(obviously|clearly|undoubtedly|certainly)\b/gi,
        type: 'Certainty bias',
        confidence: 0.6,
      },
    ];

    for (const { pattern, type, confidence } of biasPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 3) {
        anomalies.push({
          type,
          description: `Excessive use of biased language (${matches.length} instances)`,
          confidence,
          impact: 'medium',
        });
      }
    }

    return anomalies;
  }

  private calculateIntegrityScore(checkResults: IntegrityCheckResult): number {
    const weights = {
      consistency: 0.25,
      validation: 0.25,
      compliance: 0.3,
      anomalies: 0.2,
    };

    // Calculate component scores
    const consistencyScore = checkResults.dataConsistency.score;
    const validationScore = checkResults.crossValidation.score;
    const complianceScore = checkResults.regulatoryCompliance.compliant ? 100 : 
      Math.max(0, 100 - (checkResults.regulatoryCompliance.violations.filter(v => v.status === 'violation').length * 25));
    
    // Anomaly score decreases with count and severity
    let anomalyScore = 100;
    for (const anomaly of checkResults.anomalyDetection.anomalies) {
      const penalty = anomaly.impact === 'high' ? 20 :
                     anomaly.impact === 'medium' ? 10 : 5;
      anomalyScore -= penalty * anomaly.confidence;
    }
    anomalyScore = Math.max(0, anomalyScore);

    // Calculate weighted average
    const overallScore = 
      consistencyScore * weights.consistency +
      validationScore * weights.validation +
      complianceScore * weights.compliance +
      anomalyScore * weights.anomalies;

    return Math.round(overallScore);
  }

  private generateIntegrityFlags(checkResults: IntegrityCheckResult, score: number): AgentFlag[] {
    const flags: AgentFlag[] = [];

    // Data consistency flags
    if (checkResults.dataConsistency.inconsistencies.length > 0) {
      const severity = checkResults.dataConsistency.inconsistencies.some(i => i.severity === 'high') ? 'high' : 'medium';
      flags.push(this.createFlag(
        severity,
        'data_consistency',
        `Found ${checkResults.dataConsistency.inconsistencies.length} data inconsistencies`,
        { inconsistencies: checkResults.dataConsistency.inconsistencies }
      ));
    }

    // Cross-validation flags
    const invalidValidations = checkResults.crossValidation.validationResults.filter(v => v.status === 'invalid');
    if (invalidValidations.length > 0) {
      flags.push(this.createFlag(
        'high',
        'cross_validation',
        `${invalidValidations.length} validation(s) failed`,
        { failedValidations: invalidValidations }
      ));
    }

    // Compliance flags
    if (!checkResults.regulatoryCompliance.compliant) {
      const violations = checkResults.regulatoryCompliance.violations.filter(v => v.status === 'violation');
      flags.push(this.createFlag(
        'critical',
        'regulatory_compliance',
        `${violations.length} regulatory violation(s) detected`,
        { violations }
      ));
    }

    // Anomaly flags
    if (checkResults.anomalyDetection.anomaliesFound > 0) {
      const highImpactAnomalies = checkResults.anomalyDetection.anomalies.filter(a => a.impact === 'high');
      const severity = highImpactAnomalies.length > 0 ? 'high' : 'medium';
      flags.push(this.createFlag(
        severity,
        'anomaly_detection',
        `${checkResults.anomalyDetection.anomaliesFound} anomalies detected`,
        { anomalies: checkResults.anomalyDetection.anomalies }
      ));
    }

    // Overall integrity score flag
    if (score < 60) {
      flags.push(this.createFlag(
        'critical',
        'overall_integrity',
        `Low integrity score: ${score}/100`,
        { recommendation: 'Comprehensive review required before proceeding' }
      ));
    }

    return flags;
  }

  private identifyDiscrepancies(checkResults: IntegrityCheckResult): string[] {
    const discrepancies: string[] = [];

    // Add data consistency discrepancies
    for (const inconsistency of checkResults.dataConsistency.inconsistencies) {
      discrepancies.push(
        `${inconsistency.field}: Expected "${inconsistency.expected}", found "${inconsistency.actual}"`
      );
    }

    // Add validation discrepancies
    for (const validation of checkResults.crossValidation.validationResults) {
      if (validation.status === 'invalid') {
        discrepancies.push(`Validation failed for ${validation.source}: ${validation.details}`);
      }
    }

    return discrepancies;
  }

  private identifyComplianceIssues(checkResults: IntegrityCheckResult): string[] {
    const issues: string[] = [];

    for (const violation of checkResults.regulatoryCompliance.violations) {
      if (violation.status === 'violation' || violation.status === 'warning') {
        issues.push(
          `${violation.regulation} ${violation.status}: ${violation.requirement} - ${violation.details}`
        );
      }
    }

    return issues;
  }

  private calculateConfidence(checkResults: IntegrityCheckResult): number {
    let confidence = 0.6; // Base confidence

    // Increase confidence based on validation completeness
    const validatedSources = checkResults.crossValidation.validationResults.filter(
      v => v.status !== 'unverified'
    );
    confidence += (validatedSources.length / Math.max(1, checkResults.crossValidation.validationResults.length)) * 0.2;

    // Increase confidence if no major inconsistencies
    if (checkResults.dataConsistency.inconsistencies.filter(i => i.severity === 'high').length === 0) {
      confidence += 0.1;
    }

    // Decrease confidence if many anomalies
    if (checkResults.anomalyDetection.anomaliesFound > 5) {
      confidence -= 0.1;
    }

    return Math.max(0.1, Math.min(1, confidence));
  }
}

// Export a singleton instance
export const integrityAuditor = new IntegrityAuditor();