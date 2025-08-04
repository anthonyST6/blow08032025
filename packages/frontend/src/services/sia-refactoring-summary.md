# SIA Refactoring Summary & Implementation Instructions

## Overview
This document summarizes the complete plan for refactoring the SIA (Security, Integrity, Accuracy) analysis system in the Vanguards platform to make it fully dynamic and use-case specific.

## Problem Statement
- Only 5 out of 79 use cases have specific SIA data
- 74 use cases incorrectly display 'oilfield-land-lease' data as a fallback
- Standalone SIA pages contain hardcoded static data
- No dynamic generation based on use case characteristics

## Solution Architecture

### 1. Create TypeScript Interfaces (`packages/frontend/src/types/sia.types.ts`)
- Define comprehensive interfaces for all SIA data structures
- Include Security, Integrity, and Accuracy specific types
- Add UseCaseContext interface for passing use case information

### 2. Implement SIA Data Generator Service (`packages/frontend/src/services/siaDataGenerator.service.ts`)
- Create a service that generates unique SIA data for each use case
- Include industry-specific threats, compliance requirements, and metrics
- Use the SIA scores from verticals.ts as the source of truth
- Implement realistic variance in metrics while maintaining consistency

### 3. Update UseCaseDashboard Component
- Remove the static `siaAnalysisData` object (lines 111-1051)
- Replace with dynamic calls to the SIA generator service
- Update the `renderSIAAnalysis` function to use dynamic data
- Ensure proper error handling for missing use cases

### 4. Refactor Standalone SIA Pages
- Update routing in App.tsx to include use case ID parameters
- Modify SecurityAnalysis.tsx to accept and display dynamic data
- Modify IntegrityAnalysis.tsx to accept and display dynamic data
- Modify AccuracyAnalysis.tsx to accept and display dynamic data
- Remove all hardcoded scores and metrics

### 5. Implement Caching Strategy
- Add in-memory caching to prevent regenerating data on every render
- Set appropriate cache duration (5 minutes recommended)
- Include cache invalidation mechanisms

## Implementation Steps for Code Mode

### Step 1: Create Type Definitions
1. Create `packages/frontend/src/types/sia.types.ts`
2. Copy all TypeScript interfaces from the implementation guide
3. Export all interfaces for use across the application

### Step 2: Implement SIA Generator Service
1. Create `packages/frontend/src/services/siaDataGenerator.service.ts`
2. Implement the complete SIADataGeneratorService class
3. Include all vertical-specific data (threats, compliance, etc.)
4. Implement all helper methods for metric generation

### Step 3: Update UseCaseDashboard
1. Import the new types and generator service
2. Remove the static `siaAnalysisData` object (lines 111-1051)
3. Create `getSIADataForUseCase` function
4. Update `renderSIAAnalysis` to use dynamic data
5. Add `findUseCaseById` helper function
6. Implement caching for generated data

### Step 4: Update App.tsx Routes
```typescript
// Update routes to include use case ID parameter
<Route path="/security-analysis/:useCaseId" element={<SecurityAnalysis />} />
<Route path="/integrity-analysis/:useCaseId" element={<IntegrityAnalysis />} />
<Route path="/accuracy-analysis/:useCaseId" element={<AccuracyAnalysis />} />
```

### Step 5: Refactor Standalone Pages
For each page (SecurityAnalysis, IntegrityAnalysis, AccuracyAnalysis):
1. Import useParams from react-router-dom
2. Import the SIA generator service
3. Get useCaseId from params
4. Generate dynamic data using the service
5. Replace hardcoded values with dynamic data
6. Update navigation to include use case ID

### Step 6: Testing & Validation
1. Test all 79 use cases for unique data generation
2. Verify SIA scores match verticals.ts
3. Ensure no 'oilfield-land-lease' references remain
4. Test navigation between dashboard and standalone pages
5. Validate data consistency across views

## Key Files to Modify

1. **New Files to Create:**
   - `packages/frontend/src/types/sia.types.ts`
   - `packages/frontend/src/services/siaDataGenerator.service.ts`

2. **Files to Update:**
   - `packages/frontend/src/pages/UseCaseDashboard.tsx`
   - `packages/frontend/src/pages/SecurityAnalysis.tsx`
   - `packages/frontend/src/pages/IntegrityAnalysis.tsx`
   - `packages/frontend/src/pages/AccuracyAnalysis.tsx`
   - `packages/frontend/src/App.tsx`

## Vertical-Specific Considerations

Each vertical has unique security threats, compliance requirements, and operational characteristics:

- **Energy**: SCADA vulnerabilities, NERC CIP compliance, grid resilience
- **Healthcare**: PHI protection, HIPAA compliance, medical device security
- **Finance**: Transaction security, PCI DSS, fraud prevention
- **Manufacturing**: IP protection, industrial espionage, supply chain security
- **Retail**: POS security, customer data protection, e-commerce fraud
- **Logistics**: Cargo tracking, route optimization, fleet management
- **Education**: FERPA compliance, student data privacy, online learning security
- **Pharma**: GxP compliance, clinical trial data, supply chain integrity
- **Government**: Nation-state threats, citizen data protection, critical infrastructure
- **Telecom**: Network security, SS7 vulnerabilities, customer data
- **Real Estate**: Property records, financial data, smart building security

## Success Criteria

1. ✅ All 79 use cases display unique, contextually appropriate SIA data
2. ✅ No hardcoded values or static fallbacks remain
3. ✅ SIA scores from verticals.ts are accurately reflected
4. ✅ Consistent data between dashboard and standalone pages
5. ✅ Realistic, industry-appropriate metrics and recommendations
6. ✅ Clean, maintainable code architecture
7. ✅ Performance remains responsive with dynamic generation

## Notes for Implementation

- The generator should produce slight variations in metrics to appear realistic
- Maintain consistency between dashboard percentages and detailed analysis
- Use appropriate icons from Heroicons for visual consistency
- Ensure error handling for edge cases (missing use cases, invalid IDs)
- Consider adding loading states while data is being generated
- Implement proper TypeScript typing throughout

## Ready for Code Mode

This planning phase has created comprehensive documentation for the SIA refactoring:
1. Detailed implementation guides with code examples
2. Complete TypeScript interfaces
3. Full SIA generator service implementation
4. Integration instructions for all affected components
5. Testing and validation checklist

The next step is to switch to Code mode to implement these changes.