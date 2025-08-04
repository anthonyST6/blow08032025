import { 
  SIAAnalysisData, 
  SecurityAnalysisData,
  IntegrityAnalysisData,
  AccuracyAnalysisData,
  UseCaseContext,
  SIAMetric,
  SecurityThreat,
  SecurityControl,
  ComplianceItem,
  ModelPerformance,
  DataValidation,
  PrecisionMetric
} from '../types/sia.types';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  LockOpenIcon,
  CpuChipIcon,
  BeakerIcon,
  DocumentMagnifyingGlassIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ServerIcon,
  CloudIcon,
  DocumentTextIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

// Industry-specific threat databases
const SECURITY_THREATS_BY_VERTICAL: Record<string, SecurityThreat[]> = {
  energy: [
    { type: 'SCADA System Vulnerabilities', severity: 'critical', description: 'Potential unauthorized access to industrial control systems', mitigation: 'Implement network segmentation and regular security audits' },
    { type: 'Grid Infrastructure Attacks', severity: 'high', description: 'Targeted attacks on power grid components', mitigation: 'Deploy intrusion detection systems and redundant controls' },
    { type: 'Smart Meter Tampering', severity: 'medium', description: 'Attempts to manipulate consumption data', mitigation: 'Use encrypted communications and tamper-evident seals' }
  ],
  healthcare: [
    { type: 'PHI Data Breaches', severity: 'critical', description: 'Unauthorized access to patient health information', mitigation: 'Enforce HIPAA compliance and data encryption' },
    { type: 'Medical Device Hacking', severity: 'high', description: 'Vulnerabilities in connected medical devices', mitigation: 'Regular firmware updates and network isolation' },
    { type: 'Ransomware Attacks', severity: 'critical', description: 'Malware targeting hospital systems', mitigation: 'Implement robust backup systems and incident response plans' }
  ],
  finance: [
    { type: 'Transaction Fraud', severity: 'high', description: 'Unauthorized financial transactions', mitigation: 'Multi-factor authentication and anomaly detection' },
    { type: 'Data Exfiltration', severity: 'critical', description: 'Theft of sensitive financial data', mitigation: 'DLP solutions and access controls' },
    { type: 'Insider Threats', severity: 'medium', description: 'Malicious actions by authorized users', mitigation: 'User behavior analytics and least privilege access' }
  ],
  manufacturing: [
    { type: 'Industrial Espionage', severity: 'high', description: 'Theft of proprietary designs and processes', mitigation: 'Secure IP management and access controls' },
    { type: 'Supply Chain Attacks', severity: 'medium', description: 'Compromised components or software', mitigation: 'Vendor security assessments and code signing' },
    { type: 'Production Sabotage', severity: 'critical', description: 'Deliberate disruption of manufacturing processes', mitigation: 'Physical security and anomaly detection' }
  ],
  retail: [
    { type: 'POS System Breaches', severity: 'high', description: 'Malware targeting point-of-sale systems', mitigation: 'PCI DSS compliance and endpoint protection' },
    { type: 'Customer Data Theft', severity: 'critical', description: 'Large-scale theft of customer information', mitigation: 'Data encryption and tokenization' },
    { type: 'E-commerce Fraud', severity: 'medium', description: 'Fraudulent online transactions', mitigation: 'Fraud detection algorithms and verification processes' }
  ],
  logistics: [
    { type: 'Cargo Tracking Manipulation', severity: 'medium', description: 'Tampering with shipment tracking data', mitigation: 'Blockchain-based tracking and data integrity checks' },
    { type: 'Route Optimization Attacks', severity: 'high', description: 'Disruption of routing algorithms', mitigation: 'Redundant systems and manual override capabilities' },
    { type: 'Fleet Management Breaches', severity: 'medium', description: 'Unauthorized access to vehicle systems', mitigation: 'Secure telematics and regular security updates' }
  ],
  education: [
    { type: 'Student Data Privacy', severity: 'critical', description: 'Unauthorized access to student records and PII', mitigation: 'FERPA compliance and access controls' },
    { type: 'Online Learning Platform Attacks', severity: 'high', description: 'Disruption of e-learning systems', mitigation: 'DDoS protection and redundant infrastructure' },
    { type: 'Academic Integrity Violations', severity: 'medium', description: 'Cheating and plagiarism in digital assessments', mitigation: 'Proctoring software and plagiarism detection' }
  ],
  pharma: [
    { type: 'Clinical Trial Data Breach', severity: 'critical', description: 'Theft of proprietary research data', mitigation: 'Encrypted databases and access logging' },
    { type: 'Supply Chain Counterfeiting', severity: 'high', description: 'Introduction of counterfeit drugs', mitigation: 'Blockchain tracking and authentication' },
    { type: 'GxP Compliance Violations', severity: 'high', description: 'Regulatory non-compliance in data handling', mitigation: 'Automated compliance monitoring and audit trails' }
  ],
  government: [
    { type: 'Nation-State Attacks', severity: 'critical', description: 'Advanced persistent threats from foreign actors', mitigation: 'Zero-trust architecture and continuous monitoring' },
    { type: 'Citizen Data Exposure', severity: 'high', description: 'Leakage of sensitive citizen information', mitigation: 'Data classification and encryption' },
    { type: 'Critical Infrastructure Threats', severity: 'critical', description: 'Attacks on essential government services', mitigation: 'Redundant systems and incident response teams' }
  ],
  telecom: [
    { type: 'Network Infrastructure Attacks', severity: 'critical', description: 'Disruption of communication networks', mitigation: 'Network segmentation and redundancy' },
    { type: 'Customer Data Theft', severity: 'high', description: 'Large-scale theft of subscriber information', mitigation: 'Data encryption and access controls' },
    { type: 'SS7 Protocol Vulnerabilities', severity: 'high', description: 'Exploitation of signaling system weaknesses', mitigation: 'SS7 firewall and monitoring' }
  ],
  'real-estate': [
    { type: 'Property Data Manipulation', severity: 'medium', description: 'Tampering with property records and valuations', mitigation: 'Blockchain-based record keeping' },
    { type: 'Client Financial Data Breach', severity: 'high', description: 'Theft of buyer/seller financial information', mitigation: 'PCI compliance and secure document handling' },
    { type: 'Smart Building Vulnerabilities', severity: 'medium', description: 'Exploitation of IoT devices in properties', mitigation: 'IoT security standards and network isolation' }
  ]
};

