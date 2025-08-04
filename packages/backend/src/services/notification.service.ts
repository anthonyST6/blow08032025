import { firestore, getServerTimestamp } from '../config/firebase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { emailService } from './email.service';

export interface NotificationChannel {
  type: 'email' | 'teams' | 'slack' | 'sms' | 'in_app';
  enabled: boolean;
  config: {
    webhookUrl?: string;
    apiKey?: string;
    phoneNumber?: string;
    emailAddress?: string;
    channelId?: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  channels: NotificationChannel['type'][];
  subject?: string;
  bodyTemplate: string;
  variables: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'alert' | 'approval' | 'info' | 'action_required' | 'resolution';
}

export interface Notification {
  id: string;
  templateId?: string;
  recipients: Array<{
    userId?: string;
    email?: string;
    phone?: string;
    teamsUserId?: string;
    slackUserId?: string;
  }>;
  channels: NotificationChannel['type'][];
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  body: string;
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'partial';
  deliveryStatus: Array<{
    channel: NotificationChannel['type'];
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    error?: string;
  }>;
  createdAt: Date;
  sentAt?: Date;
  metadata?: {
    leaseId?: string;
    issueId?: string;
    actionId?: string;
    workflowId?: string;
  };
}

export interface NotificationPreference {
  userId: string;
  channels: {
    email: {
      enabled: boolean;
      address: string;
      categories: string[];
    };
    teams: {
      enabled: boolean;
      userId: string;
      categories: string[];
    };
    slack: {
      enabled: boolean;
      userId: string;
      categories: string[];
    };
    sms: {
      enabled: boolean;
      phoneNumber: string;
      categories: string[];
      criticalOnly: boolean;
    };
    inApp: {
      enabled: boolean;
      categories: string[];
    };
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
  };
  escalation?: {
    enabled: boolean;
    timeout: number; // minutes
    escalateTo: string[]; // user IDs
  };
}

class NotificationService {
  private _db: any;
  
  private get db() {
    if (!this._db) {
      this._db = firestore();
    }
    return this._db;
  }
  
  private readonly COLLECTIONS = {
    NOTIFICATIONS: 'notifications',
    TEMPLATES: 'notificationTemplates',
    PREFERENCES: 'notificationPreferences',
    DELIVERY_LOGS: 'notificationDeliveryLogs',
  };

  private teamsWebhookUrl: string;
  private slackWebhookUrl: string;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioFromNumber: string;

  constructor() {
    this.teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL || '';
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioFromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  /**
   * Send notification using template
   */
  async sendTemplatedNotification(
    templateId: string,
    recipients: Notification['recipients'],
    variables: Record<string, any>,
    metadata?: Notification['metadata']
  ): Promise<Notification> {
    try {
      // Get template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Replace variables in template
      const subject = this.replaceVariables(template.subject || '', variables);
      const body = this.replaceVariables(template.bodyTemplate, variables);

      // Create notification
      const notification: Notification = {
        id: uuidv4(),
        templateId,
        recipients,
        channels: template.channels,
        priority: template.priority,
        subject,
        body,
        data: variables,
        status: 'pending',
        deliveryStatus: template.channels.map(channel => ({
          channel,
          status: 'pending',
        })),
        createdAt: new Date(),
        metadata,
      };

      // Save notification
      await this.saveNotification(notification);

      // Send through each channel
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      logger.error('Failed to send templated notification', { error, templateId });
      throw error;
    }
  }

  /**
   * Send direct notification
   */
  async sendDirectNotification(
    notification: Omit<Notification, 'id' | 'status' | 'deliveryStatus' | 'createdAt'>
  ): Promise<Notification> {
    try {
      const fullNotification: Notification = {
        ...notification,
        id: uuidv4(),
        status: 'pending',
        deliveryStatus: notification.channels.map(channel => ({
          channel,
          status: 'pending',
        })),
        createdAt: new Date(),
      };

      // Save notification
      await this.saveNotification(fullNotification);

      // Send through each channel
      await this.sendNotification(fullNotification);

      return fullNotification;
    } catch (error) {
      logger.error('Failed to send direct notification', { error });
      throw error;
    }
  }

  /**
   * Send notification through all configured channels
   */
  private async sendNotification(notification: Notification): Promise<void> {
    const results = await Promise.allSettled(
      notification.channels.map(channel => 
        this.sendToChannel(notification, channel)
      )
    );

    // Update delivery status
    let allSuccessful = true;
    const deliveryStatus = notification.deliveryStatus.map((status, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        return {
          ...status,
          status: 'sent' as const,
          sentAt: new Date(),
        };
      } else {
        allSuccessful = false;
        return {
          ...status,
          status: 'failed' as const,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });

    // Update notification status
    const overallStatus = allSuccessful ? 'sent' : 
      deliveryStatus.some(d => d.status === 'sent') ? 'partial' : 'failed';

    await this.updateNotificationStatus(notification.id, {
      status: overallStatus,
      deliveryStatus,
      sentAt: new Date(),
    });
  }

  /**
   * Send to specific channel
   */
  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel['type']
  ): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'teams':
        await this.sendToTeams(notification);
        break;
      case 'slack':
        await this.sendToSlack(notification);
        break;
      case 'sms':
        await this.sendSMS(notification);
        break;
      case 'in_app':
        await this.sendInApp(notification);
        break;
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    const emailRecipients = notification.recipients
      .filter(r => r.email)
      .map(r => r.email!);

    if (emailRecipients.length === 0) {
      throw new Error('No email recipients found');
    }

    // Format email body with proper styling
    const htmlBody = this.formatEmailBody(notification);

    await emailService.sendEmail({
      to: emailRecipients,
      subject: notification.subject,
      text: notification.body,
      html: htmlBody,
      priority: notification.priority === 'critical' ? 'high' : 'normal',
    });

    logger.info('Email notification sent', {
      notificationId: notification.id,
      recipients: emailRecipients.length,
    });
  }

