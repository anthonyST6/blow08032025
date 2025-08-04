import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../agents/base.agent';

export interface AccuracyCheckResult {
  mathematicalValidation: {
    score: number;
    calculations: Array<{
      expression: string;
      expected: number;
      actual: number;
      isCorrect: boolean;
      deviation: number;
    }>;
  };
  dateVerification: {
    score: number;
    dates: Array<{
      dateString: string;
      parsedDate: Date | null;
      isValid: boolean;
      context: string;
      issues: string[];
    }>;
    criticalDeadlines: Array<{
      deadline: Date;
      description: string;
      daysRemaining: number;
      status: 'overdue' | 'urgent' | 'upcoming' | 'safe';
    }>;
  };
  thresholdChecking: {
    score: number;
    thresholds: Array<{
      metric: string;
      value: number;
      threshold: number;
      type: 'min' | 'max';
      status: 'within' | 'exceeded' | 'below';
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  precisionAnalysis: {
    score: number;
    precisionIssues: Array<{
      field: string;
      issue: string;
      recommendation: string;
      impact: 'low' | 'medium' | 'high';
    }>;
  };
}

export interface AccuracyEngineInput extends LLMOutput {
  integrityCheckResults?: any; // Results from Integrity Auditor
  securityCheckResults?: any; // Results from Security Sentinel
  verticalContext?: {
    vertical: string;
    useCase: string;
    thresholds?: Record<string, { min?: number; max?: number }>;
  };
  referenceData?: {
    calculations?: Array<{ expression: string; expectedResult: number }>;
    dates?: Array<{ field: string; expectedFormat: string }>;
    precision?: Array<{ field: string; requiredDecimals: number }>;
  };
}

export interface AccuracyEngineOutput extends AgentResult {
  accuracyScore: number;
  errorsCorrected: string[];
  criticalDeadlines: Array<{
    deadline: Date;
    description: string;
    daysRemaining: number;
    status: string;
  }>;
  checkResults: AccuracyCheckResult;
}

export class AccuracyEngine extends VanguardAgent {
  constructor() {
    super(
      'accuracy-engine',
      'Accuracy Engine',
      '1.0.0',
      'Validates calculations, checks dates/deadlines, ensures data accuracy',
      {
        thresholds: {
          low: 90,
          medium: 75,
          high: 60,
          critical: 40,
        },
      }
    );
  }

  async analyze(input: AccuracyEngineInput): Promise<AccuracyEngineOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting accuracy analysis', {
      promptId: input.promptId,
      hasIntegrityResults: !!input.integrityCheckResults,
      hasSecurityResults: !!input.securityCheckResults,
      vertical: input.verticalContext?.vertical,
      hasReferenceData: !!input.referenceData,
    });

