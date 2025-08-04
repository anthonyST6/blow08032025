import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../agents/base.agent';

export interface SecurityCheckResult {
  documentAuthenticity: {
    score: number;
    issues: string[];
  };
  digitalSignatures: {
    valid: boolean;
    signatures: Array<{
      signer: string;
      timestamp: Date;
      valid: boolean;
    }>;
  };
  dataIntegrity: {
    score: number;
    alteredSections: string[];
  };
  threatDetection: {
    threatsFound: number;
    threats: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
  };
}

export interface SecuritySentinelInput extends LLMOutput {
  documentMetadata?: {
    source?: string;
    uploadedBy?: string;
    timestamp?: Date;
    hash?: string;
  };
  verticalContext?: {
    vertical: string;
    useCase: string;
    regulations?: string[];
  };
}

export interface SecuritySentinelOutput extends AgentResult {
  securityScore: number;
  flaggedDocuments: string[];
  securityRecommendations: string[];
  checkResults: SecurityCheckResult;
}

export class SecuritySentinel extends VanguardAgent {
  constructor() {
    super(
      'security-sentinel',
      'Security Sentinel',
      '1.0.0',
      'First line of defense - validates document authenticity, checks digital signatures, identifies altered documents',
      {
        thresholds: {
          low: 80,
          medium: 60,
          high: 40,
          critical: 20,
        },
      }
    );
  }