  /**
   * Send Teams notification
   */
  private async sendToTeams(notification: Notification): Promise<void> {
    if (!this.teamsWebhookUrl) {
      throw new Error('Teams webhook URL not configured');
    }

    const teamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: this.getPriorityColor(notification.priority),
      summary: notification.subject,
      sections: [
        {
          activityTitle: notification.subject,
          activitySubtitle: new Date().toISOString(),
          text: notification.body,
          markdown: true,
        },
      ],
      potentialAction: this.getTeamsActions(notification),
    };

    const response = await axios.post(this.teamsWebhookUrl, teamsMessage);

    if (response.status !== 200) {
      throw new Error(`Teams API returned status ${response.status}`);
    }

    logger.info('Teams notification sent', { notificationId: notification.id });
  }

  /**
   * Send Slack notification
   */
  private async sendToSlack(notification: Notification): Promise<void> {
    if (!this.slackWebhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const slackMessage = {
      text: notification.subject,
      attachments: [
        {
          color: this.getPriorityColor(notification.priority),
          title: notification.subject,
          text: notification.body,
          footer: 'Seraphim Vanguard',
          ts: Math.floor(Date.now() / 1000),
          actions: this.getSlackActions(notification),
        },
      ],
    };

    const response = await axios.post(this.slackWebhookUrl, slackMessage);

    if (response.status !== 200) {
      throw new Error(`Slack API returned status ${response.status}`);
    }

    logger.info('Slack notification sent', { notificationId: notification.id });
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<void> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      throw new Error('Twilio credentials not configured');
    }

    const smsRecipients = notification.recipients
      .filter(r => r.phone)
      .map(r => r.phone!);

    if (smsRecipients.length === 0) {
      throw new Error('No SMS recipients found');
    }

    // For critical notifications, include more details
    const smsBody = notification.priority === 'critical' 
      ? `URGENT: ${notification.subject}\n${notification.body.substring(0, 140)}...`
      : `${notification.subject}\n${notification.body.substring(0, 140)}...`;

    // Send SMS to each recipient
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
    
    await Promise.all(
      smsRecipients.map(phone => 
        axios.post(
          twilioUrl,
          new URLSearchParams({
            To: phone,
            From: this.twilioFromNumber,
            Body: smsBody,
          }),
          {
            auth: {
              username: this.twilioAccountSid,
              password: this.twilioAuthToken,
            },
          }
        )
      )
    );

    logger.info('SMS notifications sent', {
      notificationId: notification.id,
      recipients: smsRecipients.length,
    });
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(notification: Notification): Promise<void> {
    // Save to user's in-app notification queue
    const batch = this.db.batch();

    for (const recipient of notification.recipients) {
      if (recipient.userId) {
        const inAppNotif = {
          notificationId: notification.id,
          userId: recipient.userId,
          subject: notification.subject,
          body: notification.body,
          priority: notification.priority,
          read: false,
          createdAt: getServerTimestamp(),
          metadata: notification.metadata,
        };

        const docRef = this.db
          .collection('userNotifications')
          .doc(recipient.userId)
          .collection('notifications')
          .doc();

        batch.set(docRef, inAppNotif);
      }
    }

    await batch.commit();

    logger.info('In-app notifications created', {
      notificationId: notification.id,
      recipients: notification.recipients.filter(r => r.userId).length,
    });
  }

  /**
   * Format email body with HTML
   */
  private formatEmailBody(notification: Notification): string {
    const priorityBadge = notification.priority === 'critical' 
      ? '<span style="background-color: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;">CRITICAL</span>'
      : notification.priority === 'high'
      ? '<span style="background-color: #fd7e14; color: white; padding: 2px 8px; border-radius: 3px;">HIGH</span>'
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.subject} ${priorityBadge}</h2>
          </div>
          <div class="content">
            <p>${notification.body.replace(/\n/g, '<br>')}</p>
            ${notification.metadata ? `
              <hr>
              <p style="color: #6c757d; font-size: 14px;">
                ${notification.metadata.leaseId ? `Lease ID: ${notification.metadata.leaseId}<br>` : ''}
                ${notification.metadata.issueId ? `Issue ID: ${notification.metadata.issueId}<br>` : ''}
                ${notification.metadata.actionId ? `Action ID: ${notification.metadata.actionId}<br>` : ''}
              </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from Seraphim Vanguard</p>
            <p>© 2024 Seraphim Vanguard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get priority color
   */
  private getPriorityColor(priority: Notification['priority']): string {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  /**
   * Get Teams action buttons
   */
  private getTeamsActions(notification: Notification): any[] {
    const actions = [];

    if (notification.metadata?.actionId) {
      actions.push({
        '@type': 'OpenUri',
        name: 'View Details',
        targets: [
          {
            os: 'default',
            uri: `${process.env.APP_URL}/actions/${notification.metadata.actionId}`,
          },
        ],
      });
    }

    if (notification.metadata?.issueId) {
      actions.push({
        '@type': 'OpenUri',
        name: 'View Issue',
        targets: [
          {
            os: 'default',
            uri: `${process.env.APP_URL}/issues/${notification.metadata.issueId}`,
          },
        ],
      });
    }

    return actions;
  }

  /**
   * Get Slack action buttons
   */
  private getSlackActions(notification: Notification): any[] {
    const actions = [];

    if (notification.metadata?.actionId) {
      actions.push({
        type: 'button',
        text: 'View Details',
        url: `${process.env.APP_URL}/actions/${notification.metadata.actionId}`,
      });
    }

    if (notification.metadata?.issueId) {
      actions.push({
        type: 'button',
        text: 'View Issue',
        url: `${process.env.APP_URL}/issues/${notification.metadata.issueId}`,
      });
    }

    return actions;
  }

  /**
   * Replace variables in template
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result;
  }

  /**
   * Get notification template
   */
  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    const doc = await this.db
      .collection(this.COLLECTIONS.TEMPLATES)
      .doc(templateId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as NotificationTemplate;
  }

  /**
   * Save notification
   */
  private async saveNotification(notification: Notification): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.NOTIFICATIONS)
      .doc(notification.id)
      .set({
        ...notification,
        createdAt: getServerTimestamp(),
      });
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(
    notificationId: string,
    updates: Partial<Notification>
  ): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.NOTIFICATIONS)
      .doc(notificationId)
      .update({
        ...updates,
        updatedAt: getServerTimestamp(),
      });
  }

  /**
   * Create notification template
   */
  async createTemplate(
    template: Omit<NotificationTemplate, 'id'>
  ): Promise<NotificationTemplate> {
    const templateWithId: NotificationTemplate = {
      ...template,
      id: uuidv4(),
    };

    await this.db
      .collection(this.COLLECTIONS.TEMPLATES)
      .doc(templateWithId.id)
      .set({
        ...templateWithId,
        createdAt: getServerTimestamp(),
      });

    logger.info('Notification template created', { templateId: templateWithId.id });

    return templateWithId;
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference | null> {
    const doc = await this.db
      .collection(this.COLLECTIONS.PREFERENCES)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as NotificationPreference;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.PREFERENCES)
      .doc(userId)
      .set(
        {
          ...preferences,
          userId,
          updatedAt: getServerTimestamp(),
        },
        { merge: true }
      );

    logger.info('User notification preferences updated', { userId });
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  async shouldSendNotification(
    userId: string,
    channel: NotificationChannel['type'],
    category: string,
    priority: Notification['priority']
  ): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    
    if (!preferences) {
      // Default to sending if no preferences set
      return true;
    }

    // Check if channel is enabled
    // Map channel type to preference key
    const channelKey = channel === 'in_app' ? 'inApp' : channel;
    const channelPrefs = preferences.channels[channelKey as keyof typeof preferences.channels];
    if (!channelPrefs?.enabled) {
      return false;
    }

    // Check category preferences
    if (channelPrefs.categories && !channelPrefs.categories.includes(category)) {
      return false;
    }

    // Check SMS critical only setting
    if (channel === 'sms' && 'criticalOnly' in channelPrefs && channelPrefs.criticalOnly && priority !== 'critical') {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours?.enabled && priority !== 'critical') {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.quietHours.start && currentTime <= preferences.quietHours.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create default notification templates
   */
  async createDefaultTemplates(): Promise<void> {
    const templates: Omit<NotificationTemplate, 'id'>[] = [
      {
        name: 'Critical Issue Detected',
        description: 'Sent when a critical certification issue is detected',
        channels: ['email', 'teams', 'slack', 'sms'],
        subject: 'CRITICAL: {{issueTitle}}',
        bodyTemplate: 'A critical issue has been detected:\n\n{{issueDescription}}\n\nAffected Resource: {{resourceId}}\nDetected by: {{detectedBy}}\n\nImmediate action required.',
        variables: ['issueTitle', 'issueDescription', 'resourceId', 'detectedBy'],
        priority: 'critical',
        category: 'alert',
      },
      {
        name: 'Approval Required',
        description: 'Sent when an action requires approval',
        channels: ['email', 'teams', 'slack'],
        subject: 'Approval Required: {{actionTitle}}',
        bodyTemplate: 'Your approval is required for the following action:\n\n{{actionDescription}}\n\nRequested by: {{requestedBy}}\nRisk Level: {{riskLevel}}\n\nPlease review and approve or reject this action.',
        variables: ['actionTitle', 'actionDescription', 'requestedBy', 'riskLevel'],
        priority: 'high',
        category: 'approval',
      },
      {
        name: 'Auto-Fix Completed',
        description: 'Sent when an auto-fix has been successfully applied',
        channels: ['email', 'teams'],
        subject: 'Auto-Fix Applied: {{issueTitle}}',
        bodyTemplate: 'An automated fix has been successfully applied:\n\n{{fixDescription}}\n\nIssue: {{issueTitle}}\nResult: {{result}}\n\nNo further action required.',
        variables: ['issueTitle', 'fixDescription', 'result'],
        priority: 'medium',
        category: 'resolution',
      },
      {
        name: 'Lease Expiration Warning',
        description: 'Sent when a lease is approaching expiration',
        channels: ['email', 'teams'],
        subject: 'Lease Expiration Warning: {{leaseName}}',
        bodyTemplate: 'Lease {{leaseName}} is expiring in {{daysUntilExpiration}} days.\n\nLease ID: {{leaseId}}\nExpiration Date: {{expirationDate}}\nCurrent Status: {{status}}\n\nRecommended Action: {{recommendedAction}}',
        variables: ['leaseName', 'leaseId', 'daysUntilExpiration', 'expirationDate', 'status', 'recommendedAction'],
        priority: 'high',
        category: 'action_required',
      },
      {
        name: 'Weekly Summary',
        description: 'Weekly summary of certification scores and issues',
        channels: ['email'],
        subject: 'Weekly Certification Summary - {{weekEnding}}',
        bodyTemplate: 'Here is your weekly certification summary:\n\nOverall Score: {{overallScore}}\nSecurity: {{securityScore}}\nIntegrity: {{integrityScore}}\nAccuracy: {{accuracyScore}}\n\nIssues Resolved: {{issuesResolved}}\nNew Issues: {{newIssues}}\nPending Actions: {{pendingActions}}',
        variables: ['weekEnding', 'overallScore', 'securityScore', 'integrityScore', 'accuracyScore', 'issuesResolved', 'newIssues', 'pendingActions'],
        priority: 'low',
        category: 'info',
      },
    ];

    for (const template of templates) {
      await this.createTemplate(template);
    }

    logger.info('Default notification templates created');
  }
}

export const notificationService = new NotificationService();