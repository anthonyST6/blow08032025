/**
 * SIA (Security, Integrity, Accuracy) Analysis Type Definitions
 */

import { ComponentType } from 'react';

// Base metric interface used across all SIA categories
export interface SIAMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: ComponentType<{ className?: string }>;
  details?: string[];
}

// Security-specific interfaces
export interface SecurityThreat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface SecurityControl {
  name: string;
  implemented: boolean;
  effectiveness: number;
  description: string;
}

export interface SecurityAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  recommendations: string[];
  threats: SecurityThreat[];
  vulnerabilities: string[];
  controls: SecurityControl[];
}

// Integrity-specific interfaces
export interface ComplianceItem {
  name: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  description: string;
  requirement: string;
  lastAudit?: string;
}

export interface DataValidation {
  type: string;
  passed: number;
  failed: number;
  accuracy: number;
}

export interface IntegrityAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  complianceItems: ComplianceItem[];
  validationResults: DataValidation[];
  anomaliesDetected: number;
  reconciliationStatus: {
    matched: number;
    mismatched: number;
    pending: number;
  };
}

// Accuracy-specific interfaces
export interface ModelPerformance {
  metric: string;
  value: number;
  benchmark: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PrecisionMetric {
  category: string;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface AccuracyAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  modelPerformance: ModelPerformance[];
  precisionMetrics: PrecisionMetric[];
  dataCompleteness: number;
  timelinessScore: number;
}

// Combined SIA analysis interface
export interface SIAAnalysisData {
  security: SecurityAnalysisData;
  integrity: IntegrityAnalysisData;
  accuracy: AccuracyAnalysisData;
  generatedAt: string;
  useCaseId: string;
  vertical: string;
}

// Use case context for generating SIA data
export interface UseCaseContext {
  id: string;
  name: string;
  vertical: string;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  complexity?: 'low' | 'medium' | 'high';
  dataVolume?: 'small' | 'medium' | 'large';
  regulatoryRequirements?: string[];
}