  async analyze(input: SecuritySentinelInput): Promise<SecuritySentinelOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting security analysis', { 
      promptId: input.promptId,
      hasMetadata: !!input.documentMetadata,
      vertical: input.verticalContext?.vertical 
    });

    try {
      this.validateInput(input);

      // Perform security checks
      const checkResults = await this.performSecurityChecks(input);
      
      // Calculate overall security score
      const securityScore = this.calculateSecurityScore(checkResults);
      
      // Generate flags based on findings
      const flags = this.generateSecurityFlags(checkResults, securityScore);
      
      // Identify flagged documents
      const flaggedDocuments = this.identifyFlaggedDocuments(checkResults, input);
      
      // Generate security recommendations
      const securityRecommendations = this.generateRecommendations(checkResults, securityScore);

      // Create the result
      const result: SecuritySentinelOutput = {
        ...this.createResult(
          securityScore,
          flags,
          {
            checkResults,
            verticalContext: input.verticalContext,
            documentMetadata: input.documentMetadata,
          },
          this.calculateConfidence(checkResults),
          startTime
        ),
        securityScore,
        flaggedDocuments,
        securityRecommendations,
        checkResults,
      };

      this.log('info', 'Security analysis completed', {
        score: securityScore,
        flagCount: flags.length,
        processingTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.log('error', 'Security analysis failed', { error });
      throw error;
    }
  }

  private async performSecurityChecks(input: SecuritySentinelInput): Promise<SecurityCheckResult> {
    // In a real implementation, these would call actual security services
    // For now, we'll simulate the checks based on the input

    const documentAuthenticity = await this.checkDocumentAuthenticity(input);
    const digitalSignatures = await this.checkDigitalSignatures(input);
    const dataIntegrity = await this.checkDataIntegrity(input);
    const threatDetection = await this.detectThreats(input);

    return {
      documentAuthenticity,
      digitalSignatures,
      dataIntegrity,
      threatDetection,
    };
  }

  private async checkDocumentAuthenticity(input: SecuritySentinelInput): Promise<SecurityCheckResult['documentAuthenticity']> {
    const issues: string[] = [];
    let score = 100;

    // Check for suspicious patterns in the text
    const suspiciousPatterns = [
      /\b(fake|forged|altered|modified)\b/gi,
      /\b(unauthorized|illegal|fraudulent)\b/gi,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input.text)) {
        issues.push(`Suspicious pattern detected: ${pattern.source}`);
        score -= 20;
      }
    }

    // Check metadata consistency
    if (input.documentMetadata) {
      if (!input.documentMetadata.source) {
        issues.push('Missing document source');
        score -= 10;
      }
      if (!input.documentMetadata.hash) {
        issues.push('Missing document hash for integrity verification');
        score -= 15;
      }
    } else {
      issues.push('No document metadata provided');
      score -= 25;
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  private async checkDigitalSignatures(input: SecuritySentinelInput): Promise<SecurityCheckResult['digitalSignatures']> {
    // Simulate digital signature verification
    const signatures = [];

    if (input.documentMetadata?.uploadedBy) {
      signatures.push({
        signer: input.documentMetadata.uploadedBy,
        timestamp: input.documentMetadata.timestamp || new Date(),
        valid: true, // In real implementation, would verify actual signature
      });
    }

    return {
      valid: signatures.length > 0 && signatures.every(sig => sig.valid),
      signatures,
    };
  }

  private async checkDataIntegrity(input: SecuritySentinelInput): Promise<SecurityCheckResult['dataIntegrity']> {
    const alteredSections: string[] = [];
    let score = 100;

    // Check for inconsistencies in the text
    const lines = input.text.split('\n');
    const inconsistencyPatterns = [
      /\[REDACTED\]/g,
      /\[MODIFIED\]/g,
      /\[DELETED\]/g,
    ];

    lines.forEach((line, index) => {
      for (const pattern of inconsistencyPatterns) {
        if (pattern.test(line)) {
          alteredSections.push(`Line ${index + 1}: ${pattern.source} marker found`);
          score -= 10;
        }
      }
    });

    // Check for hash mismatch (simulated)
    if (input.documentMetadata?.hash) {
      // In real implementation, would calculate and compare actual hash
      const expectedHashLength = 64; // SHA-256 length
      if (input.documentMetadata.hash.length !== expectedHashLength) {
        alteredSections.push('Invalid document hash format');
        score -= 30;
      }
    }

    return {
      score: Math.max(0, score),
      alteredSections,
    };
  }

  private async detectThreats(input: SecuritySentinelInput): Promise<SecurityCheckResult['threatDetection']> {
    const threats: SecurityCheckResult['threatDetection']['threats'] = [];

    // Check for various threat patterns
    const threatPatterns = [
      {
        pattern: /\b(password|credential|secret)\s*[:=]\s*["']?[\w\-]+["']?/gi,
        type: 'Exposed Credentials',
        severity: 'critical' as const,
      },
      {
        pattern: /\b(sql\s+injection|xss|cross-site\s+scripting)\b/gi,
        type: 'Security Vulnerability Reference',
        severity: 'high' as const,
      },
      {
        pattern: /\b(hack|exploit|vulnerability|breach)\b/gi,
        type: 'Security Threat Indicator',
        severity: 'medium' as const,
      },
    ];

    for (const { pattern, type, severity } of threatPatterns) {
      const matches = input.text.match(pattern);
      if (matches) {
        threats.push({
          type,
          severity,
          description: `Found ${matches.length} instance(s) of ${type.toLowerCase()}`,
        });
      }
    }

    // Check vertical-specific threats
    if (input.verticalContext) {
      const verticalThreats = this.checkVerticalSpecificThreats(input.verticalContext, input.text);
      threats.push(...verticalThreats);
    }

    return {
      threatsFound: threats.length,
      threats,
    };
  }

  private checkVerticalSpecificThreats(
    context: NonNullable<SecuritySentinelInput['verticalContext']>,
    text: string
  ): SecurityCheckResult['threatDetection']['threats'] {
    const threats: SecurityCheckResult['threatDetection']['threats'] = [];

    switch (context.vertical.toLowerCase()) {
      case 'energy':
        if (/\b(pipeline\s+sabotage|infrastructure\s+attack)\b/gi.test(text)) {
          threats.push({
            type: 'Energy Infrastructure Threat',
            severity: 'critical',
            description: 'Potential threat to energy infrastructure detected',
          });
        }
        break;
      case 'government':
        if (/\b(classified|top\s+secret|confidential)\b/gi.test(text)) {
          threats.push({
            type: 'Classified Information Exposure',
            severity: 'critical',
            description: 'Potential exposure of classified information',
          });
        }
        break;
      case 'insurance':
        if (/\b(fraud|false\s+claim|misrepresentation)\b/gi.test(text)) {
          threats.push({
            type: 'Insurance Fraud Indicator',
            severity: 'high',
            description: 'Potential insurance fraud indicators detected',
          });
        }
        break;
    }

    return threats;
  }

  private calculateSecurityScore(checkResults: SecurityCheckResult): number {
    // Weight each component
    const weights = {
      authenticity: 0.3,
      signatures: 0.2,
      integrity: 0.3,
      threats: 0.2,
    };

    // Calculate component scores
    const authenticityScore = checkResults.documentAuthenticity.score;
    const signatureScore = checkResults.digitalSignatures.valid ? 100 : 0;
    const integrityScore = checkResults.dataIntegrity.score;
    
    // Threat score decreases with severity and count
    let threatScore = 100;
    for (const threat of checkResults.threatDetection.threats) {
      const penalty = threat.severity === 'critical' ? 40 :
                     threat.severity === 'high' ? 25 :
                     threat.severity === 'medium' ? 15 : 5;
      threatScore -= penalty;
    }
    threatScore = Math.max(0, threatScore);

    // Calculate weighted average
    const overallScore = 
      authenticityScore * weights.authenticity +
      signatureScore * weights.signatures +
      integrityScore * weights.integrity +
      threatScore * weights.threats;

    return Math.round(overallScore);
  }

  private generateSecurityFlags(checkResults: SecurityCheckResult, score: number): AgentFlag[] {
    const flags: AgentFlag[] = [];

    // Document authenticity flags
    if (checkResults.documentAuthenticity.score < 70) {
      flags.push(this.createFlag(
        this.getSeverityFromScore(100 - checkResults.documentAuthenticity.score),
        'document_authenticity',
        'Document authenticity concerns detected',
        { issues: checkResults.documentAuthenticity.issues }
      ));
    }

    // Digital signature flags
    if (!checkResults.digitalSignatures.valid) {
      flags.push(this.createFlag(
        'high',
        'digital_signature',
        'Invalid or missing digital signatures',
        { signatures: checkResults.digitalSignatures.signatures }
      ));
    }

    // Data integrity flags
    if (checkResults.dataIntegrity.alteredSections.length > 0) {
      flags.push(this.createFlag(
        'high',
        'data_integrity',
        'Data integrity issues detected',
        { alteredSections: checkResults.dataIntegrity.alteredSections }
      ));
    }

    // Threat detection flags
    for (const threat of checkResults.threatDetection.threats) {
      flags.push(this.createFlag(
        threat.severity,
        'threat_detection',
        threat.description,
        { threatType: threat.type }
      ));
    }

    // Overall security score flag
    if (score < 50) {
      flags.push(this.createFlag(
        'critical',
        'overall_security',
        `Critical security score: ${score}/100`,
        { recommendation: 'Immediate security review required' }
      ));
    }

    return flags;
  }

  private identifyFlaggedDocuments(checkResults: SecurityCheckResult, input: SecuritySentinelInput): string[] {
    const flaggedDocs: string[] = [];

    // Flag the current document if it has critical issues
    const hasCriticalIssues = 
      checkResults.documentAuthenticity.score < 50 ||
      !checkResults.digitalSignatures.valid ||
      checkResults.dataIntegrity.score < 50 ||
      checkResults.threatDetection.threats.some(t => t.severity === 'critical');

    if (hasCriticalIssues) {
      const docId = input.documentMetadata?.source || input.promptId || 'unknown-document';
      flaggedDocs.push(docId);
    }

    return flaggedDocs;
  }

  private generateRecommendations(checkResults: SecurityCheckResult, score: number): string[] {
    const recommendations: string[] = [];

    if (score < 80) {
      recommendations.push('Conduct comprehensive security review before proceeding');
    }

    if (checkResults.documentAuthenticity.score < 70) {
      recommendations.push('Verify document source and authenticity through additional channels');
    }

    if (!checkResults.digitalSignatures.valid) {
      recommendations.push('Require digital signatures for all critical documents');
    }

    if (checkResults.dataIntegrity.alteredSections.length > 0) {
      recommendations.push('Investigate and document all data alterations');
    }

    if (checkResults.threatDetection.threatsFound > 0) {
      recommendations.push('Implement additional security controls to mitigate identified threats');
      
      if (checkResults.threatDetection.threats.some(t => t.type === 'Exposed Credentials')) {
        recommendations.push('Immediately rotate all exposed credentials');
      }
    }

    return recommendations;
  }

  private calculateConfidence(checkResults: SecurityCheckResult): number {
    // Confidence is based on how much information we had to work with
    let confidence = 0.5; // Base confidence

    // Increase confidence if we have good metadata
    if (checkResults.digitalSignatures.signatures.length > 0) {
      confidence += 0.2;
    }

    // Increase confidence based on check completeness
    if (checkResults.documentAuthenticity.issues.length === 0) {
      confidence += 0.1;
    }

    if (checkResults.dataIntegrity.alteredSections.length === 0) {
      confidence += 0.1;
    }

    // Decrease confidence if we found many threats (might be false positives)
    if (checkResults.threatDetection.threatsFound > 5) {
      confidence -= 0.1;
    }

    return Math.max(0.1, Math.min(1, confidence));
  }
}

// Export a singleton instance
export const securitySentinel = new SecuritySentinel();
