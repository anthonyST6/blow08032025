# Use Case Components Architecture

## Overview
This directory contains all use case-specific components following the Oilfield Land Lease standard. Each use case must include:

1. **Clickable SIA Metrics** with detailed breakdowns
2. **Seraphim Vanguards Logo** (h-36 size)
3. **Industry-specific tabs** (minimum 6 tabs)
4. **Interactive data visualizations**
5. **Expandable/clickable elements** for drilling down into data
6. **Real-time mock data** with realistic values
7. **Compliance and regulatory tracking**
8. **AI-powered insights and recommendations**

## Directory Structure

```
use-cases/
├── shared/
│   ├── SIAAnalysis.tsx         # Reusable SIA analysis components
│   ├── ComplianceTracker.tsx   # Reusable compliance components
│   ├── MetricCard.tsx          # Standardized metric cards
│   └── WorkflowStatus.tsx      # VANGUARDS workflow components
├── energy/
│   ├── OilfieldLandLease/
│   ├── DrillingRiskAssessment/
│   ├── EnvironmentalCompliance/
│   ├── LoadForecasting/
│   ├── GridAnomaly/
│   └── RenewableOptimization/
├── healthcare/
│   ├── PatientRiskStratification/
│   ├── ClinicalTrialMatching/
│   └── TreatmentRecommendation/
├── finance/
│   ├── FraudDetection/
│   ├── CreditRiskAssessment/
│   └── PortfolioOptimization/
└── [other verticals...]
```

## Component Standards

### 1. Main Dashboard Component
Each use case must have:
- Overview tab with 4+ key metrics
- Industry-specific operational tabs
- Analytics tab with AI insights
- Compliance/Regulatory tab
- Financial/Performance tab
- Operations/Workflow tab

### 2. SIA Analysis Components
Must include for each metric (Security, Integrity, Accuracy):
- Overall score with description
- 4+ sub-metrics with detailed breakdowns
- Industry-specific considerations
- Visual progress indicators
- Recommendations and action items

### 3. Data Visualizations
- Interactive charts (clickable/expandable)
- Real-time data updates
- Drill-down capabilities
- Industry-standard metrics
- Predictive analytics

### 4. Mock Data Service
Each use case needs:
- Realistic data generation
- Industry-specific fields
- Temporal data (trends)
- Compliance statuses
- Financial metrics
- Operational KPIs

## Implementation Checklist

For each use case:
- [ ] Create dedicated component directory
- [ ] Implement 6+ industry-specific tabs
- [ ] Add clickable SIA metrics with full analysis
- [ ] Create realistic mock data generator
- [ ] Add interactive visualizations
- [ ] Implement expandable/drilldown features
- [ ] Add compliance tracking
- [ ] Include AI-powered insights
- [ ] Add VANGUARDS workflow status
- [ ] Ensure Seraphim logo placement (h-36)