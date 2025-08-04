import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { collections } from '../config/firebase';
import { auditTrailService } from './audit-trail.service';
import {
  optimizationVanguard,
  negotiationVanguard,
  type OptimizationInput,
  type NegotiationInput
} from '../vanguards';

export interface Lease {
  id: string;
  leaseNumber: string;
  lessee: {
    name: string;
    type: 'individual' | 'corporation' | 'trust';
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  lessor: {
    name: string;
    type: 'individual' | 'corporation' | 'trust';
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  property: {
    description: string;
    acreage: number;
    location: {
      county: string;
      state: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      boundaries?: Array<{ lat: number; lng: number }>;
    };
    mineralRights: string[];
  };
  terms: {
    effectiveDate: Date;
    expirationDate: Date;
    primaryTerm: number; // years
    royaltyRate: number; // percentage
    bonusPayment: number; // per acre
    extensionOptions?: string[];
    specialClauses?: string[];
  };
  financial: {
    annualRevenue: number;
    totalInvestment: number;
    productionData?: Array<{
      date: Date;
      volume: number;
      revenue: number;
    }>;
  };
  status: 'active' | 'under_review' | 'pending' | 'expiring_soon' | 'expired' | 'terminated';
  compliance: {
    lastReviewDate?: Date;
    issues?: string[];
    certifications?: Array<{
      type: string;
      date: Date;
      status: 'valid' | 'expired' | 'pending';
    }>;
  };
  documents: Array<{
    id: string;
    type: 'lease' | 'amendment' | 'map' | 'correspondence' | 'compliance';
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  agentHistory: Array<{
    agentId: string;
    agentName: string;
    action: string;
    timestamp: Date;
    result: any;
    confidence?: number;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    tags?: string[];
  };
}

export interface LeaseFilter {
  status?: Lease['status'] | Lease['status'][];
  expiringWithinDays?: number;
  county?: string;
  state?: string;
  minRevenue?: number;
  maxRevenue?: number;
  tags?: string[];
}

export interface LeaseAction {
  id: string;
  leaseId: string;
  type: 'renew' | 'terminate' | 'renegotiate' | 'review' | 'update';
  initiatedBy: 'system' | 'user' | 'agent';
  initiatorId: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details: any;
  result?: any;
  error?: string;
}

export interface LeaseMetrics {
  totalLeases: number;
  byStatus: Record<Lease['status'], number>;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  totalAnnualRevenue: number;
  averageRoyaltyRate: number;
  totalAcreage: number;
}

class LeaseService {
  /**
   * Get all leases with optional filters
   */
  async getLeases(filters?: LeaseFilter): Promise<Lease[]> {
    try {
      let query = collections.leases.orderBy('metadata.updatedAt', 'desc');

      // Apply filters
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.where('status', 'in', filters.status);
        } else {
          query = query.where('status', '==', filters.status);
        }
      }

      if (filters?.county) {
        query = query.where('property.location.county', '==', filters.county);
      }

      if (filters?.state) {
        query = query.where('property.location.state', '==', filters.state);
      }

      if (filters?.minRevenue) {
        query = query.where('financial.annualRevenue', '>=', filters.minRevenue);
      }

      if (filters?.maxRevenue) {
        query = query.where('financial.annualRevenue', '<=', filters.maxRevenue);
      }

      const snapshot = await query.get();
      const leases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Lease));

      // Apply additional filters that can't be done in Firestore
      let filteredLeases = leases;

      if (filters?.expiringWithinDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + filters.expiringWithinDays);
        
        filteredLeases = filteredLeases.filter(lease => {
          const expirationDate = new Date(lease.terms.expirationDate);
          return expirationDate <= cutoffDate && expirationDate > new Date();
        });
      }

      if (filters?.tags && filters.tags.length > 0) {
        filteredLeases = filteredLeases.filter(lease =>
          filters.tags!.some(tag => lease.metadata.tags?.includes(tag))
        );
      }

      // Update status based on expiration
      filteredLeases = await Promise.all(
        filteredLeases.map(lease => this.updateLeaseStatus(lease))
      );

