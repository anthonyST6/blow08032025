# Use Case Dashboard - Quick Start Guide

## Overview
This guide provides a rapid path to see the Use Case Dashboard in action with the Oilfield Land Lease use case.

## Key Concepts Demonstrated

1. **Blank State** - Dashboard shows empty state when no use case is selected
2. **Dynamic Loading** - Content loads based on Mission Control selection
3. **Action Execution** - Vanguard actions can be triggered with audit logging
4. **Navigation Lock** - Cannot change use case from within dashboard

## Quick Implementation Steps

### 1. Create a Mock Oilfield Dashboard Component

This simplified version demonstrates all key concepts:

```typescript
// packages/frontend/src/components/use-case-dashboard/templates/oilfield-land-lease/OilfieldLandLeaseDashboard.tsx

import React, { useState } from 'react';
import { 
  MapPinIcon, 
  SparklesIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Mock lease data
const mockLeases = [
  {
    id: 'LEASE-001',
    name: 'Eagle Ford Shale Unit A-1',
    status: 'active',
    expirationDays: 180,
    value: 8500000,
    location: 'Karnes County, TX',
    compliance: { security: true, integrity: true, accuracy: true }
  },
  {
    id: 'LEASE-002',
    name: 'Permian Basin Block 42',
    status: 'expiring-soon',
    expirationDays: 45,
    value: 12300000,
    location: 'Midland County, TX',
    compliance: { security: true, integrity: false, accuracy: true }
  },
  {
    id: 'LEASE-003',
    name: 'Bakken Formation Tract 7',
    status: 'under-review',
    expirationDays: 90,
    value: 6200000,
    location: 'McKenzie County, ND',
    compliance: { security: true, integrity: true, accuracy: false }
  }
];

export const OilfieldLandLeaseDashboard: React.FC = () => {
  const [selectedLease, setSelectedLease] = useState<string | null>(null);
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const executeVanguardAction = async (action: string, leaseId?: string) => {
    setExecutingAction(action);
    
    // Log to console (in real app, this would use audit logger)
    console.log('🚀 Vanguard Action:', {
      action,
      leaseId,
      timestamp: new Date().toISOString(),
      user: 'current-user'
    });
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExecutingAction(null);
    
    // Show success (in real app, use toast)
    alert(`✅ ${action} completed successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Leases</p>
              <p className="text-2xl font-bold text-white">1,247</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">$485M</p>
            </div>
            <MapPinIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-400">23</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Compliance</p>
              <p className="text-2xl font-bold text-green-400">94.5%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lease Portfolio */}
        <div className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Active Leases</h3>
          
          <div className="space-y-3">
            {mockLeases.map(lease => (
              <div
                key={lease.id}
                onClick={() => setSelectedLease(lease.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedLease === lease.id
                    ? 'bg-amber-900/20 border-amber-600'
                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{lease.name}</h4>
                    <p className="text-sm text-gray-400">{lease.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      ${(lease.value / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires in {lease.expirationDays} days
                    </p>
                  </div>
                </div>
                
                {/* SIA Compliance Indicators */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">SIA:</span>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.security ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.integrity ? 'bg-red-500' : 'bg-gray-600'
                    }`} />
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.accuracy ? 'bg-green-500' : 'bg-gray-600'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vanguard Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            Vanguard Actions
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => executeVanguardAction('Validate All Lease Data')}
              disabled={!!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Validate All Data</span>
                {executingAction === 'Validate All Lease Data' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Accuracy Vanguard</p>
            </button>
            
            <button
              onClick={() => executeVanguardAction('Analyze Renewals', selectedLease)}
              disabled={!selectedLease || !!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Analyze Selected Lease</span>
                {executingAction === 'Analyze Renewals' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Negotiation Vanguard</p>
            </button>
            
            <button
              onClick={() => executeVanguardAction('Optimize Portfolio')}
              disabled={!!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Optimize Portfolio</span>
                {executingAction === 'Optimize Portfolio' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Optimization Vanguard</p>
            </button>
          </div>
          
          {selectedLease && (
            <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-700">
              <p className="text-xs text-amber-400">
                Selected: {mockLeases.find(l => l.id === selectedLease)?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 2. Update the Use Case Dashboard to Show Content

Update the existing UseCaseDashboard.tsx to properly handle the selected use case:

```typescript
// In UseCaseDashboard.tsx, update the renderUseCaseContent function:

const renderUseCaseContent = () => {
  // Log the current selection for debugging
  console.log('Current Use Case:', useCaseId);
  
  switch (useCaseId) {
    case 'energy-oilfield-land-lease':
      return <OilfieldLandLeaseDashboard />;
    default:
      return (
        <div className="p-6 text-center">
          <p className="text-gray-400">
            Use case template not yet implemented: {useCaseId}
          </p>
        </div>
      );
  }
};
```

### 3. Test the Flow

1. **Start at Mission Control**
   - Navigate to `/mission-control`
   - Select "Energy" vertical
   - Choose "Oilfield Land Lease" use case
   - Click "Run"

2. **Observe Use Case Dashboard**
   - Should show the Oilfield dashboard with metrics
   - Click on leases to select them
   - Execute Vanguard actions
   - Check console for action logs

3. **Test Navigation**
   - Use "Mission Control" button to go back
   - Verify you cannot change use case from dashboard
   - Return and verify state is preserved

## Key Points to Validate

✅ **Blank State**: Navigate directly to `/use-case-dashboard` - should show blank state

✅ **State Persistence**: Select a use case, navigate away and back - selection should persist

✅ **Action Logging**: All Vanguard actions should log to console (will be audit trail in production)

✅ **Navigation Lock**: No way to change use case from within dashboard

✅ **Interactive Elements**: Leases are selectable, actions are executable

## Next Steps

Once this prototype is working:

1. Replace mock data with real API calls
2. Implement proper audit logging service
3. Add WebSocket for real-time updates
4. Create more sophisticated visualizations
5. Add error handling and loading states
6. Implement actual Vanguard agent integration

## Troubleshooting

If the dashboard shows blank after selecting a use case:
- Check browser console for errors
- Verify `useMissionControlPersistence` hook is working
- Check that the use case ID matches exactly: `energy-oilfield-land-lease`
- Ensure session storage is not blocked

If actions don't execute:
- Check console for error messages
- Verify button states (disabled/enabled)
- Check that mock delays are completing

## Benefits of This Approach

1. **Quick Validation** - See the concept in action immediately
2. **User Feedback** - Get early input on UX flow
3. **Iterative Development** - Build on working foundation
4. **Risk Reduction** - Identify issues before heavy implementation