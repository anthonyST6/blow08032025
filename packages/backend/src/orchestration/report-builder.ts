import { logger } from '../utils/logger';
import { VanguardReport, VanguardSession } from '../vanguards/orchestrator';
import { UseCaseBinding } from './use-case-binder';

export interface ReportTemplate {
  id: string;
  name: string;
  format: 'json' | 'pdf' | 'html' | 'markdown';
  sections: ReportSection[];
  styling?: ReportStyling;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'scores' | 'issues' | 'recommendations' | 'details' | 'custom';
  order: number;
  visible: boolean;
  config?: Record<string, any>;
}

export interface ReportStyling {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  logo?: string;
}

export interface ReportOutput {
  id: string;
  sessionId: string;
  format: string;
  content: any;
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    template: string;
    size?: number;
  };
}

export interface ReportGenerationOptions {
  template?: string;
  format?: 'json' | 'pdf' | 'html' | 'markdown';
  includeDetails?: boolean;
  customSections?: ReportSection[];
  styling?: Partial<ReportStyling>;
}

export class ReportBuilder {
  private templates: Map<string, ReportTemplate> = new Map();
  private defaultStyling: ReportStyling = {
    colors: {
      primary: '#D4AF37', // Seraphim Gold
      secondary: '#0D0D0D', // Matte Black
      success: '#3BD16F', // Green (Accuracy)
      warning: '#DC3E40', // Red (Integrity)
      danger: '#DC3E40', // Red
      background: '#0D0D0D',
      text: '#FFFFFF',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
      mono: 'Courier New, monospace',
    },
  };

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default report templates
   */
  private initializeTemplates(): void {
    // Executive Summary Template
    this.registerTemplate({
      id: 'executive-summary',
      name: 'Executive Summary Report',
      format: 'pdf',
      sections: [
        {
          id: 'header',
          title: 'Seraphim Vanguards Analysis Report',
          type: 'custom',
          order: 1,
          visible: true,
        },
        {
          id: 'summary',
          title: 'Executive Summary',
          type: 'summary',
          order: 2,
          visible: true,
        },
        {
          id: 'scores',
          title: 'Vanguard Scores',
          type: 'scores',
          order: 3,
          visible: true,
        },
        {
          id: 'critical-issues',
          title: 'Critical Issues',
          type: 'issues',
          order: 4,
          visible: true,
          config: { severityFilter: ['critical', 'high'] },
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          type: 'recommendations',
          order: 5,
          visible: true,
        },
      ],
    });

    // Detailed Analysis Template
    this.registerTemplate({
      id: 'detailed-analysis',
      name: 'Detailed Analysis Report',
      format: 'pdf',
      sections: [
        {
          id: 'header',
          title: 'Seraphim Vanguards Detailed Analysis',
          type: 'custom',
          order: 1,
          visible: true,
        },
        {
          id: 'summary',
          title: 'Analysis Summary',
          type: 'summary',
          order: 2,
          visible: true,
        },
        {
          id: 'scores',
          title: 'Comprehensive Scores',
          type: 'scores',
          order: 3,
          visible: true,
        },
        {
          id: 'all-issues',
          title: 'All Identified Issues',
          type: 'issues',
          order: 4,
          visible: true,
        },
        {
          id: 'security-details',
          title: 'Security Analysis Details',
          type: 'details',
          order: 5,
          visible: true,
          config: { agent: 'security' },
        },
        {
          id: 'integrity-details',
          title: 'Integrity Analysis Details',
          type: 'details',
          order: 6,
          visible: true,
          config: { agent: 'integrity' },
        },
        {
          id: 'accuracy-details',
          title: 'Accuracy Analysis Details',
          type: 'details',
          order: 7,
          visible: true,
          config: { agent: 'accuracy' },
        },
        {
          id: 'recommendations',
          title: 'Comprehensive Recommendations',
          type: 'recommendations',
          order: 8,
          visible: true,
        },
      ],
    });

    // JSON Export Template
    this.registerTemplate({
      id: 'json-export',
      name: 'JSON Data Export',
      format: 'json',
      sections: [
        {
          id: 'full-data',
          title: 'Complete Analysis Data',
          type: 'custom',
          order: 1,
          visible: true,
        },
      ],
    });
  }