// Compliance requirements by vertical
const COMPLIANCE_BY_VERTICAL: Record<string, string[]> = {
  energy: ['NERC CIP', 'ISO 27001', 'IEC 62443', 'FERC Standards'],
  healthcare: ['HIPAA', 'HITECH', 'FDA Regulations', 'ISO 27799'],
  finance: ['PCI DSS', 'SOX', 'GDPR', 'Basel III'],
  manufacturing: ['ISO 9001', 'ISO 14001', 'IATF 16949', 'OSHA'],
  retail: ['PCI DSS', 'GDPR', 'CCPA', 'FTC Regulations'],
  logistics: ['C-TPAT', 'ISO 28000', 'ISPS Code', 'DOT Regulations'],
  education: ['FERPA', 'COPPA', 'GDPR', 'State Privacy Laws'],
  pharma: ['GxP', 'FDA 21 CFR Part 11', 'EU Annex 11', 'ICH Guidelines'],
  government: ['FISMA', 'FedRAMP', 'NIST Standards', 'State Regulations'],
  telecom: ['CPNI', 'GDPR', 'FCC Regulations', 'ISO 27001'],
  'real-estate': ['RESPA', 'TILA', 'Fair Housing Act', 'State Real Estate Laws']
};

export class SIADataGeneratorService {
  /**
   * Generate complete SIA analysis data for a use case
   */
  static generateSIAData(useCase: UseCaseContext): SIAAnalysisData {
    return {
      security: this.generateSecurityAnalysis(useCase),
      integrity: this.generateIntegrityAnalysis(useCase),
      accuracy: this.generateAccuracyAnalysis(useCase),
      generatedAt: new Date().toISOString(),
      useCaseId: useCase.id,
      vertical: useCase.vertical
    };
  }

