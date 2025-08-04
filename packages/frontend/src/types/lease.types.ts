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
    };
    mineralRights: string[];
  };
  terms: {
    effectiveDate: Date | string;
    expirationDate: Date | string;
    primaryTerm: number;
    royaltyRate: number;
    bonusPayment: number;
    extensionOptions?: string[];
    specialClauses?: string[];
  };
  financial: {
    annualRevenue: number;
    totalInvestment: number;
    netRevenue?: number;
    roi?: number;
  };
  status: 'active' | 'expired' | 'terminated' | 'pending' | 'renewal-pending';
  compliance: {
    lastReviewDate?: Date | string;
    nextReviewDate?: Date | string;
    issues?: string[];
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date | string;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LeaseMetrics {
  totalLeases: number;
  activeLeases: number;
  expiringLeases: number;
  totalRevenue: number;
  averageRoyaltyRate: number;
  totalAcreage: number;
}

export interface LeaseFilter {
  status?: Lease['status'];
  expiringWithinDays?: number;
  county?: string;
  state?: string;
  minAcreage?: number;
  maxAcreage?: number;
  minRevenue?: number;
  maxRevenue?: number;
}