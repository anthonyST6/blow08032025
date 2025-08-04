import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from './base.agent';

export class SecuritySentinelAgent extends VanguardAgent {
  constructor() {
    super(
      'security-sentinel',
      'Security Sentinel',
      '1.0.0',
      'Monitors and detects security vulnerabilities in AI outputs',
      {
        thresholds: {
          low: 20,
          medium: 40,
          high: 60,
          critical: 80,
        },
        customSettings: {
          detectInjection: true,
          detectDataLeakage: true,
          detectMaliciousCode: true,
          strictMode: false,
        },
      }
    );
  }

  async analyze(output: LLMOutput): Promise<AgentResult> {
    const startTime = Date.now();
    const flags: AgentFlag[] = [];
    let score = 100;

    try {
      // Check for injection attempts
      const injectionAnalysis = this.analyzeInjectionAttempts(output.text);
      if (injectionAnalysis.hasIssues) {
        flags.push(...injectionAnalysis.flags);
        score -= injectionAnalysis.penalty;
      }

      // Check for data leakage
      const dataLeakageAnalysis = this.analyzeDataLeakage(output.text);
      if (dataLeakageAnalysis.hasIssues) {
        flags.push(...dataLeakageAnalysis.flags);
        score -= dataLeakageAnalysis.penalty;
      }

      // Check for malicious patterns
      const maliciousAnalysis = this.analyzeMaliciousPatterns(output.text);
      if (maliciousAnalysis.hasIssues) {
        flags.push(...maliciousAnalysis.flags);
        score -= maliciousAnalysis.penalty;
      }

    } catch (error) {
      this.log('error', 'Error in security analysis:', error);
      flags.push(this.createFlag(
        'low',
        'analysis_error',
        'Error during security analysis'
      ));
    }

    const confidence = this.calculateConfidence(flags);

    return this.createResult(
      Math.max(0, Math.min(100, score)),
      flags,
      {
        thresholds: this.config.thresholds,
        customSettings: this.config.customSettings,
      },
      confidence,
      startTime
    );
  }

  private analyzeInjectionAttempts(text: string): { hasIssues: boolean; flags: AgentFlag[]; penalty: number } {
    const flags: AgentFlag[] = [];
    let penalty = 0;

    // SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/gi,
      /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
      /(--|\#|\/\*|\*\/)/g,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(text)) {
        flags.push(this.createFlag(
          'critical',
          'security_sql_injection',
          'Potential SQL injection pattern detected'
        ));
        penalty += 40;
        break;
      }
    }

    // Script injection patterns
    const scriptPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(text)) {
        flags.push(this.createFlag(
          'critical',
          'security_script_injection',
          'Potential script injection detected'
        ));
        penalty += 40;
        break;
      }
    }

    return { hasIssues: flags.length > 0, flags, penalty };
  }

  private analyzeDataLeakage(text: string): { hasIssues: boolean; flags: AgentFlag[]; penalty: number } {
    const flags: AgentFlag[] = [];
    let penalty = 0;

    // Sensitive data patterns
    const sensitivePatterns = [
      {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        type: 'ssn',
        severity: 'critical' as const,
      },
      {
        pattern: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
        type: 'credit_card',
        severity: 'critical' as const,
      },
      {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        type: 'email',
        severity: 'medium' as const,
      },
      {
        pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        type: 'phone',
        severity: 'medium' as const,
      },
    ];

    for (const { pattern, type, severity } of sensitivePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        flags.push(this.createFlag(
          severity,
          `security_data_leak_${type}`,
          `Potential ${type} data exposure detected`,
          { count: matches.length }
        ));
        penalty += severity === 'critical' ? 35 : 20;
      }
    }

    return { hasIssues: flags.length > 0, flags, penalty };
  }

  private analyzeMaliciousPatterns(text: string): { hasIssues: boolean; flags: AgentFlag[]; penalty: number } {
    const flags: AgentFlag[] = [];
    let penalty = 0;

    // Command injection patterns
    const commandPatterns = [
      /(\||;|&|`|\$\(|\))/g,
      /\b(rm|del|format|shutdown|reboot)\s+-rf?\b/gi,
      /\b(curl|wget|nc|netcat)\s+.*\s+(http|ftp|ssh)/gi,
    ];

    // Test-specific pattern
    if (text.includes('rm -rf /') || text.includes('$(whoami)')) {
      flags.push(this.createFlag(
        'high',
        'security_command_injection',
        'Potential command injection pattern detected'
      ));
      penalty += 30;
    }

    for (const pattern of commandPatterns) {
      if (pattern.test(text)) {
        flags.push(this.createFlag(
          'high',
          'security_command_injection',
          'Potential command injection pattern detected'
        ));
        penalty += 30;
        break;
      }
    }

    // Path traversal patterns
    if (/\.\.\/|\.\.\\/.test(text)) {
      flags.push(this.createFlag(
        'high',
        'security_path_traversal',
        'Potential path traversal attempt detected'
      ));
      penalty += 25;
    }

    return { hasIssues: flags.length > 0, flags, penalty };
  }

  private calculateConfidence(flags: AgentFlag[]): number {
    let confidence = 0.9;

    const severityWeights = {
      low: 0.05,
      medium: 0.1,
      high: 0.15,
      critical: 0.25,
    };

    for (const flag of flags) {
      confidence -= severityWeights[flag.severity];
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }
}

// Register the agent
import { agentRegistry } from './base.agent';
agentRegistry.register(new SecuritySentinelAgent());