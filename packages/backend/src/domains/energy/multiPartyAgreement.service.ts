import { firestore } from '../../config/firebase';
import {
  MultiPartyAgreement,
  AgreementParty,
  AgreementStatus,
  WorkingInterest,
  VotingRights,
  OperatorDesignation,
  CostAllocation,
  RevenueDistribution,
  AgreementAmendment,
  DisputeResolution,
  AmendmentApproval
} from './types';
import { logger } from '../../utils/logger';
import { FieldValue } from 'firebase-admin/firestore';

export class MultiPartyAgreementService {
  private get collection() {
    return firestore().collection('multiPartyAgreements');
  }
  
  private get amendmentsCollection() {
    return firestore().collection('agreementAmendments');
  }
  
  private get disputesCollection() {
    return firestore().collection('agreementDisputes');
  }

  async createAgreement(
    agreement: Omit<MultiPartyAgreement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MultiPartyAgreement> {
    try {
      const now = new Date();
      const docRef = await this.collection.add({
        ...agreement,
        status: AgreementStatus.DRAFT,
        createdAt: now,
        updatedAt: now
      });

      const created = await this.getAgreement(docRef.id);
      if (!created) {
        throw new Error('Failed to create multi-party agreement');
      }

      logger.info('Multi-party agreement created', { agreementId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error creating multi-party agreement', { error });
      throw error;
    }
  }

  async getAgreement(agreementId: string): Promise<MultiPartyAgreement | null> {
    try {
      const doc = await this.collection.doc(agreementId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as MultiPartyAgreement;
    } catch (error) {
      logger.error('Error fetching multi-party agreement', { agreementId, error });
      throw error;
    }
  }

  async updateAgreement(
    agreementId: string,
    updates: Partial<MultiPartyAgreement>
  ): Promise<MultiPartyAgreement> {
    try {
      await this.collection.doc(agreementId).update({
        ...updates,
        updatedAt: new Date()
      });

      const updated = await this.getAgreement(agreementId);
      if (!updated) {
        throw new Error('Agreement not found after update');
      }

      logger.info('Multi-party agreement updated', { agreementId });
      return updated;
    } catch (error) {
      logger.error('Error updating multi-party agreement', { agreementId, error });
      throw error;
    }
  }

  async addParty(
    agreementId: string,
    party: Omit<AgreementParty, 'joinedAt'>
  ): Promise<void> {
    try {
      const agreement = await this.getAgreement(agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      const newParty: AgreementParty = {
        ...party,
        joinedAt: new Date()
      };

      await this.collection.doc(agreementId).update({
        parties: FieldValue.arrayUnion(newParty),
        updatedAt: new Date()
      });

      // Update working interests and voting rights
      await this.recalculateInterests(agreementId);

      logger.info('Party added to agreement', { agreementId, partyId: party.partyId });
    } catch (error) {
      logger.error('Error adding party to agreement', { agreementId, error });
      throw error;
    }
  }

  async removeParty(agreementId: string, partyId: string): Promise<void> {
    try {
      const agreement = await this.getAgreement(agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      const partyToRemove = agreement.parties.find(p => p.partyId === partyId);
      if (!partyToRemove) {
        throw new Error('Party not found in agreement');
      }

      await this.collection.doc(agreementId).update({
        parties: FieldValue.arrayRemove(partyToRemove),
        updatedAt: new Date()
      });

      // Update working interests and voting rights
      await this.recalculateInterests(agreementId);

      logger.info('Party removed from agreement', { agreementId, partyId });
    } catch (error) {
      logger.error('Error removing party from agreement', { agreementId, error });
      throw error;
    }
  }

  async updateWorkingInterests(
    agreementId: string,
    interests: WorkingInterest[]
  ): Promise<void> {
    try {
      // Validate total interests equal 100%
      const total = interests.reduce((sum, i) => sum + i.percentage, 0);
      if (Math.abs(total - 1) > 0.0001) {
        throw new Error(`Working interests must total 100%, got ${(total * 100).toFixed(2)}%`);
      }

      await this.collection.doc(agreementId).update({
        workingInterests: interests,
        updatedAt: new Date()
      });

      logger.info('Working interests updated', { agreementId });
    } catch (error) {
      logger.error('Error updating working interests', { agreementId, error });
      throw error;
    }
  }

  async updateVotingRights(
    agreementId: string,
    votingRights: VotingRights
  ): Promise<void> {
    try {
      await this.collection.doc(agreementId).update({
        votingRights,
        updatedAt: new Date()
      });

      logger.info('Voting rights updated', { agreementId });
    } catch (error) {
      logger.error('Error updating voting rights', { agreementId, error });
      throw error;
    }
  }

  async designateOperator(
    agreementId: string,
    designation: OperatorDesignation
  ): Promise<void> {
    try {
      const agreement = await this.getAgreement(agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      // Validate operator is a party to the agreement
      const operatorParty = agreement.parties.find(p => p.partyId === designation.operatorId);
      if (!operatorParty) {
        throw new Error('Operator must be a party to the agreement');
      }

      await this.collection.doc(agreementId).update({
        operatorDesignation: designation,
        updatedAt: new Date()
      });

      logger.info('Operator designated', { 
        agreementId, 
        operatorId: designation.operatorId 
      });
    } catch (error) {
      logger.error('Error designating operator', { agreementId, error });
      throw error;
    }
  }

  async updateCostAllocation(
    agreementId: string,
    costAllocation: CostAllocation[]
  ): Promise<void> {
    try {
      // Validate allocations by category
      const categories = [...new Set(costAllocation.map(ca => ca.category))];
      
      for (const category of categories) {
        const categoryAllocations = costAllocation.filter(ca => ca.category === category);
        const total = categoryAllocations.reduce((sum, ca) => sum + ca.percentage, 0);
        
        if (Math.abs(total - 1) > 0.0001) {
          throw new Error(`Cost allocations for ${category} must total 100%`);
        }
      }

      await this.collection.doc(agreementId).update({
        costAllocation,
        updatedAt: new Date()
      });

      logger.info('Cost allocation updated', { agreementId });
    } catch (error) {
      logger.error('Error updating cost allocation', { agreementId, error });
      throw error;
    }
  }

  async updateRevenueDistribution(
    agreementId: string,
    revenueDistribution: RevenueDistribution[]
  ): Promise<void> {
    try {
      // Validate total distribution equals 100%
      const total = revenueDistribution.reduce((sum, rd) => sum + rd.percentage, 0);
      if (Math.abs(total - 1) > 0.0001) {
        throw new Error(`Revenue distribution must total 100%, got ${(total * 100).toFixed(2)}%`);
      }

      await this.collection.doc(agreementId).update({
        revenueDistribution,
        updatedAt: new Date()
      });

      logger.info('Revenue distribution updated', { agreementId });
    } catch (error) {
      logger.error('Error updating revenue distribution', { agreementId, error });
      throw error;
    }
  }

  async addAmendment(
    agreementId: string,
    amendment: Omit<AgreementAmendment, 'id' | 'createdAt' | 'approvals'>
  ): Promise<AgreementAmendment> {
    try {
      const agreement = await this.getAgreement(agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      const docRef = await this.amendmentsCollection.add({
        ...amendment,
        agreementId,
        approvals: [],
        createdAt: new Date()
      });

      const created = await this.getAmendment(docRef.id);
      if (!created) {
        throw new Error('Failed to create amendment');
      }

      logger.info('Amendment added', { agreementId, amendmentId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error adding amendment', { agreementId, error });
      throw error;
    }
  }

  async approveAmendment(
    amendmentId: string,
    partyId: string,
    approved: boolean,
    comments?: string
  ): Promise<void> {
    try {
      const amendment = await this.getAmendment(amendmentId);
      if (!amendment) {
        throw new Error('Amendment not found');
      }

      const approval: AmendmentApproval = {
        partyId,
        approved,
        approvedAt: new Date(),
        comments
      };

      await this.amendmentsCollection.doc(amendmentId).update({
        approvals: FieldValue.arrayUnion(approval)
      });

      // Check if amendment is fully approved
      await this.checkAmendmentApproval(amendmentId);

      logger.info('Amendment approval recorded', { amendmentId, partyId, approved });
    } catch (error) {
      logger.error('Error approving amendment', { amendmentId, error });
      throw error;
    }
  }

  async recordDispute(
    agreementId: string,
    dispute: Omit<DisputeResolution, 'id' | 'filedAt' | 'status'>
  ): Promise<DisputeResolution> {
    try {
      const docRef = await this.disputesCollection.add({
        ...dispute,
        agreementId,
        status: 'open',
        filedAt: new Date()
      });

      const created = await this.getDispute(docRef.id);
      if (!created) {
        throw new Error('Failed to record dispute');
      }

      logger.info('Dispute recorded', { agreementId, disputeId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error recording dispute', { agreementId, error });
      throw error;
    }
  }

  async resolveDispute(
    disputeId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<void> {
    try {
      await this.disputesCollection.doc(disputeId).update({
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date()
      });

      logger.info('Dispute resolved', { disputeId });
    } catch (error) {
      logger.error('Error resolving dispute', { disputeId, error });
      throw error;
    }
  }

  async getAgreementsByParty(partyId: string): Promise<MultiPartyAgreement[]> {
    try {
      const snapshot = await this.collection
        .where('parties', 'array-contains-any', [{ partyId }])
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as MultiPartyAgreement));
    } catch (error) {
      logger.error('Error fetching agreements by party', { partyId, error });
      throw error;
    }
  }

  async getAgreementsByOperator(operatorId: string): Promise<MultiPartyAgreement[]> {
    try {
      const snapshot = await this.collection
        .where('operatorDesignation.operatorId', '==', operatorId)
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as MultiPartyAgreement));
    } catch (error) {
      logger.error('Error fetching agreements by operator', { operatorId, error });
      throw error;
    }
  }

  async getActiveAgreements(): Promise<MultiPartyAgreement[]> {
    try {
      const snapshot = await this.collection
        .where('status', '==', AgreementStatus.ACTIVE)
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as MultiPartyAgreement));
    } catch (error) {
      logger.error('Error fetching active agreements', { error });
      throw error;
    }
  }

  private async getAmendment(amendmentId: string): Promise<AgreementAmendment | null> {
    try {
      const doc = await this.amendmentsCollection.doc(amendmentId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as AgreementAmendment;
    } catch (error) {
      logger.error('Error fetching amendment', { amendmentId, error });
      throw error;
    }
  }

  private async getDispute(disputeId: string): Promise<DisputeResolution | null> {
    try {
      const doc = await this.disputesCollection.doc(disputeId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as DisputeResolution;
    } catch (error) {
      logger.error('Error fetching dispute', { disputeId, error });
      throw error;
    }
  }

  private async recalculateInterests(agreementId: string): Promise<void> {
    try {
      const agreement = await this.getAgreement(agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      // Recalculate working interests based on party contributions
      const totalContribution = agreement.parties.reduce(
        (sum, party) => sum + (party.initialContribution || 0),
        0
      );

      if (totalContribution > 0) {
        const workingInterests: WorkingInterest[] = agreement.parties.map(party => ({
          partyId: party.partyId,
          percentage: (party.initialContribution || 0) / totalContribution,
          nri: ((party.initialContribution || 0) / totalContribution) * 0.875, // Assuming 87.5% NRI
          effectiveDate: new Date()
        }));

        await this.updateWorkingInterests(agreementId, workingInterests);
      }
    } catch (error) {
      logger.error('Error recalculating interests', { agreementId, error });
      throw error;
    }
  }

  private async checkAmendmentApproval(amendmentId: string): Promise<void> {
    try {
      const amendment = await this.getAmendment(amendmentId);
      if (!amendment) {
        throw new Error('Amendment not found');
      }

      const agreement = await this.getAgreement(amendment.agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      // Check if all required parties have approved
      const requiredApprovals = agreement.parties.filter(p => p.votingRights).length;
      const approvals = amendment.approvals.filter((a: AmendmentApproval) => a.approved).length;

      if (approvals >= requiredApprovals * (agreement.votingRights?.amendmentThreshold || 0.75)) {
        // Apply the amendment
        await this.applyAmendment(amendment);
      }
    } catch (error) {
      logger.error('Error checking amendment approval', { amendmentId, error });
      throw error;
    }
  }

  private async applyAmendment(amendment: AgreementAmendment): Promise<void> {
    try {
      // Apply the changes from the amendment
      await this.collection.doc(amendment.agreementId).update({
        ...amendment.changes,
        lastAmendmentDate: new Date(),
        updatedAt: new Date()
      });

      // Update amendment status
      await this.amendmentsCollection.doc(amendment.id).update({
        status: 'applied',
        appliedAt: new Date()
      });

      logger.info('Amendment applied', { 
        amendmentId: amendment.id, 
        agreementId: amendment.agreementId 
      });
    } catch (error) {
      logger.error('Error applying amendment', { amendmentId: amendment.id, error });
      throw error;
    }
  }
}

export const multiPartyAgreementService = new MultiPartyAgreementService();