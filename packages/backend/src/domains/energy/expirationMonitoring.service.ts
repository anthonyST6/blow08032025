import { firestore } from '../../config/firebase';
import {
  ExpirationAlert,
  LandLease,
  LeaseStatus,
  NotificationRecord
} from './types';
import { logger } from '../../utils/logger';
import { FieldValue } from 'firebase-admin/firestore';
import { landLeaseService } from './landLease.service';

export class ExpirationMonitoringService {
  private get alertsCollection() {
    return firestore().collection('expirationAlerts');
  }
  
  private get notificationsCollection() {
    return firestore().collection('notifications');
  }

  async createAlert(
    alert: Omit<ExpirationAlert, 'id' | 'notifications'>
  ): Promise<ExpirationAlert> {
    try {
      const docRef = await this.alertsCollection.add({
        ...alert,
        notifications: [],
        createdAt: new Date()
      });

      const created = await this.getAlert(docRef.id);
      if (!created) {
        throw new Error('Failed to create expiration alert');
      }

      logger.info('Expiration alert created', { alertId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error creating expiration alert', { error });
      throw error;
    }
  }

  async getAlert(alertId: string): Promise<ExpirationAlert | null> {
    try {
      const doc = await this.alertsCollection.doc(alertId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as ExpirationAlert;
    } catch (error) {
      logger.error('Error fetching expiration alert', { alertId, error });
      throw error;
    }
  }

  async updateAlert(
    alertId: string,
    updates: Partial<ExpirationAlert>
  ): Promise<ExpirationAlert> {
    try {
      await this.alertsCollection.doc(alertId).update({
        ...updates,
        updatedAt: new Date()
      });

      const updated = await this.getAlert(alertId);
      if (!updated) {
        throw new Error('Alert not found after update');
      }

      logger.info('Expiration alert updated', { alertId });
      return updated;
    } catch (error) {
      logger.error('Error updating expiration alert', { alertId, error });
      throw error;
    }
  }

  async scanForExpirations(): Promise<ExpirationAlert[]> {
    try {
      const alerts: ExpirationAlert[] = [];
      const now = new Date();

      // Get all active leases
      const activeLeases = await landLeaseService.getLeases();
      const filteredLeases = activeLeases.filter(lease => lease.status === LeaseStatus.ACTIVE);

      for (const lease of filteredLeases) {
        // Check primary term expiration
        const primaryTermAlerts = await this.checkPrimaryTermExpiration(lease, now);
        alerts.push(...primaryTermAlerts);

        // Check rental due dates
        const rentalAlerts = await this.checkRentalDue(lease, now);
        alerts.push(...rentalAlerts);

        // Check option deadlines
        const optionAlerts = await this.checkOptionDeadlines(lease, now);
        alerts.push(...optionAlerts);

        // Check production requirements
        const productionAlerts = await this.checkProductionRequirements(lease, now);
        alerts.push(...productionAlerts);
      }

      logger.info(`Expiration scan completed, found ${alerts.length} alerts`);
      return alerts;
    } catch (error) {
      logger.error('Error scanning for expirations', { error });
      throw error;
    }
  }

  private async checkPrimaryTermExpiration(
    lease: LandLease,
    now: Date
  ): Promise<ExpirationAlert[]> {
    const alerts: ExpirationAlert[] = [];
    const daysUntilExpiration = this.getDaysBetween(now, lease.terms.primaryTerm.endDate);

    // Create alerts at 90, 60, 30, and 7 days before expiration
    const alertThresholds = [90, 60, 30, 7];
    
    for (const threshold of alertThresholds) {
      if (daysUntilExpiration <= threshold && daysUntilExpiration > 0) {
        const severity = this.getSeverity(daysUntilExpiration);
        
        // Check if alert already exists
        const existingAlert = await this.findExistingAlert(
          lease.id,
          'primary_term',
          lease.terms.primaryTerm.endDate
        );

        if (!existingAlert || existingAlert.severity !== severity) {
          const alert = await this.createAlert({
            leaseId: lease.id,
            type: 'primary_term',
            dueDate: lease.terms.primaryTerm.endDate,
            daysUntilDue: daysUntilExpiration,
            severity,
            status: 'active'
          });
          alerts.push(alert);
        }
        break; // Only create one alert per lease
      }
    }

    return alerts;
  }

  private async checkRentalDue(
    lease: LandLease,
    now: Date
  ): Promise<ExpirationAlert[]> {
    const alerts: ExpirationAlert[] = [];
    
    if (!lease.terms.rentals) {
      return alerts;
    }

    // Calculate next rental due date
    const [month, day] = lease.terms.rentals.dueDate.split('-').map(Number);
    const nextDueDate = new Date(now.getFullYear(), month - 1, day);
    
    if (nextDueDate < now) {
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    }

    const daysUntilDue = this.getDaysBetween(now, nextDueDate);

    // Create alert if within 30 days
    if (daysUntilDue <= 30 && daysUntilDue > 0) {
      const existingAlert = await this.findExistingAlert(
        lease.id,
        'rental_due',
        nextDueDate
      );

      if (!existingAlert) {
        const alert = await this.createAlert({
          leaseId: lease.id,
          type: 'rental_due',
          dueDate: nextDueDate,
          daysUntilDue,
          severity: daysUntilDue <= 7 ? 'critical' : 'warning',
          status: 'active'
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private async checkOptionDeadlines(
    lease: LandLease,
    now: Date
  ): Promise<ExpirationAlert[]> {
    const alerts: ExpirationAlert[] = [];
    
    if (!lease.terms.extensions) {
      return alerts;
    }

    for (const extension of lease.terms.extensions) {
      if (extension.exerciseDeadline) {
        const daysUntilDeadline = this.getDaysBetween(now, extension.exerciseDeadline);

        if (daysUntilDeadline <= 60 && daysUntilDeadline > 0) {
          const existingAlert = await this.findExistingAlert(
            lease.id,
            'option_deadline',
            extension.exerciseDeadline
          );

          if (!existingAlert) {
            const alert = await this.createAlert({
              leaseId: lease.id,
              type: 'option_deadline',
              dueDate: extension.exerciseDeadline,
              daysUntilDue: daysUntilDeadline,
              severity: this.getSeverity(daysUntilDeadline),
              status: 'active'
            });
            alerts.push(alert);
          }
        }
      }
    }

    return alerts;
  }

  private async checkProductionRequirements(
    lease: LandLease,
    now: Date
  ): Promise<ExpirationAlert[]> {
    const alerts: ExpirationAlert[] = [];
    
    // Check if lease is approaching end of primary term without production
    if (lease.status === LeaseStatus.ACTIVE) {
      const daysUntilExpiration = this.getDaysBetween(now, lease.terms.primaryTerm.endDate);

      if (daysUntilExpiration <= 180 && daysUntilExpiration > 0) {
        const existingAlert = await this.findExistingAlert(
          lease.id,
          'production_requirement',
          lease.terms.primaryTerm.endDate
        );

        if (!existingAlert) {
          const alert = await this.createAlert({
            leaseId: lease.id,
            type: 'production_requirement',
            dueDate: lease.terms.primaryTerm.endDate,
            daysUntilDue: daysUntilExpiration,
            severity: daysUntilExpiration <= 90 ? 'critical' : 'warning',
            status: 'active'
          });
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }

  async sendNotifications(alertId: string): Promise<void> {
    try {
      const alert = await this.getAlert(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      const lease = await landLeaseService.getLeaseById(alert.leaseId);
      if (!lease) {
        throw new Error('Lease not found');
      }

      // Determine recipients based on alert type and severity
      const recipients = await this.determineRecipients(alert, lease);

      // Send notifications via different channels
      const notificationRecords: NotificationRecord[] = [];

      // Email notifications
      if (recipients.emails.length > 0) {
        const emailRecord = await this.sendEmailNotification(
          recipients.emails,
          alert,
          lease
        );
        notificationRecords.push(emailRecord);
      }

      // SMS notifications for critical alerts
      if (alert.severity === 'critical' && recipients.phones.length > 0) {
        const smsRecord = await this.sendSMSNotification(
          recipients.phones,
          alert,
          lease
        );
        notificationRecords.push(smsRecord);
      }

      // In-app notifications
      const inAppRecord = await this.sendInAppNotification(
        recipients.userIds,
        alert,
        lease
      );
      notificationRecords.push(inAppRecord);

      // Update alert with notification records
      await this.alertsCollection.doc(alertId).update({
        notifications: FieldValue.arrayUnion(...notificationRecords)
      });

      logger.info('Notifications sent for alert', { alertId });
    } catch (error) {
      logger.error('Error sending notifications', { alertId, error });
      throw error;
    }
  }

  private async determineRecipients(
    alert: ExpirationAlert,
    lease: LandLease
  ): Promise<{ emails: string[]; phones: string[]; userIds: string[] }> {
    const emails: string[] = [];
    const phones: string[] = [];
    const userIds: string[] = [];

    // Add lessor contact
    emails.push(lease.lessor.contactInfo.email);
    phones.push(lease.lessor.contactInfo.phone);

    // Add lessee contact
    emails.push(lease.lessee.contactInfo.email);
    phones.push(lease.lessee.contactInfo.phone);

    // Add additional recipients based on alert type
    if (alert.type === 'production_requirement' || alert.severity === 'critical') {
      // Add management contacts
      // This would fetch from a management contacts collection
    }

    return { emails, phones, userIds };
  }

  private async sendEmailNotification(
    recipients: string[],
    alert: ExpirationAlert,
    _lease: LandLease
  ): Promise<NotificationRecord> {
    // In a real implementation, this would send actual emails
    logger.info('Sending email notification', {
      recipients,
      alertType: alert.type
    });

    return {
      sentAt: new Date(),
      sentTo: recipients,
      method: 'email',
      status: 'sent'
    };
  }

  private async sendSMSNotification(
    recipients: string[],
    alert: ExpirationAlert,
    _lease: LandLease
  ): Promise<NotificationRecord> {
    // In a real implementation, this would send actual SMS messages
    logger.info('Sending SMS notification', {
      recipients,
      alertType: alert.type
    });

    return {
      sentAt: new Date(),
      sentTo: recipients,
      method: 'sms',
      status: 'sent'
    };
  }

  private async sendInAppNotification(
    userIds: string[],
    alert: ExpirationAlert,
    lease: LandLease
  ): Promise<NotificationRecord> {
    // Create in-app notifications
    const notification = {
      type: 'expiration_alert',
      alertId: alert.id,
      leaseId: lease.id,
      title: this.getNotificationTitle(alert),
      message: this.getNotificationMessage(alert, lease),
      severity: alert.severity,
      createdAt: new Date(),
      read: false
    };

    // Store notifications for each user
    for (const userId of userIds) {
      await this.notificationsCollection.add({
        ...notification,
        userId
      });
    }

    return {
      sentAt: new Date(),
      sentTo: userIds,
      method: 'in_app',
      status: 'delivered'
    };
  }

  private getNotificationTitle(alert: ExpirationAlert): string {
    switch (alert.type) {
      case 'primary_term':
        return 'Lease Primary Term Expiring';
      case 'rental_due':
        return 'Annual Rental Payment Due';
      case 'option_deadline':
        return 'Lease Extension Option Deadline';
      case 'production_requirement':
        return 'Production Required to Maintain Lease';
      default:
        return 'Lease Alert';
    }
  }

  private getNotificationMessage(
    alert: ExpirationAlert,
    lease: LandLease
  ): string {
    const daysText = alert.daysUntilDue === 1 ? 'day' : 'days';
    
    switch (alert.type) {
      case 'primary_term':
        return `Lease ${lease.leaseNumber} primary term expires in ${alert.daysUntilDue} ${daysText}`;
      case 'rental_due':
        return `Annual rental payment for lease ${lease.leaseNumber} is due in ${alert.daysUntilDue} ${daysText}`;
      case 'option_deadline':
        return `Extension option for lease ${lease.leaseNumber} must be exercised within ${alert.daysUntilDue} ${daysText}`;
      case 'production_requirement':
        return `Production must commence on lease ${lease.leaseNumber} within ${alert.daysUntilDue} ${daysText} to avoid expiration`;
      default:
        return `Action required for lease ${lease.leaseNumber}`;
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      await this.updateAlert(alertId, {
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: new Date()
      });

      logger.info('Alert acknowledged', { alertId, acknowledgedBy });
    } catch (error) {
      logger.error('Error acknowledging alert', { alertId, error });
      throw error;
    }
  }

  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    try {
      await this.updateAlert(alertId, {
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date(),
        resolution
      });

      logger.info('Alert resolved', { alertId, resolvedBy });
    } catch (error) {
      logger.error('Error resolving alert', { alertId, error });
      throw error;
    }
  }

  async getActiveAlerts(): Promise<ExpirationAlert[]> {
    try {
      const snapshot = await this.alertsCollection
        .where('status', '==', 'active')
        .orderBy('daysUntilDue')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ExpirationAlert));
    } catch (error) {
      logger.error('Error fetching active alerts', { error });
      throw error;
    }
  }

  async getAlertsByLease(leaseId: string): Promise<ExpirationAlert[]> {
    try {
      const snapshot = await this.alertsCollection
        .where('leaseId', '==', leaseId)
        .orderBy('dueDate')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ExpirationAlert));
    } catch (error) {
      logger.error('Error fetching alerts by lease', { leaseId, error });
      throw error;
    }
  }

  async getUpcomingAlerts(days: number = 30): Promise<ExpirationAlert[]> {
    try {
      const snapshot = await this.alertsCollection
        .where('status', '==', 'active')
        .where('daysUntilDue', '<=', days)
        .orderBy('daysUntilDue')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ExpirationAlert));
    } catch (error) {
      logger.error('Error fetching upcoming alerts', { error });
      throw error;
    }
  }

  private async findExistingAlert(
    leaseId: string,
    type: string,
    _dueDate: Date
  ): Promise<ExpirationAlert | null> {
    try {
      const snapshot = await this.alertsCollection
        .where('leaseId', '==', leaseId)
        .where('type', '==', type)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as ExpirationAlert;
    } catch (error) {
      logger.error('Error finding existing alert', { error });
      return null;
    }
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getSeverity(daysUntilDue: number): 'info' | 'warning' | 'critical' {
    if (daysUntilDue <= 7) return 'critical';
    if (daysUntilDue <= 30) return 'warning';
    return 'info';
  }
}

export const expirationMonitoringService = new ExpirationMonitoringService();