  /**
   * Generate security analysis data
   */
  private static generateSecurityAnalysis(useCase: UseCaseContext): SecurityAnalysisData {
    const baseScore = useCase.siaScores.security;
    const threats = this.getVerticalThreats(useCase.vertical);
    const metrics = this.generateSecurityMetrics(baseScore, useCase);
    
    return {
      overallScore: baseScore,
      description: `Comprehensive security assessment for ${useCase.name} with focus on ${useCase.vertical} industry requirements`,
      metrics,
      recommendations: this.generateSecurityRecommendations(baseScore, useCase.vertical),
      threats,
      vulnerabilities: this.generateVulnerabilities(baseScore, useCase.vertical),
      controls: this.generateSecurityControls(baseScore, useCase.vertical)
    };
  }

  /**
   * Generate integrity analysis data
   */
  private static generateIntegrityAnalysis(useCase: UseCaseContext): IntegrityAnalysisData {
    const baseScore = useCase.siaScores.integrity;
    const metrics = this.generateIntegrityMetrics(baseScore, useCase);
    const compliance = this.generateComplianceItems(useCase.vertical, baseScore);
    
    return {
      overallScore: baseScore,
      description: `Data integrity validation and compliance assessment for ${useCase.name}`,
      metrics,
      complianceItems: compliance,
      validationResults: this.generateValidationResults(baseScore),
      anomaliesDetected: Math.floor(Math.random() * 50) + (100 - baseScore),
      reconciliationStatus: {
        matched: Math.floor(baseScore * 10),
        mismatched: Math.floor((100 - baseScore) * 2),
        pending: Math.floor(Math.random() * 20)
      }
    };
  }

  /**
   * Generate accuracy analysis data
   */
  private static generateAccuracyAnalysis(useCase: UseCaseContext): AccuracyAnalysisData {
    const baseScore = useCase.siaScores.accuracy;
    const metrics = this.generateAccuracyMetrics(baseScore, useCase);
    
    return {
      overallScore: baseScore,
      description: `Model performance and prediction accuracy analysis for ${useCase.name}`,
      metrics,
      modelPerformance: this.generateModelPerformance(baseScore),
      precisionMetrics: this.generatePrecisionMetrics(baseScore),
      dataCompleteness: this.calculateDataCompleteness(baseScore),
      timelinessScore: this.calculateTimelinessScore(baseScore)
    };
  }

  // Helper methods for generating specific metrics
  private static generateSecurityMetrics(baseScore: number, useCase: UseCaseContext): SIAMetric[] {
    const variance = 5; // Allow metrics to vary by ±5% from base score
    
    return [
      {
        name: 'Authentication Security',
        value: this.randomizeScore(baseScore + 3, variance),
        status: this.getStatus(baseScore + 3),
        description: `Multi-factor authentication and identity management for ${useCase.vertical} systems`,
        icon: KeyIcon,
        details: ['MFA enabled for all users', 'Biometric authentication available', 'Regular password policy updates']
      },
      {
        name: 'Data Encryption',
        value: this.randomizeScore(baseScore + 5, variance),
        status: this.getStatus(baseScore + 5),
        description: 'End-to-end encryption for data at rest and in transit',
        icon: LockClosedIcon,
        details: ['AES-256 encryption standard', 'TLS 1.3 for data in transit', 'Key rotation every 90 days']
      },
      {
        name: 'Access Control',
        value: this.randomizeScore(baseScore - 2, variance),
        status: this.getStatus(baseScore - 2),
        description: 'Role-based access control with principle of least privilege',
        icon: FingerPrintIcon,
        details: ['RBAC implementation', 'Regular access reviews', 'Automated deprovisioning']
      },
      {
        name: 'Threat Detection',
        value: this.randomizeScore(baseScore, variance),
        status: this.getStatus(baseScore),
        description: `Real-time threat monitoring for ${useCase.vertical}-specific attack vectors`,
        icon: ExclamationTriangleIcon,
        details: ['24/7 SOC monitoring', 'AI-powered anomaly detection', 'Automated incident response']
      },
      {
        name: 'Network Security',
        value: this.randomizeScore(baseScore + 1, variance),
        status: this.getStatus(baseScore + 1),
        description: 'Firewall rules and network segmentation',
        icon: CloudIcon,
        details: ['Zero-trust network architecture', 'Micro-segmentation', 'Regular penetration testing']
      },
      {
        name: 'Audit Logging',
        value: this.randomizeScore(baseScore + 2, variance),
        status: this.getStatus(baseScore + 2),
        description: 'Comprehensive audit trails for all critical operations',
        icon: DocumentTextIcon,
        details: ['Immutable audit logs', 'Real-time log analysis', 'Long-term retention policy']
      }
    ];
  }

