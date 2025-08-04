# Persistence Testing Guide

## Quick Test (Without Modifying Mission Control)

### 1. Test Persistence Service Directly

Navigate to: `http://localhost:5173/test-persistence`

This test page allows you to:
- Select use cases and see them persist
- Navigate to Use Case Dashboard to verify it loads
- Clear state and test again
- Verify persistence across page refreshes

### 2. Manual Browser Testing

1. **Open DevTools Console** (F12)
2. **Test persistence manually**:
```javascript
// Save a test selection
localStorage.setItem('mission-control-state', JSON.stringify({
  sessionId: 'test-session',
  selectedVertical: 'energy',
  selectedUseCase: 'energy-oilfield-land-lease',
  selectedUseCaseDetails: {
    id: 'energy-oilfield-land-lease',
    name: 'Oilfield Land Lease Management',
    vertical: 'energy'
  },
  lastUpdated: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString()
}));

// Navigate to Use Case Dashboard
window.location.href = '/use-case-dashboard';
```

3. **Verify the dashboard loads** with the Oilfield template

## After Applying Mission Control Fix

### 1. Integration Test Flow

1. **Navigate to Mission Control**: `http://localhost:5173/mission-control`
2. **Open DevTools Console**
3. **Select "Oilfield Land Lease Management"**
   - Should see: `[MissionControlPersistenceWrapper] Persisted use case selection:`
4. **Check Local Storage**:
   - DevTools > Application > Local Storage
   - Look for `mission-control-state`
   - Should contain:
   ```json
   {
     "selectedVertical": "energy",
     "selectedUseCase": "energy-oilfield-land-lease",
     "selectedUseCaseDetails": { ... }
   }
   ```

5. **Navigate to Use Case Dashboard**
   - Click "Use Case Dashboard" in navigation
   - Should show Oilfield Land Lease template
   - Should NOT show blank state

6. **Test Navigation Back**
   - Click "Mission Control" in header
   - Selection should still be visible

7. **Test Clear Selection**
   - In Use Case Dashboard, click "Clear Selection"
   - Should return to Mission Control
   - Selection should be cleared

8. **Test Page Refresh**
   - Select a use case
   - Refresh page (F5)
   - Selection should persist

### 2. Console Commands for Testing

```javascript
// Check current state
JSON.parse(localStorage.getItem('mission-control-state'))

// Manually trigger selection event (if wrapper is installed)
window.dispatchEvent(new CustomEvent('useCaseSelected', { 
  detail: {
    id: 'energy-oilfield-land-lease',
    name: 'Oilfield Land Lease Management',
    vertical: 'energy'
  }
}));

// Clear state
window.dispatchEvent(new CustomEvent('clearUseCaseSelection'));
```

## Verification Checklist

- [ ] Test page at `/test-persistence` works
- [ ] Can manually set localStorage and Use Case Dashboard reads it
- [ ] After Mission Control fix: selections persist automatically
- [ ] Navigation between dashboards maintains state
- [ ] Clear selection works
- [ ] Page refresh maintains state
- [ ] 24-hour expiration works (check expiresAt field)

## Troubleshooting

### Issue: Use Case Dashboard shows blank state
**Check**: 
- Open DevTools > Application > Local Storage
- Look for `mission-control-state`
- If missing or empty, persistence isn't working

### Issue: Selection not persisting
**Check**:
- Console for errors
- Look for `[MissionControlPersistenceWrapper]` logs
- Verify the wrapper is properly installed

### Issue: Clear selection not working
**Check**:
- Console for `clearUseCaseSelection` event
- Verify the button onClick handler is correct

## Success Indicators

1. **Console shows**: `[MissionControlPersistenceWrapper] Persisted use case selection:`
2. **Local Storage contains**: Valid `mission-control-state` with selection
3. **Use Case Dashboard**: Shows the selected template, not blank state
4. **Navigation**: State persists across page changes
5. **Refresh**: State survives F5 refresh