import { firestore } from '../config/firebase';
import { wsServer, AlertData } from '../websocket/server';
import { logger } from '../utils/logger';
import { emailService } from './email.service';

export interface AlertRule {
  id: string;
  name: string;
  type: AlertData['type'];
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
  };
  severity: AlertData['severity'];
  enabled: boolean;
  notificationChannels: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertHistory {
  id: string;
  ruleId: string;
  alert: AlertData;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export class AlertService {
  private alertRulesCollection = firestore().collection('alertRules');
  private alertHistoryCollection = firestore().collection('alertHistory');

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const now = new Date();
    const docRef = await this.alertRulesCollection.add({
      ...rule,
      createdAt: now,
      updatedAt: now,
    });

    const newRule: AlertRule = {
      id: docRef.id,
      ...rule,
      createdAt: now,
      updatedAt: now,
    };

    logger.info(`Alert rule created: ${newRule.name}`);
    return newRule;
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<void> {
    await this.alertRulesCollection.doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });

    logger.info(`Alert rule updated: ${id}`);
  }

  async deleteAlertRule(id: string): Promise<void> {
    await this.alertRulesCollection.doc(id).delete();
    logger.info(`Alert rule deleted: ${id}`);
  }

  async getAlertRules(type?: AlertData['type']): Promise<AlertRule[]> {
    let query = this.alertRulesCollection.where('enabled', '==', true);
    
    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as AlertRule));
  }

  async checkAlertCondition(rule: AlertRule, value: number): Promise<boolean> {
    const { operator, threshold } = rule.condition;

    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  async triggerAlert(
    rule: AlertRule,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const alert: AlertData = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message,
      metadata,
      timestamp: new Date(),
    };

    // Save to history
    await this.alertHistoryCollection.add({
      ruleId: rule.id,
      alert,
      acknowledged: false,
      createdAt: new Date(),
    });

    // Send via WebSocket
    wsServer.sendAlert(alert);

    // Send notifications through configured channels
    await this.sendNotifications(rule, alert);

    logger.warn(`Alert triggered: ${rule.name} - ${message}`);
  }

  private async sendNotifications(rule: AlertRule, alert: AlertData): Promise<void> {
    for (const channel of rule.notificationChannels) {
      try {
        switch (channel) {
          case 'email':
            // Get email recipients based on alert severity and type
            const recipients = await this.getEmailRecipients(rule, alert);
            if (recipients.length > 0) {
              await emailService.sendAlertEmail(recipients, {
                type: alert.type,
                title: alert.title,
                severity: alert.severity,
                description: alert.message,
                affectedResources: alert.metadata?.affectedResources,
                recommendedActions: alert.metadata?.recommendedActions,
              });
              logger.info(`Email notification sent for alert: ${alert.title} to ${recipients.length} recipients`);
            }
            break;
          case 'slack':
            // In a real implementation, send Slack notification
            logger.info(`Slack notification would be sent for alert: ${alert.title}`);
            break;
          case 'webhook':
            // In a real implementation, call webhook
            logger.info(`Webhook would be called for alert: ${alert.title}`);
            break;
        }
      } catch (error) {
        logger.error(`Failed to send notification via ${channel}:`, error);
      }
    }
  }

  private async getEmailRecipients(rule: AlertRule, alert: AlertData): Promise<string[]> {
    const recipients: string[] = [];
    
    // Get admin emails for critical alerts
    if (alert.severity === 'critical') {
      const adminsSnapshot = await firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();
      
      adminsSnapshot.docs.forEach(doc => {
        const user = doc.data();
        if (user.email && user.notificationsEnabled !== false) {
          recipients.push(user.email);
        }
      });
    }
    
    // Get role-based recipients
    if (alert.type === 'security') {
      const securityTeamSnapshot = await firestore()
        .collection('users')
        .where('role', 'in', ['admin', 'ai_risk_officer'])
        .get();
      
      securityTeamSnapshot.docs.forEach(doc => {
        const user = doc.data();
        if (user.email && user.notificationsEnabled !== false && !recipients.includes(user.email)) {
          recipients.push(user.email);
        }
      });
    }
    
    // Get rule-specific recipients if configured
    if (rule.metadata?.emailRecipients) {
      const additionalRecipients = rule.metadata.emailRecipients as string[];
      additionalRecipients.forEach(email => {
        if (!recipients.includes(email)) {
          recipients.push(email);
        }
      });
    }
    
    return recipients;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const snapshot = await this.alertHistoryCollection
      .where('alert.id', '==', alertId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('Alert not found');
    }

    const doc = snapshot.docs[0];
    await doc.ref.update({
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    });

    logger.info(`Alert acknowledged: ${alertId} by ${userId}`);
  }

  async getAlertHistory(
    filters?: {
      type?: AlertData['type'];
      severity?: AlertData['severity'];
      acknowledged?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AlertHistory[]> {
    let query = this.alertHistoryCollection.orderBy('createdAt', 'desc');

    if (filters?.type) {
      query = query.where('alert.type', '==', filters.type);
    }

    if (filters?.severity) {
      query = query.where('alert.severity', '==', filters.severity);
    }

    if (filters?.acknowledged !== undefined) {
      query = query.where('acknowledged', '==', filters.acknowledged);
    }

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    const snapshot = await query.limit(100).get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as AlertHistory));
  }

  // Monitoring methods that check metrics and trigger alerts
  async checkAccuracyAlerts(accuracy: number, promptId: string): Promise<void> {
    const rules = await this.getAlertRules('accuracy');
    
    for (const rule of rules) {
      if (rule.condition.metric === 'accuracy' && await this.checkAlertCondition(rule, accuracy)) {
        await this.triggerAlert(
          rule,
          `Accuracy ${rule.condition.operator} ${rule.condition.threshold}: ${accuracy.toFixed(2)}`,
          { promptId, accuracy }
        );
      }
    }
  }

  async checkBiasAlerts(biasScore: number, promptId: string): Promise<void> {
    const rules = await this.getAlertRules('bias');
    
    for (const rule of rules) {
      if (rule.condition.metric === 'biasScore' && await this.checkAlertCondition(rule, biasScore)) {
        await this.triggerAlert(
          rule,
          `Bias score ${rule.condition.operator} ${rule.condition.threshold}: ${biasScore.toFixed(2)}`,
          { promptId, biasScore }
        );
      }
    }
  }

  async checkPerformanceAlerts(responseTime: number, endpoint: string): Promise<void> {
    const rules = await this.getAlertRules('performance');
    
    for (const rule of rules) {
      if (rule.condition.metric === 'responseTime' && await this.checkAlertCondition(rule, responseTime)) {
        await this.triggerAlert(
          rule,
          `Response time ${rule.condition.operator} ${rule.condition.threshold}ms: ${responseTime}ms`,
          { endpoint, responseTime }
        );
      }
    }
  }

  async checkSecurityAlerts(event: string, details: Record<string, any>): Promise<void> {
    const rules = await this.getAlertRules('security');
    
    // For security alerts, we trigger based on event type rather than numeric threshold
    for (const rule of rules) {
      if (rule.condition.metric === event) {
        await this.triggerAlert(
          rule,
          `Security event detected: ${event}`,
          details
        );
      }
    }
  }
}

export const alertService = new AlertService();