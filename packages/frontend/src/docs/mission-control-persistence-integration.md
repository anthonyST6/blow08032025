# Mission Control Persistence Integration Guide

## Overview

This guide explains how to integrate the persistence service into Mission Control to fix the issue where use case selections are lost when navigating between Mission Control and Use Case Dashboard.

## The Problem

Currently, Mission Control uses local React state (`useState`) for the selected use case, which is lost when navigating away from the component. The Use Case Dashboard expects to read this selection from the persistence service, but it's never saved there.

## The Solution

There are two approaches to fix this:

### Option 1: Minimal Changes Using UseCaseSelector Component

1. Import the `UseCaseSelector` component in MissionControl.tsx:
```typescript
import { UseCaseSelector } from '@/components/mission-control/UseCaseSelector';
```

2. Find where use cases are rendered (around line 3883) and wrap them:
```typescript
// BEFORE:
<button
  key={useCase.id}
  onClick={() => setSelectedUseCase(useCase)}
  disabled={!useCase.active}
  className="..."
>
  {/* use case content */}
</button>

// AFTER:
<UseCaseSelector
  key={useCase.id}
  useCase={useCase}
  onSelect={setSelectedUseCase}
  disabled={!useCase.active}
>
  <button className="...">
    {/* use case content */}
  </button>
</UseCaseSelector>
```

### Option 2: Direct Integration (Recommended)

1. Add the import at the top of MissionControl.tsx:
```typescript
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';
```

2. Replace the useState hook (around line 3048):
```typescript
// REMOVE THIS:
const [selectedUseCase, setSelectedUseCase] = useState<any>(null);

// ADD THIS:
const {
  selectedUseCase: persistedUseCaseId,
  selectedUseCaseDetails,
  setSelectedVertical,
  setSelectedUseCase: setPersistedUseCase,
} = useMissionControlPersistence();

// Keep local state for backward compatibility
const [selectedUseCase, setSelectedUseCaseLocal] = useState<any>(selectedUseCaseDetails);

// Sync persisted state with local state
useEffect(() => {
  setSelectedUseCaseLocal(selectedUseCaseDetails);
}, [selectedUseCaseDetails]);

// Create wrapper function
const setSelectedUseCase = (useCase: any) => {
  if (!useCase) {
    setPersistedUseCase(null);
    setSelectedUseCaseLocal(null);
    return;
  }
  
  // Extract vertical from use case ID
  const vertical = useCase.id.split('-')[0];
  
  // Persist the selection
  setSelectedVertical(vertical);
  setPersistedUseCase(useCase.id, useCase);
  
  // Update local state
  setSelectedUseCaseLocal(useCase);
};
```

## Testing the Integration

1. **Select a use case in Mission Control**
   - Click on "Oilfield Land Lease Management"
   - Check browser console for "Persisting use case selection" log

2. **Navigate to Use Case Dashboard**
   - Click on "Use Case Dashboard" in the navigation
   - Should see the Oilfield Land Lease template loaded

3. **Navigate back to Mission Control**
   - Click "Mission Control" in the header
   - The use case should still be selected

4. **Test Clear Selection**
   - In Use Case Dashboard, click "Clear Selection" button
   - Should return to Mission Control with no selection

5. **Test Page Refresh**
   - Select a use case
   - Refresh the page (F5)
   - Selection should persist (valid for 24 hours)

## Debugging

Check the browser's Local Storage:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Look for `mission-control-state` key
4. Should contain:
```json
{
  "sessionId": "mc-session-...",
  "selectedVertical": "energy",
  "selectedUseCase": "energy-oilfield-land-lease",
  "selectedUseCaseDetails": { ... },
  "lastUpdated": "2025-08-03T...",
  "expiresAt": "2025-08-04T..."
}
```

## Common Issues

1. **State not persisting**: Check if localStorage is enabled
2. **Wrong use case ID**: Ensure the ID format is "vertical-use-case-name"
3. **Clear not working**: Verify the clearAndReturn function is called

## Next Steps

After implementing the persistence fix:
1. Test all use case selections
2. Verify audit logging works
3. Add more use case templates
4. Implement real data fetching