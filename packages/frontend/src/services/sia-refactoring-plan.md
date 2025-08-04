# SIA (Security, Integrity, Accuracy) Analysis System Refactoring Plan

## Overview
The current SIA analysis system in the Vanguards platform has critical issues:
- Only 5 out of 79 use cases have specific SIA data
- 74 use cases incorrectly show 'oilfield-land-lease' data as a fallback
- Standalone SIA pages have hardcoded static data
- No dynamic generation based on use case characteristics

## Current State Analysis

### Files Affected
1. **UseCaseDashboard.tsx** (Lines 111-1051, 2199, 2226-2230, 5905-6315)
   - Contains hardcoded siaAnalysisData for only 5 use cases
   - Falls back to 'oilfield-land-lease' data when specific data not found
   - Contains rendering functions for SIA analysis

2. **SecurityAnalysis.tsx**
   - Hardcoded overall score: 95%
   - Static metrics array with fixed values
   - No connection to use case context

3. **IntegrityAnalysis.tsx**
   - Hardcoded overall score: 88%
   - Static metrics array with fixed values
   - No connection to use case context

4. **AccuracyAnalysis.tsx**
   - Hardcoded overall score: 91%
   - Static metrics array with fixed values
   - No connection to use case context

5. **verticals.ts**
   - Contains siaScores for all 79 use cases (source of truth)
   - Organized by vertical with use case definitions

## Refactoring Architecture

### 1. TypeScript Interfaces
```typescript
// Core SIA data structures
interface SIAMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: string;
  details?: string[];
}

interface SecurityAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  recommendations: string[];
  threats?: string[];
  vulnerabilities?: string[];
  controls?: string[];
}

interface IntegrityAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  complianceItems: {
    name: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    description: string;
  }[];
}

interface AccuracyAnalysisData {
  overallScore: number;
  description: string;
  metrics: SIAMetric[];
  modelPerformance: {
    metric: string;
    value: number;
    benchmark: number;
  }[];
}

interface SIAAnalysisData {
  security: SecurityAnalysisData;
  integrity: IntegrityAnalysisData;
  accuracy: AccuracyAnalysisData;
}
```

### 2. SIA Data Generator Service

The service will generate unique SIA data for each use case based on:
- Use case vertical (industry-specific threats and requirements)
- Use case type and complexity
- SIA scores from verticals.ts
- Industry best practices and compliance requirements

Key features:
- Dynamic metric generation with realistic variations
- Industry-specific security threats and controls
- Vertical-appropriate integrity challenges
- Use case-specific accuracy requirements
- Consistent scoring that matches verticals.ts

### 3. Implementation Steps

#### Phase 1: Create Core Infrastructure
1. Create TypeScript interfaces for all SIA data structures
2. Build the SIA data generator service with:
   - Industry-specific metric templates
   - Dynamic value generation within realistic ranges
   - Proper status determination based on thresholds
   - Contextual descriptions and recommendations

#### Phase 2: Update UseCaseDashboard
1. Remove static siaAnalysisData object
2. Replace with dynamic generator function calls
3. Update renderSIAAnalysis to use dynamic data
4. Ensure proper data flow to modal components

#### Phase 3: Refactor Standalone Pages
1. Update routing to accept use case ID parameter
2. Modify pages to receive use case context
3. Replace hardcoded data with dynamic generation
4. Ensure visual consistency with dashboard displays

#### Phase 4: Testing and Validation
1. Test all 79 use cases for unique data generation
2. Verify SIA scores match verticals.ts
3. Ensure no 'oilfield-land-lease' fallbacks
4. Validate data consistency between views

## Industry-Specific Considerations

### Energy Sector
- Security: SCADA vulnerabilities, grid attacks, physical security
- Integrity: Sensor data validation, meter tampering, data reconciliation
- Accuracy: Load forecasting precision, renewable output predictions

### Healthcare
- Security: HIPAA compliance, patient data protection, medical device security
- Integrity: Clinical data accuracy, audit trails, data lineage
- Accuracy: Diagnostic precision, treatment outcome predictions

### Finance
- Security: Transaction security, fraud prevention, regulatory compliance
- Integrity: Transaction atomicity, audit requirements, data consistency
- Accuracy: Risk calculations, fraud detection rates, market predictions

### Manufacturing
- Security: Industrial espionage, supply chain attacks, IP protection
- Integrity: Quality control data, production metrics, sensor validation
- Accuracy: Defect detection, predictive maintenance, yield optimization

## Success Criteria
1. All 79 use cases display unique, contextually appropriate SIA data
2. No hardcoded values or static fallbacks remain
3. SIA scores from verticals.ts are accurately reflected
4. Consistent data between dashboard and standalone pages
5. Realistic, industry-appropriate metrics and recommendations
6. Clean, maintainable code architecture

## Risk Mitigation
- Extensive testing across all use cases
- Gradual rollout with careful validation
- Maintain backward compatibility during transition
- Clear documentation for future maintenance