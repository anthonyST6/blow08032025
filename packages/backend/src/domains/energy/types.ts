// Energy Sector Domain Types

export interface LandLease {
  id: string;
  leaseNumber: string;
  lessor: LessorInfo;
  lessee: LesseeInfo;
  property: PropertyInfo;
  terms: LeaseTerms;
  royalties: RoyaltyTerms;
  status: LeaseStatus;
  documents: Document[];
  timeline: LeaseEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LessorInfo {
  id: string;
  name: string;
  type: 'individual' | 'corporation' | 'trust' | 'estate';
  contactInfo: ContactInfo;
  ownership: OwnershipInfo;
}

export interface LesseeInfo {
  id: string;
  companyName: string;
  operatorNumber?: string;
  contactInfo: ContactInfo;
  creditRating?: string;
}

export interface ContactInfo {
  address: Address;
  phone: string;
  email: string;
  preferredContact: 'email' | 'phone' | 'mail';
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PropertyInfo {
  legalDescription: string;
  county: string;
  state: string;
  acres: number;
  section?: string;
  township?: string;
  range?: string;
  gpsCoordinates?: GPSCoordinates;
  mineralRights: MineralRights;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface MineralRights {
  type: 'full' | 'partial' | 'surface_only';
  percentage?: number;
  specificMinerals?: string[];
  depth?: DepthRights;
}

export interface DepthRights {
  from: number;
  to: number;
  unit: 'feet' | 'meters';
}

export interface LeaseTerms {
  effectiveDate: Date;
  primaryTerm: {
    years: number;
    endDate: Date;
  };
  secondaryTerm?: {
    condition: 'production' | 'operations' | 'payment';
    details: string;
  };
  bonus: {
    amount: number;
    perAcre: boolean;
    paymentSchedule: PaymentSchedule;
  };
  rentals: {
    annualAmount: number;
    perAcre: boolean;
    dueDate: string; // MM-DD format
    gracePeriodDays: number;
  };
  extensions?: LeaseExtension[];
  specialProvisions?: string[];
}

export interface PaymentSchedule {
  type: 'immediate' | 'installments' | 'deferred';
  installments?: PaymentInstallment[];
}

export interface PaymentInstallment {
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export interface LeaseExtension {
  type: 'option' | 'automatic';
  terms: string;
  fee?: number;
  exerciseDeadline?: Date;
}

export interface RoyaltyTerms {
  percentage: number;
  minimumRoyalty?: number;
  deductions: RoyaltyDeduction[];
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  auditable: boolean;
}

export interface RoyaltyDeduction {
  type: 'transportation' | 'processing' | 'marketing' | 'taxes';
  percentage?: number;
  fixedAmount?: number;
  description: string;
}

export interface OwnershipInfo {
  percentage: number;
  type: 'fee_simple' | 'life_estate' | 'remainder' | 'joint_tenancy';
  coOwners?: CoOwner[];
}

export interface CoOwner {
  name: string;
  percentage: number;
  relationship?: string;
}

export enum LeaseStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  PRODUCING = 'producing',
  HELD_BY_PRODUCTION = 'held_by_production',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, any>;
}

export enum DocumentType {
  LEASE_AGREEMENT = 'lease_agreement',
  AMENDMENT = 'amendment',
  ASSIGNMENT = 'assignment',
  TITLE_OPINION = 'title_opinion',
  SURVEY = 'survey',
  PRODUCTION_REPORT = 'production_report',
  ROYALTY_STATEMENT = 'royalty_statement',
  CORRESPONDENCE = 'correspondence',
  OTHER = 'other'
}

export interface LeaseEvent {
  id: string;
  type: EventType;
  date: Date;
  description: string;
  performedBy?: string;
  relatedDocuments?: string[];
  metadata?: Record<string, any>;
}

export enum EventType {
  LEASE_EXECUTED = 'lease_executed',
  BONUS_PAID = 'bonus_paid',
  RENTAL_PAID = 'rental_paid',
  PRODUCTION_STARTED = 'production_started',
  ROYALTY_PAID = 'royalty_paid',
  LEASE_EXTENDED = 'lease_extended',
  LEASE_AMENDED = 'lease_amended',
  LEASE_ASSIGNED = 'lease_assigned',
  LEASE_EXPIRED = 'lease_expired',
  LEASE_TERMINATED = 'lease_terminated',
  COMPLIANCE_CHECK = 'compliance_check',
  AUDIT_PERFORMED = 'audit_performed'
}

// Rights Expiration Monitoring
export interface ExpirationAlert {
  id: string;
  leaseId: string;
  type: 'primary_term' | 'rental_due' | 'option_deadline' | 'production_requirement';
  dueDate: Date;
  daysUntilDue: number;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  notifications: NotificationRecord[];
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationRecord {
  sentAt: Date;
  sentTo: string[];
  method: 'email' | 'sms' | 'in_app';
  status: 'sent' | 'delivered' | 'failed';
}

// Multi-party Agreement Tracking
export interface MultiPartyAgreement {
  id: string;
  type: AgreementType;
  name: string;
  parties: AgreementParty[];
  terms: AgreementTerms;
  workingInterests: WorkingInterest[];
  votingRights?: VotingRights;
  operatorDesignation?: OperatorDesignation;
  costAllocation?: CostAllocation[];
  revenueDistribution?: RevenueDistribution[];
  obligations: Obligation[];
  status: AgreementStatus;
  lastAmendmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AgreementType = 'joint_operating' | 'unitization' | 'pooling' | 'farmout';

export interface AgreementParty {
  partyId: string;
  name: string;
  role: 'operator' | 'non_operator' | 'working_interest_owner';
  contactInfo: ContactInfo;
  signatureStatus: 'pending' | 'signed' | 'declined';
  signedDate?: Date;
  joinedAt: Date;
  votingRights?: boolean;
  initialContribution?: number;
}

export interface Party {
  id: string;
  name: string;
  role: 'operator' | 'non_operator' | 'working_interest_owner';
  contactInfo: ContactInfo;
  signatureStatus: 'pending' | 'signed' | 'declined';
  signedDate?: Date;
}

export interface WorkingInterest {
  partyId: string;
  percentage: number;
  nri: number; // Net Revenue Interest
  effectiveDate: Date;
  endDate?: Date;
}

export interface Obligation {
  id: string;
  partyId: string;
  type: 'financial' | 'operational' | 'reporting';
  description: string;
  dueDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  amount?: number;
}

export interface AgreementTerms {
  effectiveDate: Date;
  expirationDate?: Date;
  areaOfMutualInterest?: AreaOfMutualInterest;
  operatingProvisions: string[];
  accountingProcedure: 'COPAS' | 'custom';
}

export interface AreaOfMutualInterest {
  description: string;
  acres: number;
  duration: number; // months
}

export enum AgreementStatus {
  DRAFT = 'draft',
  NEGOTIATION = 'negotiation',
  PENDING_SIGNATURES = 'pending_signatures',
  EXECUTED = 'executed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

// Compliance Automation
export interface ComplianceRequirement {
  id: string;
  category: ComplianceCategory;
  description: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually';
  applicableTo: string[]; // lease IDs or agreement IDs
  automationRules: AutomationRule[];
  lastChecked?: Date;
  nextDue?: Date;
  status: ComplianceStatus;
}

export enum ComplianceCategory {
  REGULATORY = 'regulatory',
  CONTRACTUAL = 'contractual',
  ENVIRONMENTAL = 'environmental',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  REPORTING = 'reporting'
}

export interface AutomationRule {
  id: string;
  trigger: TriggerType;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
}

export enum TriggerType {
  DATE_BASED = 'date_based',
  EVENT_BASED = 'event_based',
  THRESHOLD_BASED = 'threshold_based',
  MANUAL = 'manual'
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface Action {
  type: 'notify' | 'create_task' | 'update_status' | 'generate_report';
  parameters: Record<string, any>;
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  REMEDIATION_IN_PROGRESS = 'remediation_in_progress'
}

// Analytics and Reporting
export interface EnergyAnalytics {
  leasePerformance: LeasePerformanceMetrics;
  royaltyAnalysis: RoyaltyAnalysis;
  complianceMetrics: ComplianceMetrics;
  expirationForecast: ExpirationForecast;
}

export interface LeasePerformanceMetrics {
  totalLeases: number;
  activeLeases: number;
  producingLeases: number;
  totalAcreage: number;
  averageRoyaltyRate: number;
  totalRevenue: number;
  revenueByPeriod: RevenuePeriod[];
}

export interface RevenuePeriod {
  period: string;
  revenue: number;
  royalties: number;
  rentals: number;
  bonuses: number;
}

export interface RoyaltyAnalysis {
  totalRoyaltiesPaid: number;
  averageMonthlyRoyalty: number;
  topProducingLeases: LeaseRoyaltySummary[];
  deductionAnalysis: DeductionSummary;
}

export interface LeaseRoyaltySummary {
  leaseId: string;
  leaseNumber: string;
  totalRoyalties: number;
  lastPayment: number;
  lastPaymentDate: Date;
}

export interface DeductionSummary {
  totalDeductions: number;
  byType: Record<string, number>;
  percentageOfGross: number;
}

export interface ComplianceMetrics {
  overallScore: number;
  byCategory: Record<ComplianceCategory, number>;
  openIssues: number;
  resolvedIssues: number;
  upcomingDeadlines: ComplianceDeadline[];
}

export interface ComplianceDeadline {
  requirementId: string;
  description: string;
  dueDate: Date;
  daysRemaining: number;
}

export interface ExpirationForecast {
  next30Days: ExpirationSummary;
  next90Days: ExpirationSummary;
  next365Days: ExpirationSummary;
}

export interface ExpirationSummary {
  leaseExpirations: number;
  rentalsDue: number;
  optionDeadlines: number;
  estimatedRevenueLoss?: number;
}

// Additional types for multi-party agreements
export interface VotingRights {
  method: 'unanimous' | 'majority' | 'supermajority' | 'weighted';
  majorityThreshold?: number; // e.g., 0.51 for 51%
  supermajorityThreshold?: number; // e.g., 0.67 for 67%
  vetoRights?: string[]; // party IDs with veto rights
  amendmentThreshold?: number; // threshold for approving amendments
}

export interface OperatorDesignation {
  operatorId: string;
  effectiveDate: Date;
  removalConditions?: string[];
  successorProvisions?: string;
}

export interface CostAllocation {
  partyId: string;
  category: 'drilling' | 'completion' | 'operations' | 'overhead' | 'other';
  percentage: number;
  effectiveDate: Date;
  notes?: string;
}

export interface RevenueDistribution {
  partyId: string;
  percentage: number;
  priority?: number; // 1 = highest priority
  minimumPayment?: number;
  effectiveDate: Date;
}

export interface AgreementAmendment {
  id: string;
  agreementId: string;
  proposedBy: string;
  proposedDate: Date;
  description: string;
  changes: Record<string, any>;
  approvals: AmendmentApproval[];
  status: 'proposed' | 'approved' | 'rejected' | 'applied';
  appliedAt?: Date;
  createdAt: Date;
}

export interface AmendmentApproval {
  partyId: string;
  approved: boolean;
  approvedAt: Date;
  comments?: string;
}

export interface DisputeResolution {
  id: string;
  agreementId: string;
  raisedBy: string;
  subject: string;
  description: string;
  filedAt: Date;
  status: 'open' | 'in_mediation' | 'in_arbitration' | 'resolved';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}