  private static generateIntegrityMetrics(baseScore: number, useCase: UseCaseContext): SIAMetric[] {
    const variance = 5;
    
    return [
      {
        name: 'Data Validation',
        value: this.randomizeScore(baseScore + 2, variance),
        status: this.getStatus(baseScore + 2),
        description: `Input validation and data quality checks for ${useCase.vertical} data`,
        icon: DocumentCheckIcon,
        details: ['Schema validation', 'Business rule enforcement', 'Data type checking']
      },
      {
        name: 'Data Consistency',
        value: this.randomizeScore(baseScore - 3, variance),
        status: this.getStatus(baseScore - 3),
        description: 'Cross-system data synchronization and consistency',
        icon: CircleStackIcon,
        details: ['Real-time sync monitoring', 'Conflict resolution', 'Version control']
      },
      {
        name: 'Audit Trail Integrity',
        value: this.randomizeScore(baseScore + 4, variance),
        status: this.getStatus(baseScore + 4),
        description: 'Immutable audit logging with cryptographic verification',
        icon: ClipboardDocumentCheckIcon,
        details: ['Tamper-proof logs', 'Complete audit coverage', 'Log retention compliance']
      },
      {
        name: 'Transaction Integrity',
        value: this.randomizeScore(baseScore, variance),
        status: this.getStatus(baseScore),
        description: 'ACID compliance and transaction rollback capabilities',
        icon: ArrowPathIcon,
        details: ['Atomicity guaranteed', 'Isolation levels enforced', 'Durability assured']
      },
      {
        name: 'Access Control Violations',
        value: this.randomizeScore(baseScore - 5, variance),
        status: this.getStatus(baseScore - 5),
        description: 'Detection and prevention of unauthorized access attempts',
        icon: LockOpenIcon,
        details: ['Real-time violation detection', 'Automated response', 'Forensic capabilities']
      },
      {
        name: 'Data Lineage Tracking',
        value: this.randomizeScore(baseScore + 1, variance),
        status: this.getStatus(baseScore + 1),
        description: 'Complete traceability of data transformations and movements',
        icon: ShieldExclamationIcon,
        details: ['End-to-end data tracking', 'Transformation logging', 'Source verification']
      }
    ];
  }

  private static generateAccuracyMetrics(baseScore: number, useCase: UseCaseContext): SIAMetric[] {
    const variance = 5;
    
    return [
      {
        name: 'Model Accuracy',
        value: this.randomizeScore(baseScore + 1, variance),
        status: this.getStatus(baseScore + 1),
        description: `AI model prediction accuracy for ${useCase.name}`,
        icon: CpuChipIcon,
        details: ['Regular model retraining', 'Cross-validation performed', 'Bias detection active']
      },
      {
        name: 'Data Quality',
        value: this.randomizeScore(baseScore - 2, variance),
        status: this.getStatus(baseScore - 2),
        description: 'Input data quality and completeness assessment',
        icon: BeakerIcon,
        details: ['Missing data handling', 'Outlier detection', 'Data profiling']
      },
      {
        name: 'Output Validation',
        value: this.randomizeScore(baseScore + 3, variance),
        status: this.getStatus(baseScore + 3),
        description: 'Automated validation of AI-generated outputs',
        icon: DocumentMagnifyingGlassIcon,
        details: ['Business rule validation', 'Sanity checks', 'Human-in-the-loop review']
      },
      {
        name: 'Calculation Precision',
        value: this.randomizeScore(baseScore + 4, variance),
        status: this.getStatus(baseScore + 4),
        description: 'Mathematical and computational precision in calculations',
        icon: CalculatorIcon,
        details: ['Double precision arithmetic', 'Rounding error control', 'Numerical stability']
      },
      {
        name: 'Trend Prediction',
        value: this.randomizeScore(baseScore - 4, variance),
        status: this.getStatus(baseScore - 4),
        description: 'Accuracy of predictive analytics and forecasting',
        icon: ArrowTrendingUpIcon,
        details: ['Time series analysis', 'Seasonal adjustments', 'Confidence intervals']
      },
      {
        name: 'Anomaly Detection',
        value: this.randomizeScore(baseScore, variance),
        status: this.getStatus(baseScore),
        description: 'Effectiveness in identifying outliers and anomalies',
        icon: SparklesIcon,
        details: ['Statistical methods', 'Machine learning detection', 'False positive reduction']
      }
    ];
  }