    try {
      this.validateInput(input);

      // Perform accuracy checks
      const checkResults = await this.performAccuracyChecks(input);
      
      // Calculate overall accuracy score
      const accuracyScore = this.calculateAccuracyScore(checkResults);
      
      // Generate flags based on findings
      const flags = this.generateAccuracyFlags(checkResults, accuracyScore);
      
      // Identify errors that were corrected
      const errorsCorrected = this.identifyErrorsCorrected(checkResults);
      
      // Extract critical deadlines
      const criticalDeadlines = checkResults.dateVerification.criticalDeadlines.map(d => ({
        deadline: d.deadline,
        description: d.description,
        daysRemaining: d.daysRemaining,
        status: d.status,
      }));

      // Create the result
      const result: AccuracyEngineOutput = {
        ...this.createResult(
          accuracyScore,
          flags,
          {
            checkResults,
            verticalContext: input.verticalContext,
            integrityCheckResults: input.integrityCheckResults,
            securityCheckResults: input.securityCheckResults,
            referenceDataProvided: !!input.referenceData,
          },
          this.calculateConfidence(checkResults),
          startTime
        ),
        accuracyScore,
        errorsCorrected,
        criticalDeadlines,
        checkResults,
      };

      this.log('info', 'Accuracy analysis completed', {
        score: accuracyScore,
        errorsCount: errorsCorrected.length,
        criticalDeadlinesCount: criticalDeadlines.length,
        processingTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.log('error', 'Accuracy analysis failed', { error });
      throw error;
    }
  }

  private async performAccuracyChecks(input: AccuracyEngineInput): Promise<AccuracyCheckResult> {
    const mathematicalValidation = await this.validateMathematics(input);
    const dateVerification = await this.verifyDates(input);
    const thresholdChecking = await this.checkThresholds(input);
    const precisionAnalysis = await this.analyzePrecision(input);

    return {
      mathematicalValidation,
      dateVerification,
      thresholdChecking,
      precisionAnalysis,
    };
  }

  private async validateMathematics(input: AccuracyEngineInput): Promise<AccuracyCheckResult['mathematicalValidation']> {
    const calculations: AccuracyCheckResult['mathematicalValidation']['calculations'] = [];
    let score = 100;

    // Extract mathematical expressions from text
    const mathExpressions = this.extractMathExpressions(input.text);

    for (const expr of mathExpressions) {
      try {
        const result = this.evaluateMathExpression(expr);
        const expected = this.findExpectedResult(expr, input);
        
        const isCorrect = Math.abs(result - expected) < 0.01; // Allow small floating point differences
        const deviation = Math.abs(result - expected);

        calculations.push({
          expression: expr,
          expected,
          actual: result,
          isCorrect,
          deviation,
        });

        if (!isCorrect) {
          score -= deviation > 10 ? 20 : deviation > 1 ? 10 : 5;
        }
      } catch (error) {
        calculations.push({
          expression: expr,
          expected: 0,
          actual: 0,
          isCorrect: false,
          deviation: Infinity,
        });
        score -= 15;
      }
    }

    // Check reference calculations if provided
    if (input.referenceData?.calculations) {
      for (const refCalc of input.referenceData.calculations) {
        const found = calculations.find(c => c.expression === refCalc.expression);
        if (!found) {
          calculations.push({
            expression: refCalc.expression,
            expected: refCalc.expectedResult,
            actual: 0,
            isCorrect: false,
            deviation: refCalc.expectedResult,
          });
          score -= 10;
        }
      }
    }

    return {
      score: Math.max(0, score),
      calculations,
    };
  }

  private async verifyDates(input: AccuracyEngineInput): Promise<AccuracyCheckResult['dateVerification']> {
    const dates: AccuracyCheckResult['dateVerification']['dates'] = [];
    const criticalDeadlines: AccuracyCheckResult['dateVerification']['criticalDeadlines'] = [];
    let score = 100;

    // Extract dates from text
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
    ];

    const foundDates = new Set<string>();
    const now = new Date();

    for (const pattern of datePatterns) {
      const matches = input.text.matchAll(pattern);
      for (const match of matches) {
        const dateString = match[0];
        if (!foundDates.has(dateString)) {
          foundDates.add(dateString);
          
          const parsedDate = this.parseDate(dateString);
          const issues: string[] = [];
          let isValid = true;

          if (!parsedDate) {
            issues.push('Unable to parse date');
            isValid = false;
            score -= 10;
          } else {
            // Validate date logic
            const validation = this.validateDateLogic(parsedDate, dateString, input.text);
            issues.push(...validation.issues);
            if (validation.issues.length > 0) {
              isValid = false;
              score -= 5 * validation.issues.length;
            }

            // Check if it's a deadline
            if (this.isDeadline(dateString, input.text)) {
              const daysRemaining = Math.floor((parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const status = daysRemaining < 0 ? 'overdue' :
                           daysRemaining <= 7 ? 'urgent' :
                           daysRemaining <= 30 ? 'upcoming' : 'safe';
              
              criticalDeadlines.push({
                deadline: parsedDate,
                description: this.extractDeadlineContext(dateString, input.text),
                daysRemaining,
                status,
              });

              if (status === 'overdue') {
                score -= 20;
              } else if (status === 'urgent') {
                score -= 10;
              }
            }
          }

          dates.push({
            dateString,
            parsedDate,
            isValid,
            context: this.extractDateContext(dateString, input.text),
            issues,
          });
        }
      }
    }

    return {
      score: Math.max(0, score),
      dates: Array.from(dates),
      criticalDeadlines,
    };
  }

  private async checkThresholds(input: AccuracyEngineInput): Promise<AccuracyCheckResult['thresholdChecking']> {
    const thresholds: AccuracyCheckResult['thresholdChecking']['thresholds'] = [];
    let score = 100;

    // Extract numeric values with context
    const numericValues = this.extractNumericValues(input.text);

    // Check against vertical-specific thresholds
    if (input.verticalContext?.thresholds) {
      for (const [metric, limits] of Object.entries(input.verticalContext.thresholds)) {
        const value = numericValues.find(v => v.context.toLowerCase().includes(metric.toLowerCase()));
        
        if (value) {
          if (limits.min !== undefined && value.value < limits.min) {
            thresholds.push({
              metric,
              value: value.value,
              threshold: limits.min,
              type: 'min',
              status: 'below',
              severity: this.calculateThresholdSeverity(value.value, limits.min, 'min'),
            });
            score -= 15;
          }
          
          if (limits.max !== undefined && value.value > limits.max) {
            thresholds.push({
              metric,
              value: value.value,
              threshold: limits.max,
              type: 'max',
              status: 'exceeded',
              severity: this.calculateThresholdSeverity(value.value, limits.max, 'max'),
            });
            score -= 15;
          }
        }
      }
    }

    // Check for common threshold violations
    const commonThresholds = this.checkCommonThresholds(numericValues, input.verticalContext?.vertical);
    thresholds.push(...commonThresholds.violations);
    score -= commonThresholds.penaltyPoints;

    return {
      score: Math.max(0, score),
      thresholds,
    };
  }

  private async analyzePrecision(input: AccuracyEngineInput): Promise<AccuracyCheckResult['precisionAnalysis']> {
    const precisionIssues: AccuracyCheckResult['precisionAnalysis']['precisionIssues'] = [];
    let score = 100;

    // Check decimal precision
    const decimalNumbers = this.extractDecimalNumbers(input.text);
    
    for (const { context, decimals } of decimalNumbers) {
      const requiredPrecision = this.getRequiredPrecision(context, input);
      
      if (decimals < requiredPrecision.min) {
        precisionIssues.push({
          field: context,
          issue: `Insufficient precision: ${decimals} decimals provided, ${requiredPrecision.min} required`,
          recommendation: `Use at least ${requiredPrecision.min} decimal places for ${context}`,
          impact: requiredPrecision.impact,
        });
        score -= requiredPrecision.impact === 'high' ? 15 : 
                requiredPrecision.impact === 'medium' ? 10 : 5;
      } else if (decimals > requiredPrecision.max) {
        precisionIssues.push({
          field: context,
          issue: `Excessive precision: ${decimals} decimals provided, ${requiredPrecision.max} maximum recommended`,
          recommendation: `Limit to ${requiredPrecision.max} decimal places for ${context}`,
          impact: 'low',
        });
        score -= 3;
      }
    }

    // Check for rounding errors
    const roundingErrors = this.detectRoundingErrors(input.text);
    for (const error of roundingErrors) {
      precisionIssues.push({
        field: error.field,
        issue: `Potential rounding error detected: ${error.description}`,
        recommendation: 'Verify calculation and rounding methodology',
        impact: 'medium',
      });
      score -= 10;
    }

    // Check unit consistency
    const unitIssues = this.checkUnitConsistency(input.text);
    for (const issue of unitIssues) {
      precisionIssues.push({
        field: issue.field,
        issue: `Unit inconsistency: ${issue.description}`,
        recommendation: issue.recommendation,
        impact: issue.impact,
      });
      score -= issue.impact === 'high' ? 20 : 10;
    }

    return {
      score: Math.max(0, score),
      precisionIssues,
    };
  }

  private extractMathExpressions(text: string): string[] {
    const expressions: string[] = [];
    
    // Pattern for basic arithmetic expressions
    const patterns = [
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/g,
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/g,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        expressions.push(match[0]);
      }
    }

    return expressions;
  }

  private evaluateMathExpression(expr: string): number {
    // Simple evaluation for basic arithmetic
    // In production, use a proper math parser
    try {
      // Remove equals sign and everything after it
      const cleanExpr = expr.split('=')[0].trim();
      
      // Basic safety check - only allow numbers and basic operators
      if (!/^[\d\s+\-*/().]+$/.test(cleanExpr)) {
        throw new Error('Invalid expression');
      }

      // Use Function constructor for safe evaluation
      return new Function('return ' + cleanExpr)();
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${expr}`);
    }
  }

  private findExpectedResult(expr: string, input: AccuracyEngineInput): number {
    // Check if expression has an equals sign with result
    const parts = expr.split('=');
    if (parts.length === 2) {
      return parseFloat(parts[1].trim());
    }

    // Check reference data
    if (input.referenceData?.calculations) {
      const ref = input.referenceData.calculations.find(c => c.expression === expr);
      if (ref) {
        return ref.expectedResult;
      }
    }

    // Calculate it ourselves
    return this.evaluateMathExpression(expr);
  }

  private parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try alternative parsing for different formats
      // Handle "January 1, 2024" format
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      for (let i = 0; i < monthNames.length; i++) {
        if (dateString.includes(monthNames[i])) {
          const parts = dateString.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
          if (parts) {
            return new Date(parseInt(parts[3]), i, parseInt(parts[2]));
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private validateDateLogic(date: Date, dateString: string, fullText: string): { issues: string[] } {
    const issues: string[] = [];
    const now = new Date();

    // Check if date is unreasonably far in the past
    const yearsDiff = now.getFullYear() - date.getFullYear();
    if (yearsDiff > 100) {
      issues.push('Date is more than 100 years in the past');
    }

    // Check if date is unreasonably far in the future
    if (date.getFullYear() - now.getFullYear() > 50) {
      issues.push('Date is more than 50 years in the future');
    }

    // Check for impossible dates (e.g., February 30)
    const testDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (testDate.getMonth() !== date.getMonth()) {
      issues.push('Invalid date (day does not exist in month)');
    }

    // Context-specific validation
    const context = this.extractDateContext(dateString, fullText).toLowerCase();
    
    if (context.includes('birth') && date > now) {
      issues.push('Birth date cannot be in the future');
    }
    
    if (context.includes('expir') && date < now) {
      issues.push('Expired date detected');
    }

    return { issues };
  }

  private isDeadline(dateString: string, fullText: string): boolean {
    const context = this.extractDateContext(dateString, fullText).toLowerCase();
    const deadlineKeywords = ['deadline', 'due', 'expires', 'expiration', 'by', 'before', 'until', 'cutoff'];
    
    return deadlineKeywords.some(keyword => context.includes(keyword));
  }

  private extractDateContext(dateString: string, fullText: string, contextLength: number = 50): string {
    const index = fullText.indexOf(dateString);
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(fullText.length, index + dateString.length + contextLength);
    
    return fullText.substring(start, end);
  }

  private extractDeadlineContext(dateString: string, fullText: string): string {
    const context = this.extractDateContext(dateString, fullText, 100);
    
    // Try to extract a meaningful description
    const sentences = context.split(/[.!?]/);
    for (const sentence of sentences) {
      if (sentence.includes(dateString)) {
        return sentence.trim();
      }
    }
    
    return context.trim();
  }

  private extractNumericValues(text: string): Array<{ value: number; context: string }> {
    const values: Array<{ value: number; context: string }> = [];
    
    // Pattern for numbers with optional units
    const pattern = /(\d+(?:\.\d+)?)\s*(%|dollars?|USD|\$|miles?|km|kg|lbs?|hours?|days?|years?|months?)?/gi;
    const matches = text.matchAll(pattern);
    
    for (const match of matches) {
      const value = parseFloat(match[1]);
      const context = this.extractDateContext(match[0], text, 30);
      values.push({ value, context });
    }
    
    return values;
  }

  private calculateThresholdSeverity(value: number, threshold: number, type: 'min' | 'max'): 'low' | 'medium' | 'high' {
    const deviation = type === 'min' ? 
      (threshold - value) / threshold : 
      (value - threshold) / threshold;
    
    const percentDeviation = Math.abs(deviation * 100);
    
    if (percentDeviation > 50) return 'high';
    if (percentDeviation > 20) return 'medium';
    return 'low';
  }

  private checkCommonThresholds(
    values: Array<{ value: number; context: string }>,
    vertical?: string
  ): { violations: AccuracyCheckResult['thresholdChecking']['thresholds']; penaltyPoints: number } {
    const violations: AccuracyCheckResult['thresholdChecking']['thresholds'] = [];
    let penaltyPoints = 0;

    // Check percentages
    const percentages = values.filter(v => v.context.includes('%'));
    for (const pct of percentages) {
      if (pct.value > 100) {
        violations.push({
          metric: 'percentage',
          value: pct.value,
          threshold: 100,
          type: 'max',
          status: 'exceeded',
          severity: 'high',
        });
        penaltyPoints += 20;
      }
      if (pct.value < 0) {
        violations.push({
          metric: 'percentage',
          value: pct.value,
          threshold: 0,
          type: 'min',
          status: 'below',
          severity: 'high',
        });
        penaltyPoints += 20;
      }
    }

    // Vertical-specific thresholds
    if (vertical) {
      switch (vertical.toLowerCase()) {
        case 'energy':
          // Check oil price thresholds
          const oilPrices = values.filter(v => v.context.toLowerCase().includes('oil') && v.context.includes('$'));
          for (const price of oilPrices) {
            if (price.value > 200) {
              violations.push({
                metric: 'oil_price',
                value: price.value,
                threshold: 200,
                type: 'max',
                status: 'exceeded',
                severity: 'medium',
              });
              penaltyPoints += 10;
            }
          }
          break;
          
        case 'insurance':
          // Check deductible thresholds
          const deductibles = values.filter(v => v.context.toLowerCase().includes('deductible'));
          for (const deductible of deductibles) {
            if (deductible.value > 50000) {
              violations.push({
                metric: 'deductible',
                value: deductible.value,
                threshold: 50000,
                type: 'max',
                status: 'exceeded',
                severity: 'medium',
              });
              penaltyPoints += 10;
            }
          }
          break;
      }
    }

    return { violations, penaltyPoints };
  }

  private extractDecimalNumbers(text: string): Array<{ value: number; context: string; decimals: number }> {
    const numbers: Array<{ value: number; context: string; decimals: number }> = [];
    
    const pattern = /(\d+\.(\d+))/g;
    const matches = text.matchAll(pattern);
    
    for (const match of matches) {
      const value = parseFloat(match[1]);
      const decimals = match[2].length;
      const context = this.extractDateContext(match[0], text, 30);
      numbers.push({ value, context, decimals });
    }
    
    return numbers;
  }

  private getRequiredPrecision(
    context: string,
    input: AccuracyEngineInput
  ): { min: number; max: number; impact: 'low' | 'medium' | 'high' } {
    const lowerContext = context.toLowerCase();

    // Check reference data first
    if (input.referenceData?.precision) {
      for (const ref of input.referenceData.precision) {
        if (lowerContext.includes(ref.field.toLowerCase())) {
          return { min: ref.requiredDecimals, max: ref.requiredDecimals + 2, impact: 'high' };
        }
      }
    }

    // Common precision requirements
    if (lowerContext.includes('price') || lowerContext.includes('$') || lowerContext.includes('dollar')) {
      return { min: 2, max: 2, impact: 'high' };
    }
    
    if (lowerContext.includes('percentage') || lowerContext.includes('%')) {
      return { min: 1, max: 2, impact: 'medium' };
    }
    
    if (lowerContext.includes('coordinate') || lowerContext.includes('latitude') || lowerContext.includes('longitude')) {
      return { min: 6, max: 8, impact: 'high' };
    }
    
    if (lowerContext.includes('weight') || lowerContext.includes('mass')) {
      return { min: 1, max: 3, impact: 'medium' };
    }

    // Default
    return { min: 0, max: 4, impact: 'low' };
  }

  private detectRoundingErrors(text: string): Array<{ field: string; description: string }> {
    const errors: Array<{ field: string; description: string }> = [];
    
    // Check for calculations that don't add up due to rounding
    const calculations = this.extractMathExpressions(text);
    
    for (const calc of calculations) {
      if (calc.includes('=')) {
        const parts = calc.split('=');
        const leftSide = this.evaluateMathExpression(parts[0]);
        const rightSide = parseFloat(parts[1].trim());
        
        const difference = Math.abs(leftSide - rightSide);
        if (difference > 0.01 && difference < 1) {
          errors.push({
            field: 'calculation',
            description: `${calc} - difference of ${difference.toFixed(4)}`,
          });
        }
      }
    }
    
    return errors;
  }

  private checkUnitConsistency(text: string): Array<{
    field: string;
    description: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high'
  }> {
    const issues: Array<{ field: string; description: string; recommendation: string; impact: 'low' | 'medium' | 'high' }> = [];
    
    // Check for mixed units
    const units = {
      distance: {
        metric: /\d+\s*(km|kilometers?|m|meters?)\b/gi,
        imperial: /\d+\s*(miles?|feet|ft|yards?|yd)\b/gi,
      },
      weight: {
        metric: /\d+\s*(kg|kilograms?|g|grams?)\b/gi,
        imperial: /\d+\s*(lbs?|pounds?|oz|ounces?)\b/gi,
      },
      temperature: {
        celsius: /\d+\s*°?C\b/gi,
        fahrenheit: /\d+\s*°?F\b/gi,
      },
    };

    for (const [category, patterns] of Object.entries(units)) {
      let metricMatches: RegExpMatchArray | null = null;
      let imperialMatches: RegExpMatchArray | null = null;

      if (category === 'temperature') {
        metricMatches = text.match((patterns as any).celsius);
        imperialMatches = text.match((patterns as any).fahrenheit);
      } else {
        metricMatches = text.match((patterns as any).metric);
        imperialMatches = text.match((patterns as any).imperial);
      }
      
      if (metricMatches && metricMatches.length > 0 && imperialMatches && imperialMatches.length > 0) {
        issues.push({
          field: category,
          description: `Mixed ${category} units detected (both metric and imperial)`,
          recommendation: `Use consistent ${category} units throughout the document`,
          impact: 'medium',
        });
      }
    }
    
    return issues;
  }

  private calculateAccuracyScore(checkResults: AccuracyCheckResult): number {
    const weights = {
      mathematical: 0.3,
      dates: 0.25,
      thresholds: 0.25,
      precision: 0.2,
    };

    // Calculate component scores
    const mathScore = checkResults.mathematicalValidation.score;
    const dateScore = checkResults.dateVerification.score;
    const thresholdScore = checkResults.thresholdChecking.score;
    const precisionScore = checkResults.precisionAnalysis.score;

    // Calculate weighted average
    const overallScore = 
      mathScore * weights.mathematical +
      dateScore * weights.dates +
      thresholdScore * weights.thresholds +
      precisionScore * weights.precision;

    return Math.round(overallScore);
  }

  private generateAccuracyFlags(checkResults: AccuracyCheckResult, score: number): AgentFlag[] {
    const flags: AgentFlag[] = [];

    // Mathematical validation flags
    const incorrectCalcs = checkResults.mathematicalValidation.calculations.filter(c => !c.isCorrect);
    if (incorrectCalcs.length > 0) {
      flags.push(this.createFlag(
        'high',
        'mathematical_accuracy',
        `${incorrectCalcs.length} incorrect calculation(s) detected`,
        { calculations: incorrectCalcs }
      ));
    }

    // Date verification flags
    const invalidDates = checkResults.dateVerification.dates.filter(d => !d.isValid);
    if (invalidDates.length > 0) {
      flags.push(this.createFlag(
        'medium',
        'date_accuracy',
        `${invalidDates.length} invalid date(s) detected`,
        { dates: invalidDates }
      ));
    }

    // Critical deadlines flags
    const overdueDeadlines = checkResults.dateVerification.criticalDeadlines.filter(d => d.status === 'overdue');
    if (overdueDeadlines.length > 0) {
      flags.push(this.createFlag(
        'critical',
        'deadline_accuracy',
        `${overdueDeadlines.length} overdue deadline(s) detected`,
        { deadlines: overdueDeadlines }
      ));
    }

    // Threshold violation flags
    const thresholdViolations = checkResults.thresholdChecking.thresholds.filter(t => t.status !== 'within');
    if (thresholdViolations.length > 0) {
      const criticalViolations = thresholdViolations.filter(t => t.severity === 'high');
      flags.push(this.createFlag(
        criticalViolations.length > 0 ? 'high' : 'medium',
        'threshold_accuracy',
        `${thresholdViolations.length} threshold violation(s) detected`,
        { violations: thresholdViolations }
      ));
    }

    // Precision issue flags
    const highImpactPrecisionIssues = checkResults.precisionAnalysis.precisionIssues.filter(p => p.impact === 'high');
    if (highImpactPrecisionIssues.length > 0) {
      flags.push(this.createFlag(
        'high',
        'precision_accuracy',
        `${highImpactPrecisionIssues.length} high-impact precision issue(s) detected`,
        { issues: highImpactPrecisionIssues }
      ));
    }

    // Overall accuracy score flag
    if (score < 70) {
      flags.push(this.createFlag(
        score < 50 ? 'critical' : 'high',
        'overall_accuracy',
        `Low accuracy score: ${score}/100`,
        { recommendation: 'Thorough review and correction required' }
      ));
    }

    return flags;
  }

  private identifyErrorsCorrected(checkResults: AccuracyCheckResult): string[] {
    const errors: string[] = [];

    // Mathematical errors
    for (const calc of checkResults.mathematicalValidation.calculations) {
      if (!calc.isCorrect) {
        errors.push(`Calculation error: ${calc.expression} should equal ${calc.expected}, not ${calc.actual}`);
      }
    }

    // Date errors
    for (const date of checkResults.dateVerification.dates) {
      if (!date.isValid && date.issues.length > 0) {
        errors.push(`Date error in "${date.dateString}": ${date.issues.join(', ')}`);
      }
    }

    // Threshold errors
    for (const threshold of checkResults.thresholdChecking.thresholds) {
      if (threshold.status !== 'within') {
        errors.push(
          `Threshold error: ${threshold.metric} value ${threshold.value} ${threshold.status} ${threshold.type} limit of ${threshold.threshold}`
        );
      }
    }

    // Precision errors
    for (const precision of checkResults.precisionAnalysis.precisionIssues) {
      if (precision.impact === 'high') {
        errors.push(`Precision error in ${precision.field}: ${precision.issue}`);
      }
    }

    return errors;
  }

  private calculateConfidence(checkResults: AccuracyCheckResult): number {
    let confidence = 0.7; // Base confidence for accuracy checks

    // Increase confidence if calculations are correct
    const correctCalcs = checkResults.mathematicalValidation.calculations.filter(c => c.isCorrect);
    if (checkResults.mathematicalValidation.calculations.length > 0) {
      confidence += (correctCalcs.length / checkResults.mathematicalValidation.calculations.length) * 0.1;
    }

    // Increase confidence if dates are valid
    const validDates = checkResults.dateVerification.dates.filter(d => d.isValid);
    if (checkResults.dateVerification.dates.length > 0) {
      confidence += (validDates.length / checkResults.dateVerification.dates.length) * 0.1;
    }

    // Decrease confidence if many precision issues
    if (checkResults.precisionAnalysis.precisionIssues.length > 5) {
      confidence -= 0.1;
    }

    // Decrease confidence if critical deadlines are overdue
    if (checkResults.dateVerification.criticalDeadlines.some(d => d.status === 'overdue')) {
      confidence -= 0.05;
    }

    return Math.max(0.1, Math.min(1, confidence));
  }
}

// Export a singleton instance
export const accuracyEngine = new AccuracyEngine();