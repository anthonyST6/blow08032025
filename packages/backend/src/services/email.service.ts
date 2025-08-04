// Mock nodemailer types for development
type Transporter = any;

import { logger } from '../utils/logger';
import { collections } from '../config/firebase';

// Mock nodemailer for development
const nodemailer = {
  createTransporter: (config: any): any => {
    logger.info('Mock email transporter created', config);
    return {
      sendMail: async (options: any) => {
        logger.info('Mock email sent', options);
        return { messageId: `mock-${Date.now()}` };
      },
      verify: async () => {
        logger.info('Mock email transporter verified');
        return true;
      }
    };
  },
  createTestAccount: async () => {
    return {
      user: 'mock@ethereal.email',
      pass: 'mockpass',
      web: 'https://ethereal.email'
    };
  },
  getTestMessageUrl: (info: any) => {
    return `https://ethereal.email/message/${info.messageId}`;
  }
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables: string[];
}

export interface EmailLog {
  id: string;
  to: string[];
  subject: string;
  template?: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt?: Date;
  messageId?: string;
  metadata?: Record<string, any>;
}

class EmailService {
  private transporter: Transporter | null = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize the email transporter with SMTP configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production SMTP configuration
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        // Development: Use Ethereal Email for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        logger.info('Email service using Ethereal test account', {
          user: testAccount.user,
          web: 'https://ethereal.email',
        });
      }

      // Verify transporter configuration
      await this.transporter.verify();
      this.isInitialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', error);
      throw error;
    }
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates(): void {
    // Alert notification template
    this.templates.set('alert', {
      id: 'alert',
      name: 'Alert Notification',
      subject: '🚨 {{alertType}} Alert: {{alertTitle}}',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
            .alert-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .critical { background-color: #dc3545; color: white; }
            .high { background-color: #fd7e14; color: white; }
            .medium { background-color: #ffc107; color: #333; }
            .low { background-color: #28a745; color: white; }
            .content { background-color: white; padding: 20px; border: 1px solid #dee2e6; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Seraphim Vanguards Alert</h2>
              <span class="alert-badge {{severity}}">{{severity}} Priority</span>
            </div>
            <div class="content">
              <h3>{{alertTitle}}</h3>
              <p><strong>Type:</strong> {{alertType}}</p>
              <p><strong>Time:</strong> {{timestamp}}</p>
              <p><strong>Description:</strong></p>
              <p>{{description}}</p>
              {{#if affectedResources}}
              <p><strong>Affected Resources:</strong></p>
              <ul>
                {{#each affectedResources}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              {{#if recommendedActions}}
              <p><strong>Recommended Actions:</strong></p>
              <ul>
                {{#each recommendedActions}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              <a href="{{dashboardUrl}}" class="button">View in Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated alert from Seraphim Vanguards AI Governance Platform</p>
              <p>To manage your notification preferences, visit your account settings</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
Seraphim Vanguards Alert

{{alertType}} Alert: {{alertTitle}}
Severity: {{severity}}
Time: {{timestamp}}

Description:
{{description}}

{{#if affectedResources}}
Affected Resources:
{{#each affectedResources}}
- {{this}}
{{/each}}
{{/if}}

{{#if recommendedActions}}
Recommended Actions:
{{#each recommendedActions}}
- {{this}}
{{/each}}
{{/if}}

View in Dashboard: {{dashboardUrl}}

This is an automated alert from Seraphim Vanguards AI Governance Platform
      `,
      variables: ['alertType', 'alertTitle', 'severity', 'timestamp', 'description', 'affectedResources', 'recommendedActions', 'dashboardUrl'],
    });

    // Workflow completion template
    this.templates.set('workflow-complete', {
      id: 'workflow-complete',
      name: 'Workflow Completion',
      subject: '✅ Workflow Completed: {{workflowName}}',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 20px; border: 1px solid #dee2e6; }
            .status { font-size: 18px; font-weight: bold; color: #28a745; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .metric-label { font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Workflow Completed Successfully</h2>
            </div>
            <div class="content">
              <p class="status">✅ {{workflowName}} has completed</p>
              <div>
                <div class="metric">
                  <div class="metric-value">{{duration}}</div>
                  <div class="metric-label">Duration</div>
                </div>
                <div class="metric">
                  <div class="metric-value">{{stepsCompleted}}</div>
                  <div class="metric-label">Steps Completed</div>
                </div>
              </div>
              <h3>Summary</h3>
              <p>{{summary}}</p>
              {{#if results}}
              <h3>Key Results</h3>
              <ul>
                {{#each results}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              <p><a href="{{resultsUrl}}">View Full Results →</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
Workflow Completed Successfully

{{workflowName}} has completed

Duration: {{duration}}
Steps Completed: {{stepsCompleted}}

Summary:
{{summary}}

{{#if results}}
Key Results:
{{#each results}}
- {{this}}
{{/each}}
{{/if}}

View Full Results: {{resultsUrl}}
      `,
      variables: ['workflowName', 'duration', 'stepsCompleted', 'summary', 'results', 'resultsUrl'],
    });

    // Analysis report template
    this.templates.set('analysis-report', {
      id: 'analysis-report',
      name: 'Analysis Report',
      subject: '📊 Analysis Report: {{analysisType}}',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 20px; border: 1px solid #dee2e6; }
            .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
            .score.good { color: #28a745; }
            .score.warning { color: #ffc107; }
            .score.danger { color: #dc3545; }
            .flag { padding: 10px; margin: 10px 0; border-left: 4px solid; }
            .flag.critical { border-color: #dc3545; background-color: #f8d7da; }
            .flag.high { border-color: #fd7e14; background-color: #fff3cd; }
            .flag.medium { border-color: #ffc107; background-color: #fff3cd; }
            .flag.low { border-color: #28a745; background-color: #d4edda; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>AI Governance Analysis Report</h2>
            </div>
            <div class="content">
              <h3>{{analysisType}} Analysis</h3>
              <p><strong>Prompt:</strong> {{promptPreview}}</p>
              <p><strong>Model:</strong> {{model}}</p>
              <p><strong>Analyzed:</strong> {{timestamp}}</p>
              
              <div class="score {{scoreClass}}">{{overallScore}}%</div>
              
              {{#if flags}}
              <h3>Flags Raised</h3>
              {{#each flags}}
              <div class="flag {{this.severity}}">
                <strong>{{this.type}}</strong>: {{this.message}}
              </div>
              {{/each}}
              {{/if}}
              
              {{#if recommendations}}
              <h3>Recommendations</h3>
              <ul>
                {{#each recommendations}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              
              <p><a href="{{detailsUrl}}">View Full Analysis →</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
AI Governance Analysis Report

{{analysisType}} Analysis

Prompt: {{promptPreview}}
Model: {{model}}
Analyzed: {{timestamp}}

Overall Score: {{overallScore}}%

{{#if flags}}
Flags Raised:
{{#each flags}}
- {{this.severity}}: {{this.type}} - {{this.message}}
{{/each}}
{{/if}}

{{#if recommendations}}
Recommendations:
{{#each recommendations}}
- {{this}}
{{/each}}
{{/if}}

View Full Analysis: {{detailsUrl}}
      `,
      variables: ['analysisType', 'promptPreview', 'model', 'timestamp', 'overallScore', 'scoreClass', 'flags', 'recommendations', 'detailsUrl'],
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const emailLog: Partial<EmailLog> = {
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      status: 'pending',
      metadata: {
        cc: options.cc,
        bcc: options.bcc,
        priority: options.priority,
      },
    };

    try {
      const mailOptions: any = {
        from: process.env.SMTP_FROM || '"Seraphim Vanguards" <noreply@seraphim-vanguards.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        replyTo: options.replyTo,
        priority: options.priority,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      emailLog.messageId = info.messageId;

      // Log email in development
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Email sent (dev)', {
          messageId: info.messageId,
          preview: nodemailer.getTestMessageUrl(info),
        });
      }

      // Store email log
      await this.logEmail(emailLog as EmailLog);

      return info.messageId;
    } catch (error) {
      emailLog.status = 'failed';
      emailLog.error = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logEmail(emailLog as EmailLog);
      
      logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
      throw error;
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplatedEmail(
    templateId: string,
    to: string | string[],
    variables: Record<string, any>,
    options?: Partial<EmailOptions>
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Email template '${templateId}' not found`);
    }

    // Simple template variable replacement
    let html = template.htmlTemplate;
    let text = template.textTemplate || '';
    let subject = template.subject;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const valueStr = String(value);
      html = html.replace(regex, valueStr);
      text = text.replace(regex, valueStr);
      subject = subject.replace(regex, valueStr);
    });

    // Handle conditionals (simple implementation)
    html = this.processConditionals(html, variables);
    text = this.processConditionals(text, variables);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      ...options,
    });
  }

  /**
   * Process simple template conditionals
   */
  private processConditionals(template: string, variables: Record<string, any>): string {
    // Handle {{#if variable}} ... {{/if}}
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    template = template.replace(ifRegex, (_match, varName, content) => {
      return variables[varName] ? content : '';
    });

    // Handle {{#each array}} ... {{/each}}
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    template = template.replace(eachRegex, (_match, varName, content) => {
      const array = variables[varName];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        return content.replace(/{{this}}/g, String(item));
      }).join('');
    });

    return template;
  }

  /**
   * Send alert notification email
   */
  async sendAlertEmail(
    to: string | string[],
    alert: {
      type: string;
      title: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      affectedResources?: string[];
      recommendedActions?: string[];
    }
  ): Promise<string> {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts`;
    
    return this.sendTemplatedEmail('alert', to, {
      alertType: alert.type,
      alertTitle: alert.title,
      severity: alert.severity,
      timestamp: new Date().toLocaleString(),
      description: alert.description,
      affectedResources: alert.affectedResources,
      recommendedActions: alert.recommendedActions,
      dashboardUrl,
    });
  }

  /**
   * Send workflow completion email
   */
  async sendWorkflowCompletionEmail(
    to: string | string[],
    workflow: {
      name: string;
      duration: string;
      stepsCompleted: number;
      summary: string;
      results?: string[];
      executionId: string;
    }
  ): Promise<string> {
    const resultsUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/workflows/${workflow.executionId}`;
    
    return this.sendTemplatedEmail('workflow-complete', to, {
      workflowName: workflow.name,
      duration: workflow.duration,
      stepsCompleted: workflow.stepsCompleted,
      summary: workflow.summary,
      results: workflow.results,
      resultsUrl,
    });
  }

  /**
   * Send analysis report email
   */
  async sendAnalysisReportEmail(
    to: string | string[],
    analysis: {
      type: string;
      promptPreview: string;
      model: string;
      overallScore: number;
      flags?: Array<{ type: string; severity: string; message: string }>;
      recommendations?: string[];
      analysisId: string;
    }
  ): Promise<string> {
    const detailsUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/analysis/${analysis.analysisId}`;
    const scoreClass = analysis.overallScore >= 80 ? 'good' : analysis.overallScore >= 60 ? 'warning' : 'danger';
    
    return this.sendTemplatedEmail('analysis-report', to, {
      analysisType: analysis.type,
      promptPreview: analysis.promptPreview.substring(0, 100) + '...',
      model: analysis.model,
      timestamp: new Date().toLocaleString(),
      overallScore: analysis.overallScore,
      scoreClass,
      flags: analysis.flags,
      recommendations: analysis.recommendations,
      detailsUrl,
    });
  }

  /**
   * Log email to database
   */
  private async logEmail(emailLog: EmailLog): Promise<void> {
    try {
      await collections.emailLogs.add({
        ...emailLog,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log email', error);
    }
  }

  /**
   * Get email logs
   */
  async getEmailLogs(
    filters?: {
      status?: 'sent' | 'failed' | 'pending';
      startDate?: Date;
      endDate?: Date;
      to?: string;
    },
    limit: number = 100
  ): Promise<EmailLog[]> {
    let query = collections.emailLogs.orderBy('createdAt', 'desc').limit(limit);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.startDate) {
      query = query.where('sentAt', '>=', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.where('sentAt', '<=', filters.endDate);
    }

    if (filters?.to) {
      query = query.where('to', 'array-contains', filters.to);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as EmailLog));
  }

  /**
   * Resend a failed email
   */
  async resendEmail(emailLogId: string): Promise<string> {
    const doc = await collections.emailLogs.doc(emailLogId).get();
    if (!doc.exists) {
      throw new Error('Email log not found');
    }

    const emailLog = doc.data() as EmailLog;
    if (emailLog.status !== 'failed') {
      throw new Error('Can only resend failed emails');
    }

    // Attempt to resend
    return this.sendEmail({
      to: emailLog.to,
      subject: emailLog.subject,
      // Note: We don't store the original HTML/text, so this would need to be reconstructed
      text: `This is a resend of a previously failed email.\n\nOriginal subject: ${emailLog.subject}`,
    });
  }
}

export const emailService = new EmailService();