      return filteredLeases;
    } catch (error) {
      logger.error('Failed to get leases', { error, filters });
      throw error;
    }
  }

  /**
   * Get lease by ID with full details
   */
  async getLeaseById(id: string): Promise<Lease | null> {
    try {
      const doc = await collections.leases.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const lease = {
        id: doc.id,
        ...doc.data(),
      } as Lease;

      // Update status if needed
      return this.updateLeaseStatus(lease);
    } catch (error) {
      logger.error('Failed to get lease by ID', { error, id });
      throw error;
    }
  }

  /**
   * Create a new lease
   */
  async createLease(leaseData: Omit<Lease, 'id' | 'agentHistory' | 'metadata'>): Promise<Lease> {
    try {
      const lease: Lease = {
        ...leaseData,
        id: uuidv4(),
        agentHistory: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system', // In production, get from auth context
          lastModifiedBy: 'system',
        },
      };

      await collections.leases.doc(lease.id).set(lease);
      
      // Log to audit trail
      await auditTrailService.logLeaseAction(
        'system',
        'system@seraphim.com',
        'create',
        lease.id,
        {
          leaseNumber: lease.leaseNumber,
          lessee: lease.lessee.name,
          lessor: lease.lessor.name,
          property: lease.property.description,
          status: lease.status,
        }
      );
      
      logger.info('Lease created', { leaseId: lease.id });
      return lease;
    } catch (error) {
      logger.error('Failed to create lease', { error });
      throw error;
    }
  }

  /**
   * Update lease
   */
  async updateLease(id: string, updates: Partial<Lease>): Promise<Lease | null> {
    try {
      const lease = await this.getLeaseById(id);
      if (!lease) {
        return null;
      }

      const updatedLease = {
        ...lease,
        ...updates,
        metadata: {
          ...lease.metadata,
          updatedAt: new Date(),
          lastModifiedBy: 'system', // In production, get from auth context
        },
      };

      await collections.leases.doc(id).set(updatedLease);
      
      // Log to audit trail
      await auditTrailService.logLeaseAction(
        'system',
        'system@seraphim.com',
        'update',
        id,
        {
          updates: Object.keys(updates),
          previousStatus: lease.status,
          newStatus: updatedLease.status,
        }
      );
      
      logger.info('Lease updated', { leaseId: id });
      return updatedLease;
    } catch (error) {
      logger.error('Failed to update lease', { error, id });
      throw error;
    }
  }

  /**
   * Update lease status based on expiration date
   */
  private async updateLeaseStatus(lease: Lease): Promise<Lease> {
    const now = new Date();
    const expirationDate = new Date(lease.terms.expirationDate);
    const daysToExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let newStatus: Lease['status'] = lease.status;

    if (lease.status !== 'terminated') {
      if (daysToExpiration < 0) {
        newStatus = 'expired';
      } else if (daysToExpiration <= 90) {
        newStatus = 'expiring_soon';
      } else if (lease.status === 'expired' || lease.status === 'expiring_soon') {
        newStatus = 'active';
      }
    }

    if (newStatus !== lease.status) {
      lease.status = newStatus;
      // Update in database
      await collections.leases.doc(lease.id).update({ status: newStatus });
    }

    return lease;
  }

  /**
   * Execute an action on a lease
   */
  async executeLeaseAction(
    leaseId: string,
    action: LeaseAction['type'],
    details?: any
  ): Promise<LeaseAction> {
    try {
      const lease = await this.getLeaseById(leaseId);
      if (!lease) {
        throw new Error('Lease not found');
      }

      const leaseAction: LeaseAction = {
        id: uuidv4(),
        leaseId,
        type: action,
        initiatedBy: 'system',
        initiatorId: 'system',
        timestamp: new Date(),
        status: 'in_progress',
        details,
      };

      // Store action
      await collections.leaseActions.doc(leaseAction.id).set(leaseAction);

      // Execute action based on type
      try {
        let result;
        
        switch (action) {
          case 'renew':
            result = await this.renewLease(lease);
            break;
          
          case 'terminate':
            result = await this.terminateLease(lease);
            break;
          
          case 'renegotiate':
            result = await this.renegotiateLease(lease);
            break;
          
          case 'review':
            result = await this.reviewLease(lease);
            break;
          
          case 'update':
            result = await this.updateLease(leaseId, details);
            break;
          
          default:
            throw new Error(`Unknown action type: ${action}`);
        }

        // Update action status
        leaseAction.status = 'completed';
        leaseAction.result = result;
        
        // Log to audit trail
        await auditTrailService.logLeaseAction(
          'system',
          'system@seraphim.com',
          action,
          leaseId,
          {
            actionId: leaseAction.id,
            result,
          }
        );
        
      } catch (error) {
        leaseAction.status = 'failed';
        leaseAction.error = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Lease action failed', { error, leaseId, action });
      }

      // Update action record
      await collections.leaseActions.doc(leaseAction.id).set(leaseAction);
      
      return leaseAction;
    } catch (error) {
      logger.error('Failed to execute lease action', { error, leaseId, action });
      throw error;
    }
  }

  /**
   * Renew a lease
   */
  private async renewLease(lease: Lease): Promise<any> {
    // Calculate new expiration date
    const newExpirationDate = new Date(lease.terms.expirationDate);
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + lease.terms.primaryTerm);

    // Update lease
    const updatedLease = await this.updateLease(lease.id, {
      status: 'active',
      terms: {
        ...lease.terms,
        expirationDate: newExpirationDate,
      },
    });

    // Record agent action
    await this.recordAgentAction(lease.id, {
      agentId: 'system',
      agentName: 'System',
      action: 'Renewed lease',
      result: {
        newExpirationDate,
        termLength: lease.terms.primaryTerm,
      },
    });

    return {
      success: true,
      newExpirationDate,
      lease: updatedLease,
    };
  }

  /**
   * Terminate a lease
   */
  private async terminateLease(lease: Lease): Promise<any> {
    const updatedLease = await this.updateLease(lease.id, {
      status: 'terminated',
    });

    await this.recordAgentAction(lease.id, {
      agentId: 'system',
      agentName: 'System',
      action: 'Terminated lease',
      result: {
        terminationDate: new Date(),
      },
    });

    return {
      success: true,
      terminationDate: new Date(),
      lease: updatedLease,
    };
  }

  /**
   * Initiate lease renegotiation
   */
  private async renegotiateLease(lease: Lease): Promise<any> {
    // Use Negotiation Vanguard to analyze and prepare package
    const negotiationInput: NegotiationInput = {
      id: uuidv4(),
      promptId: 'lease-negotiation',
      model: 'negotiation-vanguard',
      modelVersion: '1.0.0',
      text: `Analyze lease ${lease.leaseNumber} for renegotiation`,
      rawResponse: {},
      timestamp: new Date(),
      contractData: {
        leaseId: lease.id,
        currentTerms: {
          royaltyRate: lease.terms.royaltyRate,
          bonusPayment: lease.terms.bonusPayment,
          primaryTerm: lease.terms.primaryTerm,
          extensionOptions: lease.terms.extensionOptions,
        },
        counterpartyInfo: {
          name: lease.lessor.name,
          type: lease.lessor.type,
        },
      },
      marketBenchmarks: {
        avgRoyaltyRate: 15, // In production, fetch from market data
        avgBonusPerAcre: 750,
        typicalTermLength: 3,
      },
      negotiationContext: {
        urgency: lease.status === 'expiring_soon' ? 'high' : 'medium',
        leverage: 'neutral',
        objectives: ['Improve royalty rate', 'Extend term', 'Add protective clauses'],
      },
    };

    const negotiationResult = await negotiationVanguard.analyze(negotiationInput);

    // Update lease status
    await this.updateLease(lease.id, {
      status: 'under_review',
    });

    // Record agent action
    await this.recordAgentAction(lease.id, {
      agentId: negotiationVanguard.id,
      agentName: negotiationVanguard.name,
      action: 'Generated negotiation package',
      result: negotiationResult,
      confidence: negotiationResult.confidence,
    });

    return {
      success: true,
      negotiationPackage: negotiationResult.negotiationPackage,
      proposedTerms: negotiationResult.proposedTerms,
      strategy: negotiationResult.negotiationStrategy,
    };
  }

  /**
   * Review lease for optimization
   */
  private async reviewLease(lease: Lease): Promise<any> {
    // Use Optimization Vanguard to analyze
    const optimizationInput: OptimizationInput = {
      id: uuidv4(),
      promptId: 'lease-review',
      model: 'optimization-vanguard',
      modelVersion: '1.0.0',
      text: `Review lease ${lease.leaseNumber} for optimization`,
      rawResponse: {},
      timestamp: new Date(),
      leaseData: [{
        id: lease.id,
        expirationDate: lease.terms.expirationDate,
        annualRevenue: lease.financial.annualRevenue,
        royaltyRate: lease.terms.royaltyRate,
        acreage: lease.property.acreage,
        productionData: lease.financial.productionData,
      }],
      marketConditions: {
        oilPrice: 75, // In production, fetch from market data
        gasPrice: 3.5,
        demandForecast: 'stable',
      },
    };

    const optimizationResult = await optimizationVanguard.analyze(optimizationInput);

    // Record agent action
    await this.recordAgentAction(lease.id, {
      agentId: optimizationVanguard.id,
      agentName: optimizationVanguard.name,
      action: 'Performed optimization analysis',
      result: optimizationResult,
      confidence: optimizationResult.confidence,
    });

    return {
      success: true,
      recommendations: optimizationResult.recommendations,
      financialMetrics: optimizationResult.financialMetrics,
    };
  }

  /**
   * Get agent history for a lease
   */
  async getLeaseAgentHistory(leaseId: string): Promise<Lease['agentHistory']> {
    try {
      const lease = await this.getLeaseById(leaseId);
      if (!lease) {
        throw new Error('Lease not found');
      }

      return lease.agentHistory || [];
    } catch (error) {
      logger.error('Failed to get lease agent history', { error, leaseId });
      throw error;
    }
  }

  /**
   * Record an agent action on a lease
   */
  async recordAgentAction(
    leaseId: string,
    action: Omit<Lease['agentHistory'][0], 'timestamp'>
  ): Promise<void> {
    try {
      const lease = await this.getLeaseById(leaseId);
      if (!lease) {
        throw new Error('Lease not found');
      }

      const agentAction = {
        ...action,
        timestamp: new Date(),
      };

      const updatedHistory = [...(lease.agentHistory || []), agentAction];

      await this.updateLease(leaseId, {
        agentHistory: updatedHistory,
      });

      // Log to audit trail
      await auditTrailService.logAgentAction(
        'system',
        'system@seraphim.com',
        action.action,
        action.agentId,
        {
          agentName: action.agentName,
          targetType: 'lease',
          targetId: leaseId,
          result: action.result,
          confidence: action.confidence,
        }
      );
      
      logger.info('Agent action recorded', { leaseId, agentId: action.agentId });
    } catch (error) {
      logger.error('Failed to record agent action', { error, leaseId });
      throw error;
    }
  }

  /**
   * Get lease metrics
   */
  async getLeaseMetrics(): Promise<LeaseMetrics> {
    try {
      const leases = await this.getLeases();
      
      const now = new Date();
      const metrics: LeaseMetrics = {
        totalLeases: leases.length,
        byStatus: {
          active: 0,
          under_review: 0,
          pending: 0,
          expiring_soon: 0,
          expired: 0,
          terminated: 0,
        },
        expiringIn30Days: 0,
        expiringIn60Days: 0,
        expiringIn90Days: 0,
        totalAnnualRevenue: 0,
        averageRoyaltyRate: 0,
        totalAcreage: 0,
      };

      let totalRoyaltyRate = 0;

      for (const lease of leases) {
        // Count by status
        metrics.byStatus[lease.status]++;

        // Count expiring leases
        const expirationDate = new Date(lease.terms.expirationDate);
        const daysToExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiration > 0 && daysToExpiration <= 30) {
          metrics.expiringIn30Days++;
        }
        if (daysToExpiration > 0 && daysToExpiration <= 60) {
          metrics.expiringIn60Days++;
        }
        if (daysToExpiration > 0 && daysToExpiration <= 90) {
          metrics.expiringIn90Days++;
        }

        // Sum financial metrics
        metrics.totalAnnualRevenue += lease.financial.annualRevenue;
        totalRoyaltyRate += lease.terms.royaltyRate;
        metrics.totalAcreage += lease.property.acreage;
      }

      // Calculate averages
      if (leases.length > 0) {
        metrics.averageRoyaltyRate = totalRoyaltyRate / leases.length;
      }

      return metrics;
    } catch (error) {
      logger.error('Failed to get lease metrics', { error });
      throw error;
    }
  }

  /**
   * Bulk update lease statuses
   */
  async updateAllLeaseStatuses(): Promise<number> {
    try {
      const leases = await this.getLeases();
      let updatedCount = 0;

      for (const lease of leases) {
        const originalStatus = lease.status;
        const updatedLease = await this.updateLeaseStatus(lease);
        
        if (updatedLease.status !== originalStatus) {
          updatedCount++;
        }
      }

      logger.info('Bulk lease status update completed', { 
        totalLeases: leases.length,
        updatedCount,
      });

      return updatedCount;
    } catch (error) {
      logger.error('Failed to update lease statuses', { error });
      throw error;
    }
  }
}

export const leaseService = new LeaseService();