  /**
   * Generate a report from a Vanguard session
   */
  async generateReport(
    session: VanguardSession,
    binding: UseCaseBinding,
    options: ReportGenerationOptions = {}
  ): Promise<ReportOutput> {
    const startTime = Date.now();
    logger.info('Generating report', {
      sessionId: session.id,
      format: options.format || 'pdf',
      template: options.template || 'executive-summary',
    });

    try {
      // Get template
      const templateId = options.template || 'executive-summary';
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Determine format
      const format = options.format || template.format;

      // Generate content based on format
      let content: any;
      switch (format) {
        case 'json':
          content = await this.generateJSONReport(session, binding, options);
          break;
        case 'html':
          content = await this.generateHTMLReport(session, binding, template, options);
          break;
        case 'markdown':
          content = await this.generateMarkdownReport(session, binding, template, options);
          break;
        case 'pdf':
          content = await this.generatePDFReport(session, binding, template, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create report output
      const report: ReportOutput = {
        id: this.generateReportId(),
        sessionId: session.id,
        format,
        content,
        metadata: {
          generatedAt: new Date(),
          generatedBy: 'seraphim-vanguards',
          template: templateId,
          size: this.calculateContentSize(content),
        },
      };

      logger.info('Report generated successfully', {
        reportId: report.id,
        format: report.format,
        size: report.metadata.size,
        processingTime: Date.now() - startTime,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate report', { error });
      throw error;
    }
  }

  /**
   * Generate JSON report
   */
  private async generateJSONReport(
    session: VanguardSession,
    binding: UseCaseBinding,
    options: ReportGenerationOptions
  ): Promise<any> {
    const report = session.aggregatedReport;
    if (!report) {
      throw new Error('No aggregated report available in session');
    }

    const jsonReport: any = {
      reportId: this.generateReportId(),
      generatedAt: new Date().toISOString(),
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        processingTime: session.endTime ?
          session.endTime.getTime() - session.startTime.getTime() : null,
      },
      useCase: {
        id: binding.useCaseId,
        vertical: binding.context.vertical,
        regulations: binding.context.regulations,
      },
      summary: {
        overallScore: report.overallScore,
        status: report.status,
        totalIssues: report.summary.totalFlags,
        criticalIssues: report.summary.criticalFlags,
      },
      scores: {
        overall: report.overallScore,
        security: report.scores.security,
        integrity: report.scores.integrity,
        accuracy: report.scores.accuracy,
      },
      issues: report.criticalIssues,
      recommendations: report.recommendations,
    };

    if (options.includeDetails) {
      jsonReport.detailedResults = {
        security: session.results.security,
        integrity: session.results.integrity,
        accuracy: session.results.accuracy,
      };
    }

    return jsonReport;
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(
    session: VanguardSession,
    binding: UseCaseBinding,
    template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<string> {
    const report = session.aggregatedReport;
    if (!report) {
      throw new Error('No aggregated report available in session');
    }

    const styling = { ...this.defaultStyling, ...options.styling };
    const sections = options.customSections || template.sections;

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seraphim Vanguards Report - ${binding.context.useCase}</title>
    <style>
        body {
            font-family: ${styling.fonts.body};
            background-color: ${styling.colors.background};
            color: ${styling.colors.text};
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2, h3 {
            font-family: ${styling.fonts.heading};
            color: ${styling.colors.primary};
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            border-bottom: 2px solid ${styling.colors.primary};
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        .score-container {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .score-item {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            min-width: 150px;
        }
        .score-security { background-color: #3A88F5; }
        .score-integrity { background-color: #DC3E40; }
        .score-accuracy { background-color: #3BD16F; }
        .score-value {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .issue {
            margin: 10px 0;
            padding: 10px;
            border-left: 4px solid;
            background-color: rgba(255, 255, 255, 0.05);
        }
        .issue-critical { border-color: ${styling.colors.danger}; }
        .issue-high { border-color: ${styling.colors.warning}; }
        .issue-medium { border-color: ${styling.colors.primary}; }
        .issue-low { border-color: ${styling.colors.text}; }
        .recommendation {
            margin: 10px 0;
            padding: 10px;
            background-color: rgba(212, 175, 55, 0.1);
            border-left: 4px solid ${styling.colors.primary};
        }
        .status-pass { color: ${styling.colors.success}; }
        .status-warning { color: ${styling.colors.warning}; }
        .status-fail { color: ${styling.colors.danger}; }
    </style>
</head>
<body>
`;

    // Generate sections
    for (const section of sections.sort((a, b) => a.order - b.order)) {
      if (!section.visible) continue;

      html += await this.generateHTMLSection(section, session, binding, report);
    }

    html += `
</body>
</html>
`;

    return html;
  }

  /**
   * Generate HTML section
   */
  private async generateHTMLSection(
    section: ReportSection,
    session: VanguardSession,
    binding: UseCaseBinding,
    report: VanguardReport
  ): Promise<string> {
    let html = `<div class="section">`;

    switch (section.type) {
      case 'custom':
        if (section.id === 'header') {
          html += `
            <div class="header">
                <h1>${section.title}</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <p>Use Case: ${binding.context.useCase} | Vertical: ${binding.context.vertical}</p>
                <p class="status-${report.status}">Status: ${report.status.toUpperCase()}</p>
            </div>
          `;
        }
        break;

      case 'summary':
        html += `
          <h2>${section.title}</h2>
          <p>Overall Score: <strong>${report.overallScore}/100</strong></p>
          <p>Total Issues: ${report.summary.totalFlags} 
             (Critical: ${report.summary.criticalFlags}, 
              High: ${report.summary.highFlags},
              Medium: ${report.summary.mediumFlags},
              Low: ${report.summary.lowFlags})</p>
        `;
        break;

      case 'scores':
        html += `
          <h2>${section.title}</h2>
          <div class="score-container">
            <div class="score-item score-security">
              <h3>Security</h3>
              <div class="score-value">${report.scores.security}</div>
              <p>Sentinel Score</p>
            </div>
            <div class="score-item score-integrity">
              <h3>Integrity</h3>
              <div class="score-value">${report.scores.integrity}</div>
              <p>Auditor Score</p>
            </div>
            <div class="score-item score-accuracy">
              <h3>Accuracy</h3>
              <div class="score-value">${report.scores.accuracy}</div>
              <p>Engine Score</p>
            </div>
          </div>
        `;
        break;

      case 'issues':
        const severityFilter = section.config?.severityFilter || ['critical', 'high', 'medium', 'low'];
        const filteredIssues = report.criticalIssues.filter(issue => 
          severityFilter.includes(issue.severity)
        );
        
        html += `
          <h2>${section.title}</h2>
          ${filteredIssues.length === 0 ? '<p>No issues found.</p>' : ''}
        `;
        
        for (const issue of filteredIssues) {
          html += `
            <div class="issue issue-${issue.severity}">
              <strong>${issue.type}</strong> (${issue.source}) - ${issue.severity.toUpperCase()}
              <p>${issue.description}</p>
              ${issue.recommendation ? `<p><em>Recommendation: ${issue.recommendation}</em></p>` : ''}
            </div>
          `;
        }
        break;

      case 'recommendations':
        html += `
          <h2>${section.title}</h2>
        `;
        for (const rec of report.recommendations) {
          html += `
            <div class="recommendation">
              ${rec}
            </div>
          `;
        }
        break;

      case 'details':
        const agentType = section.config?.agent as keyof typeof session.results;
        if (agentType && session.results[agentType]) {
          html += `
            <h2>${section.title}</h2>
            <pre>${JSON.stringify(session.results[agentType], null, 2)}</pre>
          `;
        }
        break;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(
    session: VanguardSession,
    binding: UseCaseBinding,
    template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<string> {
    const report = session.aggregatedReport;
    if (!report) {
      throw new Error('No aggregated report available in session');
    }

    const sections = options.customSections || template.sections;
    let markdown = '';

    // Generate sections
    for (const section of sections.sort((a, b) => a.order - b.order)) {
      if (!section.visible) continue;

      markdown += await this.generateMarkdownSection(section, session, binding, report);
      markdown += '\n\n';
    }

    return markdown;
  }

  /**
   * Generate Markdown section
   */
  private async generateMarkdownSection(
    section: ReportSection,
    session: VanguardSession,
    binding: UseCaseBinding,
    report: VanguardReport
  ): Promise<string> {
    let markdown = '';

    switch (section.type) {
      case 'custom':
        if (section.id === 'header') {
          markdown += `# ${section.title}\n\n`;
          markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
          markdown += `**Use Case:** ${binding.context.useCase} | **Vertical:** ${binding.context.vertical}\n\n`;
          markdown += `**Status:** ${report.status.toUpperCase()}\n\n`;
          markdown += '---\n';
        }
        break;

      case 'summary':
        markdown += `## ${section.title}\n\n`;
        markdown += `**Overall Score:** ${report.overallScore}/100\n\n`;
        markdown += `**Total Issues:** ${report.summary.totalFlags}\n`;
        markdown += `- Critical: ${report.summary.criticalFlags}\n`;
        markdown += `- High: ${report.summary.highFlags}\n`;
        markdown += `- Medium: ${report.summary.mediumFlags}\n`;
        markdown += `- Low: ${report.summary.lowFlags}\n`;
        break;

      case 'scores':
        markdown += `## ${section.title}\n\n`;
        markdown += `| Vanguard | Score | Status |\n`;
        markdown += `|----------|-------|--------|\n`;
        markdown += `| Security Sentinel | ${report.scores.security}/100 | ${this.getScoreStatus(report.scores.security)} |\n`;
        markdown += `| Integrity Auditor | ${report.scores.integrity}/100 | ${this.getScoreStatus(report.scores.integrity)} |\n`;
        markdown += `| Accuracy Engine | ${report.scores.accuracy}/100 | ${this.getScoreStatus(report.scores.accuracy)} |\n`;
        break;

      case 'issues':
        const severityFilter = section.config?.severityFilter || ['critical', 'high', 'medium', 'low'];
        const filteredIssues = report.criticalIssues.filter(issue => 
          severityFilter.includes(issue.severity)
        );
        
        markdown += `## ${section.title}\n\n`;
        
        if (filteredIssues.length === 0) {
          markdown += 'No issues found.\n';
        } else {
          for (const issue of filteredIssues) {
            markdown += `### ${issue.type} (${issue.source})\n\n`;
            markdown += `**Severity:** ${issue.severity.toUpperCase()}\n\n`;
            markdown += `${issue.description}\n\n`;
            if (issue.recommendation) {
              markdown += `> **Recommendation:** ${issue.recommendation}\n\n`;
            }
          }
        }
        break;

      case 'recommendations':
        markdown += `## ${section.title}\n\n`;
        for (let i = 0; i < report.recommendations.length; i++) {
          markdown += `${i + 1}. ${report.recommendations[i]}\n`;
        }
        break;

      case 'details':
        const agentType = section.config?.agent as keyof typeof session.results;
        if (agentType && session.results[agentType]) {
          markdown += `## ${section.title}\n\n`;
          markdown += '```json\n';
          markdown += JSON.stringify(session.results[agentType], null, 2);
          markdown += '\n```';
        }
        break;
    }

    return markdown;
  }

  /**
   * Generate PDF report (placeholder - would use a PDF library in production)
   */
  private async generatePDFReport(
    session: VanguardSession,
    binding: UseCaseBinding,
    template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<any> {
    // In a real implementation, this would use a PDF generation library
    // For now, we'll return a structured object that represents the PDF content
    
    const htmlContent = await this.generateHTMLReport(session, binding, template, options);
    
    return {
      format: 'pdf',
      html: htmlContent,
      metadata: {
        title: `Seraphim Vanguards Report - ${binding.context.useCase}`,
        author: 'Seraphim Vanguards System',
        subject: 'AI Governance Analysis Report',
        keywords: ['vanguards', 'analysis', binding.context.vertical, binding.context.useCase],
        creator: 'Seraphim Report Builder v1.0',
      },
      options: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; text-align: center;">Seraphim Vanguards Report</div>',
        footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      },
    };
  }

  /**
   * Get score status
   */
  private getScoreStatus(score: number): string {
    if (score >= 90) return '✅ Excellent';
    if (score >= 75) return '✓ Good';
    if (score >= 60) return '⚠️ Warning';
    if (score >= 40) return '❌ Poor';
    return '🚨 Critical';
  }

  /**
   * Calculate content size
   */
  private calculateContentSize(content: any): number {
    if (typeof content === 'string') {
      return content.length;
    }
    return JSON.stringify(content).length;
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register a new template
   */
  registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
    logger.info(`Registered report template: ${template.name} (${template.id})`);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Update default styling
   */
  updateDefaultStyling(styling: Partial<ReportStyling>): void {
    this.defaultStyling = { ...this.defaultStyling, ...styling };
    logger.info('Updated default report styling');
  }
}

// Export singleton instance
export const reportBuilder = new ReportBuilder();