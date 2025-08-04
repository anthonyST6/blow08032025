# Fix Implementation Plan

## Can This Be Fixed? YES! ✅

The issues are completely fixable because:
1. All components are built correctly
2. The persistence service works perfectly
3. We just need to connect Mission Control to use it

## Fix Strategy: Test-First Approach

### Step 1: Create Integration Tests First
This ensures we fix the right thing and know when it's working.

### Step 2: Minimal Mission Control Fix
Use the UseCaseSelector wrapper for the least invasive change.

### Step 3: Verify End-to-End Flow
Test the complete user journey.

### Step 4: Add Missing Orchestration (Later)
This can be added incrementally without breaking existing functionality.

## Immediate Fix Plan (Priority 1)

### 1. Create Integration Test File
```typescript
// packages/frontend/src/tests/mission-control-integration.test.ts
import { describe, test, expect, beforeEach } from 'vitest';

describe('Mission Control to Use Case Dashboard Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('selecting use case in Mission Control persists to localStorage', () => {
    // 1. Simulate selecting a use case
    const useCase = {
      id: 'energy-oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      vertical: 'energy'
    };
    
    // 2. This should save to persistence
    // Currently fails - will pass after fix
    
    // 3. Check localStorage
    const saved = localStorage.getItem('mission-control-state');
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved).selectedUseCase).toBe('energy-oilfield-land-lease');
  });

  test('Use Case Dashboard reads persisted selection', () => {
    // 1. Set up persisted state
    const state = {
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: {
        id: 'energy-oilfield-land-lease',
        name: 'Oilfield Land Lease Management'
      }
    };
    localStorage.setItem('mission-control-state', JSON.stringify(state));
    
    // 2. Use Case Dashboard should read it
    // This already works!
  });

  test('Clear selection removes persistence', () => {
    // 1. Set up state
    // 2. Clear selection
    // 3. Verify localStorage is cleared
  });
});
```

### 2. Apply Minimal Fix to Mission Control

Since the MissionControl.tsx file is too large to edit directly, we'll use a wrapper approach:

#### Option A: Create a Persistence Wrapper (Recommended)
```typescript
// packages/frontend/src/components/mission-control/MissionControlPersistenceWrapper.tsx
import React from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';

export const MissionControlPersistenceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setSelectedVertical, setSelectedUseCase } = useMissionControlPersistence();

  React.useEffect(() => {
    // Listen for use case selection events
    const handleUseCaseSelect = (event: CustomEvent) => {
      const useCase = event.detail;
      if (useCase) {
        const vertical = useCase.id.split('-')[0];
        setSelectedVertical(vertical);
        setSelectedUseCase(useCase.id, useCase);
        console.log('Persisted use case selection:', useCase);
      }
    };

    window.addEventListener('useCaseSelected', handleUseCaseSelect as EventListener);
    return () => {
      window.removeEventListener('useCaseSelected', handleUseCaseSelect as EventListener);
    };
  }, [setSelectedVertical, setSelectedUseCase]);

  return <>{children}</>;
};
```

Then modify where use cases are clicked in MissionControl to emit this event:
```typescript
// In MissionControl.tsx, modify the onClick handler
onClick={() => {
  setSelectedUseCase(useCase);
  // Add this line:
  window.dispatchEvent(new CustomEvent('useCaseSelected', { detail: useCase }));
}}
```

#### Option B: Direct Integration (More Complex)
Follow the guide in `mission-control-persistence-integration.md`

### 3. Test the Fix
1. Select "Oilfield Land Lease Management" in Mission Control
2. Open DevTools > Application > Local Storage
3. Verify `mission-control-state` contains the selection
4. Navigate to Use Case Dashboard
5. Verify the template loads
6. Click "Clear Selection"
7. Verify return to Mission Control with no selection

## Future Enhancements (Priority 2)

### 1. Add Orchestration Layer
```typescript
// packages/frontend/src/orchestration/UseCaseOrchestrator.ts
export class UseCaseOrchestrator {
  private templates = new Map();
  
  registerTemplate(id: string, template: UseCaseTemplate) {
    this.templates.set(id, template);
  }
  
  loadTemplate(useCaseId: string) {
    return this.templates.get(useCaseId);
  }
}
```

### 2. Create Template Registry
Instead of direct imports, use a registry pattern for better scalability.

### 3. Add Data Pipeline
Centralize data fetching and caching.

## Timeline

### Today (Immediate)
1. ✅ Create integration tests (30 min)
2. ✅ Apply minimal fix to Mission Control (1 hour)
3. ✅ Test end-to-end flow (30 min)

### This Week (Important)
1. Add orchestration layer
2. Create template registry
3. Document the fix

### Next Sprint (Nice to Have)
1. Connect to real APIs
2. Add WebSocket support
3. Create more use case templates

## Success Criteria

The fix is successful when:
1. ✅ Integration tests pass
2. ✅ Use case selection persists across navigation
3. ✅ Clear selection works properly
4. ✅ State survives page refresh

## Risk Assessment

**Risk**: Breaking existing Mission Control functionality
**Mitigation**: Use wrapper approach for minimal changes

**Risk**: Performance impact
**Mitigation**: Persistence service already debounces saves

**Risk**: Browser compatibility
**Mitigation**: localStorage is widely supported

## Conclusion

This is a straightforward fix that will make everything work as designed. The architecture is sound, the components are correct, we just need to connect them properly.

**Estimated Time to Fix**: 2-3 hours
**Confidence Level**: High (95%)
**Impact**: Enables the entire Use Case Dashboard feature