# Mission Control Persistence Patch

This document shows the changes needed to make Mission Control use the persistence service.

## Changes Required in MissionControl.tsx

### 1. Add Import at the top of the file:
```typescript
import { useMissionControlPersistence } from '../../../hooks/useMissionControlPersistence';
```

### 2. Replace the local state with persistence hook (around line 3048):

**REPLACE:**
```typescript
const [selectedUseCase, setSelectedUseCase] = useState<any>(null);
```

**WITH:**
```typescript
// Use persistence hook for state management
const {
  selectedVertical,
  selectedUseCase: persistedUseCaseId,
  selectedUseCaseDetails,
  setSelectedVertical,
  setSelectedUseCase: setPersistedUseCase,
} = useMissionControlPersistence();

// Local state for the full use case object (for backward compatibility)
const [selectedUseCase, setSelectedUseCaseLocal] = useState<any>(selectedUseCaseDetails);

// Update local state when persisted state changes
useEffect(() => {
  setSelectedUseCaseLocal(selectedUseCaseDetails);
}, [selectedUseCaseDetails]);

// Wrapper function to handle use case selection
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
  
  console.log('Persisting use case selection:', {
    vertical,
    useCaseId: useCase.id,
    useCase
  });
};
```

### 3. Add useEffect import if not already present:
```typescript
import React, { useState, useEffect, useMemo } from 'react';
```

## Alternative Approach: Direct Modification

If you prefer to modify the file directly, here are the specific lines to change:

1. **Line ~3048**: Replace the useState declaration
2. **After imports section**: Add the useMissionControlPersistence import
3. **After the useState declarations**: Add the persistence hook usage and wrapper function

## Testing the Changes

After making these changes:

1. Select a use case in Mission Control
2. Navigate to Use Case Dashboard - should show the selected use case
3. Navigate back to Mission Control - selection should persist
4. Refresh the page - selection should still persist (within 24 hours)