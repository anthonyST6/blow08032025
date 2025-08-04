import { VanguardAgent, LLMOutput, AgentResult, AgentFlag } from './base.agent';

export class AccuracyAgent extends VanguardAgent {
  constructor() {
    super(
      'accuracy-agent',
      'Accuracy Score Agent',
      '1.0.0',
      'Evaluates the factual accuracy of LLM outputs by comparing against known facts and data sources',
      {
        customSettings: {
          factCheckApiUrl: process.env.FACT_CHECK_API_URL,
          confidenceThreshold: 0.7,
        },
      }
    );
  }

  async analyze(input: LLMOutput): Promise<AgentResult> {
    const startTime = Date.now();
    this.validateInput(input);

    try {
      const flags: AgentFlag[] = [];
      let accuracyScore = 100; // Start with perfect score
      let confidence = 1.0;

      // Extract claims from the text
      const claims = this.extractClaims(input.text);
      
      // Check for numerical accuracy
      const numericalErrors = this.checkNumericalAccuracy(input.text);
      if (numericalErrors.length > 0) {
        accuracyScore -= numericalErrors.length * 10;
        numericalErrors.forEach(error => {
          flags.push(this.createFlag(
            'medium',
            'numerical_error',
            `Potential numerical error detected: ${error}`,
            { error }
          ));
        });
      }

      // Check for date/time accuracy
      const dateErrors = this.checkDateAccuracy(input.text);
      if (dateErrors.length > 0) {
        accuracyScore -= dateErrors.length * 5;
        dateErrors.forEach(error => {
          flags.push(this.createFlag(
            'low',
            'date_error',
            `Potential date/time error: ${error}`,
            { error }
          ));
        });
      }

      // Check for contradictions within the text
      const contradictions = this.findContradictions(input.text);
      if (contradictions.length > 0) {
        accuracyScore -= contradictions.length * 15;
        confidence *= 0.8;
        contradictions.forEach(contradiction => {
          flags.push(this.createFlag(
            'high',
            'contradiction',
            `Internal contradiction detected: ${contradiction}`,
            { contradiction }
          ));
        });
      }

      // Check against known facts (if API is available)
      if (this.config.customSettings?.factCheckApiUrl && claims.length > 0) {
        const factCheckResults = await this.checkFactsAgainstAPI(claims);
        factCheckResults.forEach(result => {
          if (!result.accurate) {
            accuracyScore -= 20;
            confidence *= 0.9;
            flags.push(this.createFlag(
              'high',
              'factual_error',
              `Factual error: ${result.claim}`,
              { claim: result.claim, correction: result.correction }
            ));
          }
        });
      }

      // Ensure score doesn't go below 0
      accuracyScore = Math.max(0, accuracyScore);

      // Add severity flag based on final score
      if (accuracyScore < 50) {
        flags.push(this.createFlag(
          'critical',
          'low_accuracy',
          'Overall accuracy score is critically low',
          { score: accuracyScore }
        ));
      }

      return this.createResult(
        accuracyScore,
        flags,
        {
          claimsAnalyzed: claims.length,
          numericalErrorsFound: numericalErrors.length,
          dateErrorsFound: dateErrors.length,
          contradictionsFound: contradictions.length,
        },
        confidence,
        startTime
      );
    } catch (error) {
      this.log('error', 'Error during accuracy analysis', { error });
      throw error;
    }
  }

  private extractClaims(text: string): string[] {
    // Simple claim extraction - in production, use NLP
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Filter for sentences that appear to make factual claims
    return sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes(' is ') ||
        lower.includes(' are ') ||
        lower.includes(' was ') ||
        lower.includes(' were ') ||
        lower.includes(' has ') ||
        lower.includes(' have ') ||
        /\d+/.test(sentence) // Contains numbers
      );
    });
  }

  private checkNumericalAccuracy(text: string): string[] {
    const errors: string[] = [];
    
    // Check for basic mathematical errors
    const mathExpressions = text.match(/\d+\s*[+\-*/]\s*\d+\s*=\s*\d+/g) || [];
    
    mathExpressions.forEach(expr => {
      try {
        const parts = expr.split('=');
        const calculation = parts[0].trim();
        const result = parts[1].trim();
        
        // Simple evaluation (in production, use a proper math parser)
        const actualResult = eval(calculation);
        if (Math.abs(actualResult - parseFloat(result)) > 0.01) {
          errors.push(expr);
        }
      } catch (e) {
        // Skip if can't evaluate
      }
    });

    return errors;
  }

  private checkDateAccuracy(text: string): string[] {
    const errors: string[] = [];
    
    // Check for impossible dates
    const datePatterns = [
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, // MM/DD/YYYY
      /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,   // YYYY-MM-DD
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(dateStr => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push(dateStr);
        }
      });
    });

    return errors;
  }

  private findContradictions(text: string): string[] {
    const contradictions: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple contradiction detection
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        if (this.areContradictory(sentences[i], sentences[j])) {
          contradictions.push(`"${sentences[i].trim()}" contradicts "${sentences[j].trim()}"`);
        }
      }
    }

    return contradictions;
  }

  private areContradictory(sentence1: string, sentence2: string): boolean {
    // Simple contradiction detection - in production, use NLP
    const s1Lower = sentence1.toLowerCase();
    const s2Lower = sentence2.toLowerCase();
    
    // Check for direct negation
    if (
      (s1Lower.includes('not') && !s2Lower.includes('not') && this.haveSimilarContent(s1Lower, s2Lower)) ||
      (!s1Lower.includes('not') && s2Lower.includes('not') && this.haveSimilarContent(s1Lower, s2Lower))
    ) {
      return true;
    }

    // Check for opposing statements
    const opposites = [
      ['increase', 'decrease'],
      ['rise', 'fall'],
      ['grow', 'shrink'],
      ['positive', 'negative'],
      ['true', 'false'],
    ];

    for (const [word1, word2] of opposites) {
      if (
        (s1Lower.includes(word1) && s2Lower.includes(word2)) ||
        (s1Lower.includes(word2) && s2Lower.includes(word1))
      ) {
        return this.haveSimilarContent(s1Lower, s2Lower);
      }
    }

    return false;
  }

  private haveSimilarContent(s1: string, s2: string): boolean {
    // Check if sentences discuss similar topics
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    const commonWords = words1.filter(w => 
      words2.includes(w) && w.length > 3 && !['the', 'and', 'but', 'for'].includes(w)
    );
    
    return commonWords.length >= 2;
  }

  private async checkFactsAgainstAPI(claims: string[]): Promise<Array<{
    claim: string;
    accurate: boolean;
    correction?: string;
  }>> {
    // Placeholder for external fact-checking API
    // In production, integrate with real fact-checking services
    try {
      if (!this.config.customSettings?.factCheckApiUrl) {
        return [];
      }

      // Mock implementation
      return claims.map(claim => ({
        claim,
        accurate: Math.random() > 0.3, // 70% accuracy for demo
        correction: Math.random() > 0.7 ? 'Corrected fact here' : undefined,
      }));
    } catch (error) {
      this.log('warn', 'Fact-checking API unavailable', { error });
      return [];
    }
  }
}