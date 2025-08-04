# Mission Control Restore Patch

This patch adds the ability for Mission Control to restore persisted use case selections when the component mounts.

## Implementation

Add the following code to the Mission Control component:

### 1. Add restore event listener in useEffect

Add this useEffect hook near the top of the MissionControl component (after the state declarations):

```typescript
// Add this useEffect to handle restoring persisted state
useEffect(() => {
  const handleRestoreSelection = (event: CustomEvent) => {
    const { vertical, useCaseId, useCase } = event.detail;
    
    console.log('[MissionControl] Restoring persisted selection:', {
      vertical,
      useCaseId,
      useCase
    });
    
    // Find the industry that matches the vertical
    const industry = industries.find(ind => 
      ind.name.toLowerCase() === vertical || 
      ind.id === vertical
    );
    
    if (industry) {
      setSelectedIndustry(industry);
    }
    
    // Set the selected use case
    if (useCase) {
      setSelectedUseCase(useCase);
    }
  };
  
  // Listen for restore event
  window.addEventListener('restoreUseCaseSelection', handleRestoreSelection as EventListener);
  
  // Cleanup
  return () => {
    window.removeEventListener('restoreUseCaseSelection', handleRestoreSelection as EventListener);
  };
}, []);
```

### 2. Update the use case selection to include the vertical

When selecting a use case, make sure to include the vertical in the use case object:

```typescript
// Update the onClick handler for use case selection
onClick={() => {
  const useCaseWithVertical = {
    ...useCase,
    vertical: selectedIndustry.id || selectedIndustry.name.toLowerCase()
  };
  setSelectedUseCase(useCaseWithVertical);
  emitUseCaseSelection(useCaseWithVertical);
}}
```

## Summary

These changes will:
1. Listen for the `restoreUseCaseSelection` event when Mission Control mounts
2. Restore both the selected industry/vertical and the selected use case
3. Ensure that the vertical is included when persisting use case selections

This enables Mission Control to maintain its state across navigation and page refreshes.