  private static generateSecurityRecommendations(score: number, vertical: string): string[] {
    const recommendations = [];
    
    // Score-based recommendations
    if (score < 70) {
      recommendations.push('Immediate security audit required to address critical vulnerabilities');
      recommendations.push('Implement multi-factor authentication across all systems');
      recommendations.push('Deploy intrusion detection and prevention systems');
    } else if (score < 85) {
      recommendations.push('Enhance access control policies and regular reviews');
      recommendations.push('Strengthen encryption protocols for sensitive data');
      recommendations.push('Increase frequency of security assessments');
    } else {
      recommendations.push('Maintain current security posture with continuous monitoring');
      recommendations.push('Consider advanced threat hunting capabilities');
      recommendations.push('Explore zero-trust architecture implementation');
    }
    
    // Vertical-specific recommendations
    const verticalRecs: Record<string, string> = {
      energy: 'Implement NERC CIP compliance monitoring and OT/IT segmentation',
      healthcare: 'Ensure HIPAA compliance and medical device security protocols',
      finance: 'Maintain PCI DSS compliance and enhance fraud detection systems',
      manufacturing: 'Secure industrial control systems and protect intellectual property',
      retail: 'Strengthen POS security and customer data protection measures',
      logistics: 'Enhance supply chain visibility and cargo tracking security',
      education: 'Implement FERPA compliance and secure online learning platforms',
      pharma: 'Ensure GxP compliance and clinical trial data protection',
      government: 'Deploy advanced persistent threat detection and citizen data protection',
      telecom: 'Secure network infrastructure and implement SS7 protection',
      'real-estate': 'Protect property records and client financial information'
    };
    
    if (verticalRecs[vertical]) {
      recommendations.push(verticalRecs[vertical]);
    }
    
    return recommendations;
  }

  private static generateVulnerabilities(score: number, vertical: string): string[] {
    const vulnerabilities = [];
    const count = Math.floor((100 - score) / 10) + 1;
    
    const verticalVulns: Record<string, string[]> = {
      energy: ['Unpatched SCADA systems', 'Weak network segmentation', 'Legacy protocol usage', 'Insufficient OT monitoring'],
      healthcare: ['Outdated medical devices', 'Weak PHI access controls', 'Unencrypted data transfers', 'Legacy EMR systems'],
      finance: ['SQL injection risks', 'Weak API authentication', 'Insufficient transaction monitoring', 'Outdated encryption'],
      manufacturing: ['Exposed industrial networks', 'Weak IP protection', 'Unsecured IoT devices', 'Supply chain gaps'],
      retail: ['POS malware risks', 'Weak payment processing', 'Customer data exposure', 'E-commerce vulnerabilities'],
      logistics: ['GPS spoofing vulnerabilities', 'Weak cargo tracking', 'Supply chain gaps', 'Fleet system exposure'],
      education: ['Student data exposure', 'Weak authentication systems', 'Unsecured e-learning platforms', 'FERPA violations'],
      pharma: ['Clinical data vulnerabilities', 'Weak research data protection', 'Supply chain risks', 'GxP non-compliance'],
      government: ['Legacy system vulnerabilities', 'Weak citizen portals', 'Insider threat risks', 'Nation-state exposure'],
      telecom: ['SS7 vulnerabilities', 'Network exposure points', 'Customer data risks', 'Infrastructure weaknesses'],
      'real-estate': ['Property data tampering', 'Weak document security', 'Smart building vulnerabilities', 'Client data exposure']
    };
    
    const vulnList = verticalVulns[vertical] || verticalVulns.energy;
    return vulnList.slice(0, Math.min(count, vulnList.length));
  }

