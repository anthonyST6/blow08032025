import { firestore } from '../../config/firebase';
import {
  ComplianceRequirement,
  ComplianceCategory,
  ComplianceStatus,
  AutomationRule,
  Condition,
  Action,
  LandLease,
  MultiPartyAgreement,
  LeaseStatus,
  EventType,
  DocumentType
} from './types';
import { logger } from '../../utils/logger';
import { landLeaseService } from './landLease.service';
import { multiPartyAgreementService } from './multiPartyAgreement.service';

export class ComplianceService {
  private get collection() {
    return firestore().collection('complianceRequirements');
  }
  
  private get rulesCollection() {
    return firestore().collection('automationRules');
  }
  
  private get checksCollection() {
    return firestore().collection('complianceChecks');
  }
  
  private get violationsCollection() {
    return firestore().collection('complianceViolations');
  }

  async createRequirement(
    requirement: Omit<ComplianceRequirement, 'id' | 'lastChecked' | 'status'>
  ): Promise<ComplianceRequirement> {
    try {
      const docRef = await this.collection.add({
        ...requirement,
        status: ComplianceStatus.PENDING_REVIEW,
        createdAt: new Date()
      });

      const created = await this.getRequirement(docRef.id);
      if (!created) {
        throw new Error('Failed to create compliance requirement');
      }

      // Schedule initial check
      await this.scheduleComplianceCheck(created);

      logger.info('Compliance requirement created', { requirementId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error creating compliance requirement', { error });
      throw error;
    }
  }

  async getRequirement(requirementId: string): Promise<ComplianceRequirement | null> {
    try {
      const doc = await this.collection.doc(requirementId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as ComplianceRequirement;
    } catch (error) {
      logger.error('Error fetching compliance requirement', { requirementId, error });
      throw error;
    }
  }

  async updateRequirement(
    requirementId: string,
    updates: Partial<ComplianceRequirement>
  ): Promise<ComplianceRequirement> {
    try {
      await this.collection.doc(requirementId).update({
        ...updates,
        updatedAt: new Date()
      });

      const updated = await this.getRequirement(requirementId);
      if (!updated) {
        throw new Error('Requirement not found after update');
      }

      logger.info('Compliance requirement updated', { requirementId });
      return updated;
    } catch (error) {
      logger.error('Error updating compliance requirement', { requirementId, error });
      throw error;
    }
  }

  async createAutomationRule(
    rule: Omit<AutomationRule, 'id'>
  ): Promise<AutomationRule> {
    try {
      const docRef = await this.rulesCollection.add({
        ...rule,
        createdAt: new Date()
      });

      const created = await this.getAutomationRule(docRef.id);
      if (!created) {
        throw new Error('Failed to create automation rule');
      }

      logger.info('Automation rule created', { ruleId: docRef.id });
      return created;
    } catch (error) {
      logger.error('Error creating automation rule', { error });
      throw error;
    }
  }

  async getAutomationRule(ruleId: string): Promise<AutomationRule | null> {
    try {
      const doc = await this.rulesCollection.doc(ruleId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as AutomationRule;
    } catch (error) {
      logger.error('Error fetching automation rule', { ruleId, error });
      throw error;
    }
  }

  async checkCompliance(requirementId: string): Promise<ComplianceStatus> {
    try {
      const requirement = await this.getRequirement(requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      let isCompliant = true;
      const violations: any[] = [];

      // Check each applicable entity
      for (const entityId of requirement.applicableTo) {
        const checkResult = await this.checkEntityCompliance(
          entityId,
          requirement
        );

        if (!checkResult.compliant) {
          isCompliant = false;
          violations.push({
            entityId,
            requirement: requirement.description,
            issues: checkResult.issues
          });
        }
      }

      // Record check result
      await this.recordComplianceCheck({
        requirementId,
        checkedAt: new Date(),
        status: isCompliant ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT,
        violations
      });

      // Update requirement status
      const newStatus = isCompliant 
        ? ComplianceStatus.COMPLIANT 
        : ComplianceStatus.NON_COMPLIANT;

      await this.updateRequirement(requirementId, {
        status: newStatus,
        lastChecked: new Date(),
        nextDue: this.calculateNextDueDate(requirement.frequency)
      });

      // Execute automation rules if non-compliant
      if (!isCompliant) {
        await this.executeAutomationRules(requirement, violations);
      }

      logger.info('Compliance check completed', { 
        requirementId, 
        status: newStatus 
      });

      return newStatus;
    } catch (error) {
      logger.error('Error checking compliance', { requirementId, error });
      throw error;
    }
  }

  async checkEntityCompliance(
    entityId: string,
    requirement: ComplianceRequirement
  ): Promise<{ compliant: boolean; issues: string[] }> {
    const issues: string[] = [];
    let compliant = true;

    try {
      // Determine entity type and fetch data
      const lease = await landLeaseService.getLeaseById(entityId);
      const agreement = lease ? null : await multiPartyAgreementService.getAgreement(entityId);

      if (!lease && !agreement) {
        issues.push('Entity not found');
        return { compliant: false, issues };
      }

      // Check based on compliance category
      switch (requirement.category) {
        case ComplianceCategory.REGULATORY:
          if (lease) {
            compliant = await this.checkRegulatoryCompliance(lease, issues);
          }
          break;

        case ComplianceCategory.CONTRACTUAL:
          if (lease) {
            compliant = await this.checkContractualCompliance(lease, issues);
          } else if (agreement) {
            compliant = await this.checkAgreementCompliance(agreement, issues);
          }
          break;

        case ComplianceCategory.ENVIRONMENTAL:
          if (lease) {
            compliant = await this.checkEnvironmentalCompliance(lease, issues);
          }
          break;

        case ComplianceCategory.FINANCIAL:
          if (lease) {
            compliant = await this.checkFinancialCompliance(lease, issues);
          }
          break;

        case ComplianceCategory.OPERATIONAL:
          if (lease) {
            compliant = await this.checkOperationalCompliance(lease, issues);
          }
          break;

        case ComplianceCategory.REPORTING:
          compliant = await this.checkReportingCompliance(entityId, issues);
          break;
      }

      return { compliant, issues };
    } catch (error) {
      logger.error('Error checking entity compliance', { entityId, error });
      issues.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { compliant: false, issues };
    }
  }

  private async checkRegulatoryCompliance(
    lease: LandLease,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check for required permits
    if (!lease.documents.some(d => d.metadata?.type === 'permit')) {
      issues.push('Missing required permits');
      compliant = false;
    }

    // Check operator registration
    if (lease.status === 'producing' && !lease.lessee.operatorNumber) {
      issues.push('Operator number not registered');
      compliant = false;
    }

    return compliant;
  }

  private async checkContractualCompliance(
    lease: LandLease,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;
    const now = new Date();

    // Check rental payments
    if (lease.terms.rentals) {
      const rentalDue = new Date(
        now.getFullYear(),
        parseInt(lease.terms.rentals.dueDate.split('-')[0]) - 1,
        parseInt(lease.terms.rentals.dueDate.split('-')[1])
      );

      if (now > rentalDue) {
        const rentalPaid = lease.timeline.some(
          event =>
            event.type === EventType.RENTAL_PAID &&
            event.date > new Date(now.getFullYear(), 0, 1)
        );

        if (!rentalPaid) {
          issues.push('Annual rental payment overdue');
          compliant = false;
        }
      }
    }

    // Check production requirements
    if (lease.status === LeaseStatus.ACTIVE &&
        now > lease.terms.primaryTerm.endDate) {
      issues.push('Lease expired - no production within primary term');
      compliant = false;
    }

    return compliant;
  }

  private async checkAgreementCompliance(
    agreement: MultiPartyAgreement,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check all parties have signed
    const unsignedParties = agreement.parties.filter(
      p => p.signatureStatus !== 'signed'
    );

    if (unsignedParties.length > 0 && agreement.status === 'active') {
      issues.push(`${unsignedParties.length} parties have not signed`);
      compliant = false;
    }

    // Check operator designation
    if (!agreement.operatorDesignation && agreement.status === 'active') {
      issues.push('No operator designated');
      compliant = false;
    }

    return compliant;
  }

  private async checkEnvironmentalCompliance(
    lease: LandLease,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check for environmental assessments
    if (lease.status === LeaseStatus.PRODUCING) {
      const hasAssessment = lease.documents.some(
        d => d.metadata?.type === 'environmental_assessment'
      );

      if (!hasAssessment) {
        issues.push('Missing environmental assessment');
        compliant = false;
      }
    }

    return compliant;
  }

  private async checkFinancialCompliance(
    lease: LandLease,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check bonus payment
    if (lease.terms.bonus && lease.status !== LeaseStatus.DRAFT) {
      const bonusPaid = lease.timeline.some(
        event => event.type === EventType.BONUS_PAID
      );

      if (!bonusPaid) {
        issues.push('Bonus payment not recorded');
        compliant = false;
      }
    }

    // Check royalty payments if producing
    if (lease.status === LeaseStatus.PRODUCING) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const recentRoyalty = lease.timeline.some(
        event =>
          event.type === EventType.ROYALTY_PAID &&
          event.date > lastMonth
      );

      if (!recentRoyalty) {
        issues.push('No recent royalty payments');
        compliant = false;
      }
    }

    return compliant;
  }

  private async checkOperationalCompliance(
    lease: LandLease,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check for required operational reports
    if (lease.status === LeaseStatus.PRODUCING) {
      const hasProductionReport = lease.documents.some(
        d => d.type === DocumentType.PRODUCTION_REPORT &&
        d.uploadedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      );

      if (!hasProductionReport) {
        issues.push('Missing recent production report');
        compliant = false;
      }
    }

    return compliant;
  }

  private async checkReportingCompliance(
    _entityId: string,
    issues: string[]
  ): Promise<boolean> {
    let compliant = true;

    // Check for required regulatory filings
    const requiredReports = ['annual_report', 'tax_filing', 'production_report'];
    const missingReports: string[] = [];

    // This would check against actual filing records
    // For now, we'll simulate the check
    for (const reportType of requiredReports) {
      const hasReport = Math.random() > 0.2; // 80% compliance rate simulation
      if (!hasReport) {
        missingReports.push(reportType);
      }
    }

    if (missingReports.length > 0) {
      issues.push(`Missing reports: ${missingReports.join(', ')}`);
      compliant = false;
    }

    return compliant;
  }

  private async executeAutomationRules(
    requirement: ComplianceRequirement,
    violations: any[]
  ): Promise<void> {
    try {
      // Find applicable automation rules
      const rules = requirement.automationRules.filter(rule => rule.enabled);

      for (const rule of rules) {
        // Check if conditions are met
        const conditionsMet = await this.evaluateConditions(
          rule.conditions,
          { requirement, violations }
        );

        if (conditionsMet) {
          // Execute actions
          for (const action of rule.actions) {
            await this.executeAction(action, { requirement, violations });
          }
        }
      }
    } catch (error) {
      logger.error('Error executing automation rules', { error });
    }
  }

  private async evaluateConditions(
    conditions: Condition[],
    context: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(condition.field, context);
      
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'not_equals':
          if (fieldValue === condition.value) return false;
          break;
        case 'greater_than':
          if (fieldValue <= condition.value) return false;
          break;
        case 'less_than':
          if (fieldValue >= condition.value) return false;
          break;
        case 'contains':
          if (!fieldValue?.includes?.(condition.value)) return false;
          break;
      }
    }

    return true;
  }

  private getFieldValue(field: string, context: any): any {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  }

  private async executeAction(action: Action, context: any): Promise<void> {
    try {
      switch (action.type) {
        case 'notify':
          await this.sendNotification(action.parameters, context);
          break;
        case 'create_task':
          await this.createComplianceTask(action.parameters, context);
          break;
        case 'update_status':
          await this.updateEntityStatus(action.parameters, context);
          break;
        case 'generate_report':
          await this.generateComplianceReport(action.parameters, context);
          break;
      }
    } catch (error) {
      logger.error('Error executing action', { action, error });
    }
  }

  private async sendNotification(
    parameters: Record<string, any>,
    context: any
  ): Promise<void> {
    // Implementation would send actual notifications
    logger.info('Sending compliance notification', { parameters, context });
  }

  private async createComplianceTask(
    parameters: Record<string, any>,
    context: any
  ): Promise<void> {
    // Implementation would create tasks in task management system
    logger.info('Creating compliance task', { parameters, context });
  }

  private async updateEntityStatus(
    parameters: Record<string, any>,
    context: any
  ): Promise<void> {
    // Implementation would update entity status
    logger.info('Updating entity status', { parameters, context });
  }

  private async generateComplianceReport(
    parameters: Record<string, any>,
    context: any
  ): Promise<void> {
    // Implementation would generate compliance reports
    logger.info('Generating compliance report', { parameters, context });
  }

  private async recordComplianceCheck(check: any): Promise<void> {
    try {
      await this.checksCollection.add(check);
      
      // Record violations if any
      if (check.violations && check.violations.length > 0) {
        for (const violation of check.violations) {
          await this.violationsCollection.add({
            ...violation,
            requirementId: check.requirementId,
            detectedAt: check.checkedAt,
            status: 'open'
          });
        }
      }
    } catch (error) {
      logger.error('Error recording compliance check', { error });
    }
  }

  private calculateNextDueDate(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      case 'annually':
        now.setFullYear(now.getFullYear() + 1);
        break;
      default:
        now.setDate(now.getDate() + 30); // Default to 30 days
    }

    return now;
  }

  private async scheduleComplianceCheck(requirement: ComplianceRequirement): Promise<void> {
    // In a real implementation, this would schedule a job
    // For now, we'll just log it
    logger.info('Scheduling compliance check', {
      requirementId: requirement.id,
      nextDue: this.calculateNextDueDate(requirement.frequency)
    });
  }

  async getRequirementsByCategory(
    category: ComplianceCategory
  ): Promise<ComplianceRequirement[]> {
    try {
      const snapshot = await this.collection
        .where('category', '==', category)
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ComplianceRequirement));
    } catch (error) {
      logger.error('Error fetching requirements by category', { category, error });
      throw error;
    }
  }

  async getUpcomingRequirements(days: number = 30): Promise<ComplianceRequirement[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const snapshot = await this.collection
        .where('nextDue', '<=', futureDate)
        .orderBy('nextDue')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ComplianceRequirement));
    } catch (error) {
      logger.error('Error fetching upcoming requirements', { error });
      throw error;
    }
  }

  async getViolations(status?: 'open' | 'resolved'): Promise<any[]> {
    try {
      let query = this.violationsCollection;
      
      if (status) {
        query = query.where('status', '==', status) as any;
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error fetching violations', { error });
      throw error;
    }
  }

  async resolveViolation(
    violationId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<void> {
    try {
      await this.violationsCollection.doc(violationId).update({
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date()
      });

      logger.info('Violation resolved', { violationId });
    } catch (error) {
      logger.error('Error resolving violation', { violationId, error });
      throw error;
    }
  }
}

export const complianceService = new ComplianceService();