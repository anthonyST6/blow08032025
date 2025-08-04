# Use Case Dashboard Testing Guide

## Testing the MVP Implementation

### Prerequisites
1. Ensure both frontend and backend are running
2. Login to the application

### Test Steps

#### 1. Test Blank State
1. Navigate directly to: `http://localhost:3002/mission-control/use-case`
2. **Expected**: You should see the blank state with "No Use Case Selected" message
3. **Expected**: "Go to Mission Control" button should be visible

#### 2. Test Use Case Selection Flow
1. Click "Go to Mission Control" or navigate to: `http://localhost:3002/mission-control`
2. Select the "Energy" vertical
3. Find and click on "Oilfield Land Lease" use case
4. Click the "Run" button
5. **Expected**: You should be redirected to the Use Case Dashboard
6. **Expected**: The dashboard should show:
   - Header with "Oilfield Land Lease Management" title
   - "Mission Control" back button
   - Key metrics (Total Leases, Portfolio Value, etc.)
   - Active Leases grid
   - Vanguard Actions panel

#### 3. Test Vanguard Actions
1. In the Vanguard Actions panel, click "Validate All Data"
2. **Expected**: Button should show loading state with spinner
3. **Expected**: After 2 seconds, you should see a success toast
4. **Expected**: Check browser console for audit log entries

#### 4. Test Lease Selection
1. Click on any lease in the Active Leases grid
2. **Expected**: Selected lease should be highlighted in amber
3. **Expected**: "Analyze Selected Lease" button should become enabled
4. Click "Analyze Selected Lease"
5. **Expected**: Similar loading behavior and success toast

#### 5. Test Navigation Lock
1. Try to change the URL to select a different use case
2. **Expected**: The dashboard should not allow changing use cases
3. Click "Mission Control" button in header
4. **Expected**: Should navigate back to Mission Control
5. **Expected**: Your previous selection should still be visible

#### 6. Test State Persistence
1. From the Use Case Dashboard, refresh the page (F5)
2. **Expected**: Dashboard should reload with the same use case selected
3. **Expected**: No blank state should appear

### Console Checks
Open browser DevTools console and verify:
- Audit log entries appear when executing actions
- Current use case ID is logged
- No errors in console

### Known Limitations (MVP)
- Data is currently mocked (not from real API)
- Audit logs only appear in console (not sent to backend yet)
- Limited to Oilfield Land Lease use case
- No real-time updates yet

## Troubleshooting

### Dashboard Shows Blank After Selection
1. Check console for errors
2. Verify the use case ID matches: `energy-oilfield-land-lease`
3. Check session storage for `missionControlState`

### Actions Don't Execute
1. Check if buttons are disabled
2. Verify toast notifications are working
3. Check console for error messages

### Navigation Issues
1. Ensure you're using the correct routes
2. Clear session storage and try again
3. Check for any route conflicts

## Next Steps After Testing
1. Implement real API integration
2. Connect audit logging to backend
3. Add WebSocket for real-time updates
4. Implement additional use case templates