  private static generateSecurityControls(score: number, vertical: string): SecurityControl[] {
    const controls = [
      { name: 'Multi-Factor Authentication', implemented: score > 60, effectiveness: Math.min(score + 10, 100), description: 'MFA for all user accounts' },
      { name: 'Data Encryption', implemented: score > 50, effectiveness: Math.min(score + 15, 100), description: 'AES-256 encryption for data at rest and in transit' },
      { name: 'Access Control Lists', implemented: score > 40, effectiveness: score, description: 'Role-based access control implementation' },
      { name: 'Security Monitoring', implemented: score > 55, effectiveness: Math.min(score + 5, 100), description: '24/7 security operations center' },
      { name: 'Incident Response Plan', implemented: score > 65, effectiveness: Math.max(score - 5, 0), description: 'Documented and tested incident response procedures' },
      { name: 'Vulnerability Management', implemented: score > 70, effectiveness: score, description: 'Regular vulnerability scanning and patching' }
    ];
    
    // Add vertical-specific controls
    const verticalControls: Record<string, SecurityControl> = {
      energy: { name: 'SCADA Security', implemented: score > 75, effectiveness: score, description: 'Industrial control system protection' },
      healthcare: { name: 'HIPAA Controls', implemented: score > 70, effectiveness: Math.min(score + 5, 100), description: 'Healthcare-specific compliance controls' },
      finance: { name: 'Fraud Detection', implemented: score > 65, effectiveness: Math.min(score + 10, 100), description: 'Real-time transaction monitoring' },
      manufacturing: { name: 'IP Protection', implemented: score > 60, effectiveness: score, description: 'Intellectual property safeguards' },
      retail: { name: 'PCI DSS Controls', implemented: score > 70, effectiveness: Math.min(score + 5, 100), description: 'Payment card industry compliance' },
      logistics: { name: 'Supply Chain Security', implemented: score > 65, effectiveness: score, description: 'End-to-end supply chain protection' },
      education: { name: 'FERPA Controls', implemented: score > 70, effectiveness: score, description: 'Student privacy protection' },
      pharma: { name: 'GxP Compliance', implemented: score > 75, effectiveness: Math.min(score + 5, 100), description: 'Good practice regulations' },
      government: { name: 'FISMA Controls', implemented: score > 80, effectiveness: score, description: 'Federal information security' },
      telecom: { name: 'Network Protection', implemented: score > 70, effectiveness: score, description: 'Telecom infrastructure security' },
      'real-estate': { name: 'Document Security', implemented: score > 65, effectiveness: score, description: 'Secure document handling' }
    };
    
    if (verticalControls[vertical]) {
      controls.push(verticalControls[vertical]);
    }
    
    return controls;
  }

