# Global Context Implementation Plan for Vanguards Platform

## Overview
This document outlines the implementation plan for global use case context handling across the Vanguards platform, enabling automatic data propagation and seamless user experience.

## Current State Analysis

### Existing Infrastructure
- `UseCaseContext` already has:
  - `activeUseCaseId`: Currently stored in localStorage
  - `activeUseCaseData`: Structure for unified data
  - Basic state management

### Gaps to Address
1. Automatic workflow triggering on use case launch
2. Unified data loading and propagation
3. Reset functionality in Mission Control
4. Baseline dummy data when no use case is active
5. Tab synchronization without manual selection

## Implementation Architecture

### 1. Enhanced Global Context Structure

```typescript
interface GlobalUseCaseContext {
  // Core state
  activeUseCaseId: string | null;
  activeUseCaseData: UnifiedUseCaseData | null;
  
  // Baseline data (when no use case is active)
  baselineData: UnifiedUseCaseData;
  
  // Loading states
  isLoading: boolean;
  isRunningWorkflow: boolean;
  isDeploying: boolean;
  
  // Actions
  launchUseCase: (useCaseId: string) => Promise<void>;
  resetContext: () => void;
  refreshData: () => Promise<void>;
}
```

### 2. Unified Data Structure

```typescript
interface UnifiedUseCaseData {
  // High-level KPIs
  summary: {
    activeItems: number;
    successRate: number;
    costSavings: number;
    efficiencyGain: number;
    metrics: MetricData[];
  };
  
  // Domain-specific data
  domainData: {
    leases?: LeaseData[];
    compliance?: ComplianceData;
    financial?: FinancialData;
    energy?: EnergyData;
  };
  
  // Operational data
  operations: {
    workflows: WorkflowData[];
    agents: AgentData[];
    deployments: DeploymentData[];
  };
  
  // Logs and outputs
  logs: {
    integration: IntegrationLog[];
    audit: AuditLog[];
    outputs: OutputData[];
  };
  
  // Certifications
  certifications: CertificationData[];
}
```

### 3. API Endpoints Structure

```typescript
// Use case data endpoints
GET  /api/usecases/default/data     // Baseline dummy data
GET  /api/usecases/:id/data         // Specific use case data
POST /api/usecases/:id/runWorkflows // Trigger workflows
POST /api/usecases/:id/deploy       // Deploy agents
GET  /api/usecases/:id/status       // Check execution status
```

### 4. Data Flow Architecture

```
User Action Flow:
1. User selects use case in Launcher
2. System sets activeUseCaseId
3. Automatically triggers:
   - POST /api/usecases/:id/runWorkflows
   - POST /api/usecases/:id/deploy
4. Polls for completion
5. Fetches unified data: GET /api/usecases/:id/data
6. Updates activeUseCaseData
7. All tabs react to context change
8. Redirects to Workflows page
```

### 5. Component Updates

#### Use Case Launcher
```typescript
const handleLaunch = async (useCase: UseCase) => {
  try {
    // Set loading state
    setIsLaunching(true);
    
    // Launch use case (triggers workflows & deployment)
    await launchUseCase(useCase.id);
    
    // Redirect to workflows
    navigate('/workflows');
  } catch (error) {
    toast.error('Failed to launch use case');
  }
};
```

#### Mission Control (Dashboard)
```typescript
// Add reset button
<Button
  onClick={() => {
    if (confirm('Reset to baseline data?')) {
      resetContext();
    }
  }}
  variant="secondary"
  icon={<RefreshIcon />}
>
  Reset Use Case
</Button>
```

#### All Other Tabs
```typescript
// Subscribe to context
const { activeUseCaseId, activeUseCaseData } = useUseCaseContext();

// React to changes
useEffect(() => {
  if (activeUseCaseId) {
    // Load tab-specific data from activeUseCaseData
    loadTabData(activeUseCaseData);
  } else {
    // Show empty state
    showEmptyState();
  }
}, [activeUseCaseId, activeUseCaseData]);
```

### 6. Baseline Dummy Data Strategy

```typescript
const baselineData: UnifiedUseCaseData = {
  summary: {
    activeItems: 42,
    successRate: 94.5,
    costSavings: 2340000,
    efficiencyGain: 67,
    metrics: [
      { name: "Active Processes", value: 12, trend: "up" },
      { name: "System Health", value: 98, trend: "stable" },
      { name: "Data Quality", value: 91, trend: "up" }
    ]
  },
  // ... other baseline data
};
```

### 7. Implementation Steps

#### Phase 1: Context Enhancement
1. Update UseCaseContext with new methods
2. Add baseline data structure
3. Implement localStorage persistence
4. Add context broadcasting

#### Phase 2: API Integration
1. Create mock API endpoints
2. Implement data fetching logic
3. Add polling for async operations
4. Handle error states

#### Phase 3: UI Updates
1. Update Use Case Launcher with auto-trigger
2. Add reset button to Mission Control
3. Update all tabs to use global context
4. Remove redundant use case selectors

#### Phase 4: Testing & Polish
1. Test data flow end-to-end
2. Add loading states and transitions
3. Implement error recovery
4. Add success notifications

## Benefits

1. **Simplified UX**: One-click use case activation
2. **Consistent Data**: All tabs show same use case data
3. **Automatic Flow**: No manual workflow triggering
4. **Clear State**: Easy reset to baseline
5. **Scalable**: Easy to add new use cases

## Technical Considerations

1. **Performance**: Cache data to avoid repeated API calls
2. **Error Handling**: Graceful degradation if APIs fail
3. **State Sync**: Use event emitters for cross-tab sync
4. **Type Safety**: Full TypeScript coverage
5. **Testing**: Unit tests for context logic

## Migration Strategy

1. Keep existing functionality working
2. Implement new context alongside old
3. Gradually migrate components
4. Remove old code once stable