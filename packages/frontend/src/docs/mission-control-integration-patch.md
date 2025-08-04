# Mission Control Integration Patch

This document shows the exact changes needed to integrate Mission Control with the persistence service.

## Step 1: Import the Wrapper and Helper Function

Add this import at the top of `MissionControl.tsx`:

```typescript
import { MissionControlPersistenceWrapper, emitUseCaseSelection } from '@/components/mission-control/MissionControlPersistenceWrapper';
```

## Step 2: Wrap the Component

At the very bottom of `MissionControl.tsx`, find where the component is exported and wrap it:

**BEFORE:**
```typescript
export default MissionControl;
```

**AFTER:**
```typescript
// Wrap with persistence
const MissionControlWithPersistence = () => (
  <MissionControlPersistenceWrapper>
    <MissionControl />
  </MissionControlPersistenceWrapper>
);

export default MissionControlWithPersistence;
```

## Step 3: Emit Selection Event

Find where use cases are clicked (around line 3883) and add the event emission:

**BEFORE:**
```typescript
onClick={() => setSelectedUseCase(useCase)}
```

**AFTER:**
```typescript
onClick={() => {
  setSelectedUseCase(useCase);
  emitUseCaseSelection(useCase);  // Add this line
}}
```

## Alternative: Direct onClick Handler

If you can't find the exact location, search for `setSelectedUseCase(` in the file and add `emitUseCaseSelection(useCase);` right after each occurrence.

## Testing the Integration

1. **Open Browser DevTools Console**
2. **Select a Use Case in Mission Control**
   - You should see: `[MissionControlPersistenceWrapper] Persisted use case selection:`
3. **Check Local Storage**
   - DevTools > Application > Local Storage
   - Look for `mission-control-state` key
   - Should contain the selected use case
4. **Navigate to Use Case Dashboard**
   - Should show the selected use case template
5. **Click "Clear Selection"**
   - Should return to Mission Control with no selection

## Minimal Change Summary

Only 3 changes needed:
1. Add import statement
2. Wrap the export
3. Add one line after `setSelectedUseCase`

Total lines changed: ~10 lines
Risk: Minimal - only adds functionality, doesn't change existing behavior