  private static generateComplianceItems(vertical: string, score: number): ComplianceItem[] {
    const requirements = COMPLIANCE_BY_VERTICAL[vertical] || COMPLIANCE_BY_VERTICAL.energy;
    
    return requirements.map((req, index) => ({
      name: req,
      status: score > 85 ? 'compliant' : score > 70 ? 'partial' : 'non-compliant',
      description: `Compliance with ${req} standards and regulations`,
      requirement: `Meet all ${req} requirements for ${vertical} operations`,
      lastAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  }

  private static generateValidationResults(score: number): DataValidation[] {
    return [
      {
        type: 'Schema Validation',
        passed: Math.floor(score * 10),
        failed: Math.floor((100 - score) * 2),
        accuracy: Math.min(score + Math.random() * 5, 100)
      },
      {
        type: 'Business Rules',
        passed: Math.floor(score * 8),
        failed: Math.floor((100 - score) * 1.5),
        accuracy: Math.max(score - Math.random() * 3, 0)
      },
      {
        type: 'Data Type Checks',
        passed: Math.floor(score * 12),
        failed: Math.floor((100 - score) * 1),
        accuracy: Math.min(score + Math.random() * 10, 100)
      },
      {
        type: 'Referential Integrity',
        passed: Math.floor(score * 9),
        failed: Math.floor((100 - score) * 2.5),
        accuracy: Math.min(score + Math.random() * 2, 100)
      }
    ];
  }

  private static generateModelPerformance(score: number): ModelPerformance[] {
    return [
      {
        metric: 'Precision',
        value: Math.min(Math.max(score + Math.random() * 5 - 2.5, 0), 100),
        benchmark: 85,
        trend: score > 85 ? 'improving' : score > 70 ? 'stable' : 'declining'
      },
      {
        metric: 'Recall',
        value: Math.min(Math.max(score - Math.random() * 5, 0), 100),
        benchmark: 80,
        trend: score > 80 ? 'stable' : 'declining'
      },
      {
        metric: 'F1 Score',
        value: Math.min(Math.max(score + Math.random() * 3 - 1.5, 0), 100),
        benchmark: 82,
        trend: score > 82 ? 'improving' : 'stable'
      },
      {
        metric: 'AUC-ROC',
        value: Math.min(score + Math.random() * 8, 100),
        benchmark: 88,
        trend: score > 88 ? 'improving' : score > 75 ? 'stable' : 'declining'
      }
    ];
  }

  private static generatePrecisionMetrics(score: number): PrecisionMetric[] {
    const categories = ['Classification', 'Regression', 'Clustering', 'Anomaly Detection'];
    
    return categories.map(category => {
      const precision = score + Math.random() * 10 - 5;
      const recall = score + Math.random() * 8 - 4;
      const f1Score = 2 * (precision * recall) / (precision + recall);
      
      return {
        category,
        precision: Math.max(0, Math.min(100, precision)),
        recall: Math.max(0, Math.min(100, recall)),
        f1Score: Math.max(0, Math.min(100, f1Score))
      };
    });
  }

  private static calculateDataCompleteness(score: number): number {
    return Math.min(100, Math.max(0, score + Math.random() * 15 - 5));
  }

  private static calculateTimelinessScore(score: number): number {
    return Math.min(100, Math.max(0, score + Math.random() * 10 - 3));
  }

  // Utility methods
  private static randomizeScore(base: number, variance: number): number {
    const min = Math.max(0, base - variance);
    const max = Math.min(100, base + variance);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static getStatus(score: number): 'good' | 'warning' | 'critical' {
    if (score >= 90) return 'good';
    if (score >= 70) return 'warning';
    return 'critical';
  }

  private static getVerticalThreats(vertical: string): SecurityThreat[] {
    const threats = SECURITY_THREATS_BY_VERTICAL[vertical] || SECURITY_THREATS_BY_VERTICAL.energy;
    return threats.map(threat => ({ ...threat }));
  }

  // Helper function to determine complexity based on use case
  static determineComplexity(useCase: any): 'low' | 'medium' | 'high' {
    // Logic based on use case characteristics
    const avgScore = (useCase.siaScores.security + useCase.siaScores.integrity + useCase.siaScores.accuracy) / 3;
    if (avgScore > 85) return 'low';
    if (avgScore > 70) return 'medium';
    return 'high';
  }

  // Helper function to estimate data volume
  static estimateDataVolume(useCase: any): 'small' | 'medium' | 'large' {
    // Logic based on use case type
    const dataIntensiveVerticals = ['finance', 'telecom', 'healthcare', 'government'];
    if (dataIntensiveVerticals.includes(useCase.vertical)) return 'large';
    
    const mediumDataVerticals = ['manufacturing', 'retail', 'logistics', 'energy'];
    if (mediumDataVerticals.includes(useCase.vertical)) return 'medium';
    
    return 'small';
  }
}

// Simple in-memory cache for generated SIA data
export class SIADataCache {
  private static cache = new Map<string, { data: SIAAnalysisData; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  static get(useCaseId: string): SIAAnalysisData | null {
    const cached = this.cache.get(useCaseId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }
  
  static set(useCaseId: string, data: SIAAnalysisData): void {
    this.cache.set(useCaseId, { data, timestamp: Date.now() });
  }
  
  static clear(): void {
    this.cache.clear();
  }
}