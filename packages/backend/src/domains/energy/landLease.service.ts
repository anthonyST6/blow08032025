import { firestore } from '../../config/firebase';
import { logger } from '../../utils/logger';
import * as admin from 'firebase-admin';
import {
  LandLease,
  LeaseStatus,
  LeaseEvent,
  EventType,
  Document,
  ExpirationAlert,
  ComplianceRequirement,
  ComplianceStatus,
  ComplianceCategory
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class LandLeaseService {
  private get collection() {
    return firestore().collection('landLeases');
  }
  
  private get alertsCollection() {
    return firestore().collection('expirationAlerts');
  }
  
  private get complianceCollection() {
    return firestore().collection('complianceRequirements');
  }

  // Create a new land lease
  async createLease(leaseData: Partial<LandLease>): Promise<LandLease> {
    try {
      const leaseId = uuidv4();
      const now = new Date();
      
      const lease: LandLease = {
        id: leaseId,
        leaseNumber: this.generateLeaseNumber(),
        status: LeaseStatus.DRAFT,
        documents: [],
        timeline: [{
          id: uuidv4(),
          type: EventType.LEASE_EXECUTED,
          date: now,
          description: 'Lease created in system',
          metadata: { createdBy: leaseData.lessor?.name }
        }],
        createdAt: now,
        updatedAt: now,
        ...leaseData
      } as LandLease;

      await this.collection.doc(leaseId).set(lease);
      
      // Set up initial compliance requirements
      await this.setupInitialCompliance(leaseId);
      
      // Set up expiration monitoring
      await this.setupExpirationMonitoring(lease);

      logger.info('Land lease created', { leaseId, leaseNumber: lease.leaseNumber });
      return lease;
    } catch (error) {
      logger.error('Error creating land lease', error);
      throw error;
    }
  }

  // Update lease information
  async updateLease(leaseId: string, updates: Partial<LandLease>): Promise<LandLease> {
    try {
      const leaseRef = this.collection.doc(leaseId);
      const leaseDoc = await leaseRef.get();
      
      if (!leaseDoc.exists) {
        throw new Error('Lease not found');
      }

      const updatedLease = {
        ...leaseDoc.data(),
        ...updates,
        updatedAt: new Date()
      };

      await leaseRef.update(updatedLease);
      
      // Update monitoring if terms changed
      if (updates.terms || updates.royalties) {
        await this.updateExpirationMonitoring(updatedLease as LandLease);
      }

      logger.info('Land lease updated', { leaseId });
      return updatedLease as LandLease;
    } catch (error) {
      logger.error('Error updating land lease', error);
      throw error;
    }
  }

  // Get lease by ID
  async getLeaseById(leaseId: string): Promise<LandLease | null> {
    try {
      const doc = await this.collection.doc(leaseId).get();
      return doc.exists ? doc.data() as LandLease : null;
    } catch (error) {
      logger.error('Error fetching lease', error);
      throw error;
    }
  }

  // Get all leases with optional filtering
  async getLeases(filters?: {
    status?: LeaseStatus;
    lesseeId?: string;
    lessorId?: string;
    expiringWithinDays?: number;
  }): Promise<LandLease[]> {
    try {
      let query = this.collection as any;

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.lesseeId) {
        query = query.where('lessee.id', '==', filters.lesseeId);
      }
      if (filters?.lessorId) {
        query = query.where('lessor.id', '==', filters.lessorId);
      }

      const snapshot = await query.get();
      let leases = snapshot.docs.map((doc: any) => doc.data() as LandLease);

      // Filter by expiration if needed
      if (filters?.expiringWithinDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + filters.expiringWithinDays);
        
        leases = leases.filter((lease: LandLease) => {
          if (lease.terms.primaryTerm.endDate) {
            return new Date(lease.terms.primaryTerm.endDate) <= cutoffDate;
          }
          return false;
        });
      }

      return leases;
    } catch (error) {
      logger.error('Error fetching leases', error);
      throw error;
    }
  }

  // Add document to lease
  async addDocument(leaseId: string, document: Omit<Document, 'id' | 'uploadedAt'>): Promise<Document> {
    try {
      const doc: Document = {
        ...document,
        id: uuidv4(),
        uploadedAt: new Date()
      };

      const leaseRef = this.collection.doc(leaseId);
      await leaseRef.update({
        documents: admin.firestore.FieldValue.arrayUnion(doc),
        updatedAt: new Date()
      });

      // Add to timeline
      await this.addLeaseEvent(leaseId, {
        type: EventType.LEASE_AMENDED,
        description: `Document added: ${doc.title}`,
        relatedDocuments: [doc.id]
      });

      logger.info('Document added to lease', { leaseId, documentId: doc.id });
      return doc;
    } catch (error) {
      logger.error('Error adding document', error);
      throw error;
    }
  }

  // Add event to lease timeline
  async addLeaseEvent(leaseId: string, eventData: Omit<LeaseEvent, 'id' | 'date'>): Promise<LeaseEvent> {
    try {
      const event: LeaseEvent = {
        ...eventData,
        id: uuidv4(),
        date: new Date()
      };

      const leaseRef = this.collection.doc(leaseId);
      await leaseRef.update({
        timeline: admin.firestore.FieldValue.arrayUnion(event),
        updatedAt: new Date()
      });

      logger.info('Event added to lease timeline', { leaseId, eventType: event.type });
      return event;
    } catch (error) {
      logger.error('Error adding lease event', error);
      throw error;
    }
  }

  // Process rental payment
  async processRentalPayment(leaseId: string, amount: number, paymentDate: Date): Promise<void> {
    try {
      const lease = await this.getLeaseById(leaseId);
      if (!lease) {
        throw new Error('Lease not found');
      }

      // Add payment event
      await this.addLeaseEvent(leaseId, {
        type: EventType.RENTAL_PAID,
        description: `Rental payment received: $${amount}`,
        metadata: { amount, paymentDate }
      });

      // Update lease status if needed
      if (lease.status === LeaseStatus.ACTIVE) {
        // Calculate next rental due date
        const nextDueDate = new Date(paymentDate);
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        
        await this.updateExpirationAlert(leaseId, 'rental_due', nextDueDate);
      }

      logger.info('Rental payment processed', { leaseId, amount });
    } catch (error) {
      logger.error('Error processing rental payment', error);
      throw error;
    }
  }

  // Process royalty payment
  async processRoyaltyPayment(leaseId: string, amount: number, period: string): Promise<void> {
    try {
      await this.addLeaseEvent(leaseId, {
        type: EventType.ROYALTY_PAID,
        description: `Royalty payment for ${period}: $${amount}`,
        metadata: { amount, period }
      });

      logger.info('Royalty payment processed', { leaseId, amount, period });
    } catch (error) {
      logger.error('Error processing royalty payment', error);
      throw error;
    }
  }

  // Rights Expiration Monitoring
  private async setupExpirationMonitoring(lease: LandLease): Promise<void> {
    try {
      const alerts: Partial<ExpirationAlert>[] = [];

      // Primary term expiration
      if (lease.terms.primaryTerm.endDate) {
        alerts.push({
          leaseId: lease.id,
          type: 'primary_term',
          dueDate: new Date(lease.terms.primaryTerm.endDate),
          status: 'active'
        });
      }

      // Annual rental due date
      if (lease.terms.rentals.dueDate) {
        const currentYear = new Date().getFullYear();
        const [month, day] = lease.terms.rentals.dueDate.split('-').map(Number);
        const rentalDueDate = new Date(currentYear, month - 1, day);
        
        if (rentalDueDate < new Date()) {
          rentalDueDate.setFullYear(currentYear + 1);
        }

        alerts.push({
          leaseId: lease.id,
          type: 'rental_due',
          dueDate: rentalDueDate,
          status: 'active'
        });
      }

      // Create alerts
      for (const alertData of alerts) {
        const alert: ExpirationAlert = {
          id: uuidv4(),
          daysUntilDue: this.calculateDaysUntil(alertData.dueDate!),
          severity: this.calculateAlertSeverity(alertData.dueDate!),
          notifications: [],
          ...alertData
        } as ExpirationAlert;

        await this.alertsCollection.doc(alert.id).set(alert);
      }

      logger.info('Expiration monitoring set up', { leaseId: lease.id, alertCount: alerts.length });
    } catch (error) {
      logger.error('Error setting up expiration monitoring', error);
      throw error;
    }
  }

  private async updateExpirationMonitoring(lease: LandLease): Promise<void> {
    // Implementation would update existing alerts based on changed lease terms
    logger.info('Expiration monitoring updated', { leaseId: lease.id });
  }

  private async updateExpirationAlert(leaseId: string, type: string, newDueDate: Date): Promise<void> {
    try {
      const alertsSnapshot = await this.alertsCollection
        .where('leaseId', '==', leaseId)
        .where('type', '==', type)
        .where('status', '==', 'active')
        .get();

      for (const doc of alertsSnapshot.docs) {
        await doc.ref.update({
          dueDate: newDueDate,
          daysUntilDue: this.calculateDaysUntil(newDueDate),
          severity: this.calculateAlertSeverity(newDueDate)
        });
      }
    } catch (error) {
      logger.error('Error updating expiration alert', error);
      throw error;
    }
  }

  // Compliance Automation
  private async setupInitialCompliance(leaseId: string): Promise<void> {
    try {
      const requirements: Partial<ComplianceRequirement>[] = [
        {
          category: ComplianceCategory.REGULATORY,
          description: 'Annual well production reporting',
          frequency: 'annually',
          applicableTo: [leaseId],
          status: ComplianceStatus.COMPLIANT
        },
        {
          category: ComplianceCategory.CONTRACTUAL,
          description: 'Minimum royalty payment verification',
          frequency: 'quarterly',
          applicableTo: [leaseId],
          status: ComplianceStatus.COMPLIANT
        },
        {
          category: ComplianceCategory.ENVIRONMENTAL,
          description: 'Environmental impact assessment',
          frequency: 'annually',
          applicableTo: [leaseId],
          status: ComplianceStatus.PENDING_REVIEW
        }
      ];

      for (const reqData of requirements) {
        const requirement: ComplianceRequirement = {
          id: uuidv4(),
          automationRules: [],
          ...reqData
        } as ComplianceRequirement;

        await this.complianceCollection.doc(requirement.id).set(requirement);
      }

      logger.info('Initial compliance requirements set up', { leaseId });
    } catch (error) {
      logger.error('Error setting up compliance', error);
      throw error;
    }
  }

  // Utility methods
  private generateLeaseNumber(): string {
    const prefix = 'LS';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  private calculateDaysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateAlertSeverity(dueDate: Date): 'info' | 'warning' | 'critical' {
    const daysUntil = this.calculateDaysUntil(dueDate);
    
    if (daysUntil <= 7) return 'critical';
    if (daysUntil <= 30) return 'warning';
    return 'info';
  }

  // Get upcoming expirations
  async getUpcomingExpirations(daysAhead: number = 90): Promise<ExpirationAlert[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

      const snapshot = await this.alertsCollection
        .where('status', '==', 'active')
        .where('dueDate', '<=', cutoffDate)
        .orderBy('dueDate', 'asc')
        .get();

      return snapshot.docs.map(doc => doc.data() as ExpirationAlert);
    } catch (error) {
      logger.error('Error fetching upcoming expirations', error);
      throw error;
    }
  }

  // Get compliance status for a lease
  async getLeaseComplianceStatus(leaseId: string): Promise<ComplianceRequirement[]> {
    try {
      const snapshot = await this.complianceCollection
        .where('applicableTo', 'array-contains', leaseId)
        .get();

      return snapshot.docs.map(doc => doc.data() as ComplianceRequirement);
    } catch (error) {
      logger.error('Error fetching compliance status', error);
      throw error;
    }
  }
}

export const landLeaseService = new LandLeaseService();