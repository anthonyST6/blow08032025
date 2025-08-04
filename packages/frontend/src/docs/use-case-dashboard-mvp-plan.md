# Use Case Dashboard MVP Implementation Plan (Revised)

## MVP Scope (Week 1)

### Goal
Create a working Use Case Dashboard that:
1. Starts blank when no use case is selected
2. Loads and displays the Oilfield Land Lease use case when selected from Mission Control
3. Shows basic lease data in a grid with actionable buttons
4. Allows users to execute Vanguard actions
5. Logs all actions to the Mission Control audit trail
6. Displays key metrics with interactive features
7. Cannot change the selected use case (must return to Mission Control)

### File Structure for MVP

```
packages/frontend/src/
├── pages/
│   └── dashboards/
│       └── mission-control/
│           └── UseCaseDashboard.tsx (UPDATE EXISTING)
├── components/
│   └── use-case-dashboard/
│       ├── BlankState.tsx (NEW)
│       ├── UseCaseHeader.tsx (NEW)
│       ├── ActionLogger.tsx (NEW)
│       └── templates/
│           └── oilfield-land-lease/
│               ├── OilfieldLandLeaseDashboard.tsx (NEW)
│               ├── components/
│               │   ├── LeaseMetrics.tsx (NEW)
│               │   ├── LeaseGrid.tsx (NEW)
│               │   ├── LeaseAlerts.tsx (NEW)
│               │   ├── VanguardActionPanel.tsx (NEW)
│               │   └── LeaseActionButtons.tsx (NEW)
│               ├── hooks/
│               │   ├── useLeaseActions.ts (NEW)
│               │   └── useVanguardExecution.ts (NEW)
│               └── mockData.ts (NEW)
├── hooks/
│   ├── useSelectedUseCase.ts (NEW)
│   └── useAuditLogger.ts (NEW)
└── services/
    └── auditService.ts (NEW)
```

## Step-by-Step Implementation

### Step 1: Create the Audit Logger Hook

```typescript
// packages/frontend/src/hooks/useAuditLogger.ts
import { useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useMissionControlPersistence } from './useMissionControlPersistence';

export enum ActionType {
  VANGUARD_EXECUTION = 'vanguard_execution',
  VANGUARD_RESULT = 'vanguard_result',
  DATA_EXPORT = 'data_export',
  WORKFLOW_INITIATED = 'workflow_initiated',
  USER_ACTION = 'user_action',
}

interface LogActionParams {
  actionType: ActionType;
  actionDetails: {
    component: string;
    description: string;
    parameters?: Record<string, any>;
    result?: any;
  };
}

export const useAuditLogger = () => {
  const { user } = useAuth();
  const { selectedUseCase } = useMissionControlPersistence();
  
  const logAction = useCallback(async (params: LogActionParams) => {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: user?.uid,
        userEmail: user?.email,
        useCaseId: selectedUseCase,
        ...params,
        metadata: {
          source: 'use-case-dashboard',
          sessionId: sessionStorage.getItem('sessionId'),
        }
      };
      
      // Send to backend
      await api.post('/api/audit/log', logEntry);
      
      // Also update local state for immediate UI feedback
      // This will be picked up by Mission Control's audit trail
      const event = new CustomEvent('audit-log-entry', { detail: logEntry });
      window.dispatchEvent(event);
      
      return logEntry;
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }, [user, selectedUseCase]);
  
  return { logAction };
};
```

### Step 2: Create the Selected Use Case Hook

```typescript
// packages/frontend/src/hooks/useSelectedUseCase.ts
import { useMissionControlPersistence } from './useMissionControlPersistence';
import { useNavigate } from 'react-router-dom';

export const useSelectedUseCase = () => {
  const navigate = useNavigate();
  const { 
    selectedUseCase, 
    selectedUseCaseDetails,
    clearState 
  } = useMissionControlPersistence();
  
  const returnToMissionControl = () => {
    // Don't clear state - user might want to come back
    navigate('/mission-control');
  };
  
  const clearAndReturn = () => {
    // Clear selection and return
    clearState();
    navigate('/mission-control');
  };
  
  return {
    useCaseId: selectedUseCase,
    useCaseDetails: selectedUseCaseDetails,
    hasSelection: !!selectedUseCase,
    returnToMissionControl,
    clearAndReturn
  };
};
```

### Step 3: Create Blank State Component

```typescript
// packages/frontend/src/components/use-case-dashboard/BlankState.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';

export const BlankState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center max-w-2xl p-8">
        <div className="mb-8">
          <MapIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <div className="w-16 h-1 bg-amber-500 mx-auto"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          No Use Case Selected
        </h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          The Use Case Dashboard displays detailed analytics and controls for your selected use case. 
          Please select a use case from Mission Control to begin.
        </p>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/mission-control')}
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go to Mission Control
        </Button>
      </div>
    </div>
  );
};
```

### Step 4: Create Use Case Header Component

```typescript
// packages/frontend/src/components/use-case-dashboard/UseCaseHeader.tsx
import React from 'react';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { useSelectedUseCase } from '../../hooks/useSelectedUseCase';

export const UseCaseHeader: React.FC = () => {
  const { useCaseDetails, returnToMissionControl } = useSelectedUseCase();
  
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={returnToMissionControl}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Mission Control
          </Button>
          
          <div className="h-6 w-px bg-gray-600" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {useCaseDetails?.name || 'Use Case Dashboard'}
              </h1>
              <p className="text-sm text-gray-400">
                {useCaseDetails?.vertical || 'Energy'} • Active Session
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Data
        </div>
      </div>
    </div>
  );
};
```

### Step 5: Create Vanguard Action Panel

```typescript
// packages/frontend/src/components/use-case-dashboard/templates/oilfield-land-lease/components/VanguardActionPanel.tsx
import React, { useState } from 'react';
import { SparklesIcon, DocumentMagnifyingGlassIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuditLogger, ActionType } from '../../../../../hooks/useAuditLogger';
import { toast } from 'react-hot-toast';

interface VanguardAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  vanguard: string;
  color: string;
}

const vanguardActions: VanguardAction[] = [
  {
    id: 'validate-data',
    name: 'Validate Lease Data',
    description: 'Run Accuracy Vanguard to validate against CLM',
    icon: DocumentMagnifyingGlassIcon,
    vanguard: 'accuracy',
    color: 'text-green-500'
  },
  {
    id: 'analyze-renewal',
    name: 'Analyze Renewals',
    description: 'Run Negotiation Vanguard for optimal terms',
    icon: ChartBarIcon,
    vanguard: 'negotiation',
    color: 'text-blue-500'
  },
  {
    id: 'optimize-portfolio',
    name: 'Optimize Portfolio',
    description: 'Run Optimization Vanguard for ROI',
    icon: SparklesIcon,
    vanguard: 'optimization',
    color: 'text-amber-500'
  },
  {
    id: 'audit-compliance',
    name: 'Audit Compliance',
    description: 'Run Security Vanguard for compliance check',
    icon: ShieldCheckIcon,
    vanguard: 'security',
    color: 'text-red-500'
  }
];

export const VanguardActionPanel: React.FC = () => {
  const { logAction } = useAuditLogger();
  const [executing, setExecuting] = useState<string | null>(null);
  
  const executeVanguardAction = async (action: VanguardAction) => {
    setExecuting(action.id);
    
    // Log action start
    await logAction({
      actionType: ActionType.VANGUARD_EXECUTION,
      actionDetails: {
        component: 'VanguardActionPanel',
        description: `Executing ${action.name}`,
        parameters: {
          actionId: action.id,
          vanguard: action.vanguard
        }
      }
    });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log success
      await logAction({
        actionType: ActionType.VANGUARD_RESULT,
        actionDetails: {
          component: 'VanguardActionPanel',
          description: `${action.name} completed successfully`,
          result: {
            status: 'success',
            message: 'Analysis complete',
            timestamp: new Date().toISOString()
          }
        }
      });
      
      toast.success(`${action.name} completed successfully`);
    } catch (error) {
      toast.error(`Failed to execute ${action.name}`);
    } finally {
      setExecuting(null);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-amber-500" />
        Vanguard Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {vanguardActions.map((action) => {
          const Icon = action.icon;
          const isExecuting = executing === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => executeVanguardAction(action)}
              disabled={!!executing}
              className={`
                p-4 rounded-lg border transition-all
                ${isExecuting 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                }
                ${executing && !isExecuting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gray-800 ${isExecuting ? 'animate-pulse' : ''}`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-medium text-white">
                    {action.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
              {isExecuting && (
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-amber-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

### Step 6: Update the Main Use Case Dashboard

```typescript
// packages/frontend/src/pages/dashboards/mission-control/UseCaseDashboard.tsx
import React from 'react';
import { useSelectedUseCase } from '../../../hooks/useSelectedUseCase';
import { BlankState } from '../../../components/use-case-dashboard/BlankState';
import { UseCaseHeader } from '../../../components/use-case-dashboard/UseCaseHeader';
import { OilfieldLandLeaseDashboard } from '../../../components/use-case-dashboard/templates/oilfield-land-lease/OilfieldLandLeaseDashboard';

const UseCaseDashboard: React.FC = () => {
  const { useCaseId, hasSelection } = useSelectedUseCase();
  
  // If no use case is selected, show blank state
  if (!hasSelection) {
    return <BlankState />;
  }
  
  // Render the appropriate use case template based on the selected ID
  const renderUseCaseContent = () => {
    switch (useCaseId) {
      case 'energy-oilfield-land-lease':
        return <OilfieldLandLeaseDashboard />;
      // Add more use cases here as they're implemented
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
  
  return (
    <div className="min-h-screen bg-gray-900">
      <UseCaseHeader />
      <div className="p-6">
        {renderUseCaseContent()}
      </div>
    </div>
  );
};

export default UseCaseDashboard;
```

## Key MVP Features

### 1. Action Logging
- Every user action is logged to the audit trail
- Actions are visible in Mission Control's audit tab
- Real-time updates via custom events

### 2. Vanguard Integration
- Execute Vanguard agents from the dashboard
- See real-time progress
- Results logged to audit trail

### 3. Interactive Components
- Clickable lease items
- Action buttons for workflows
- Export capabilities
- Filter and search

### 4. Navigation Flow
- Clear path back to Mission Control
- Cannot change use case from dashboard
- Session persistence across navigation

## Testing Checklist

- [ ] Navigate from Mission Control to Use Case Dashboard
- [ ] Verify blank state when no use case selected
- [ ] Execute Vanguard actions and verify audit logs
- [ ] Test navigation back to Mission Control
- [ ] Verify session persistence
- [ ] Check audit trail in Mission Control
- [ ] Test error handling for failed actions
- [ ] Verify real-time updates

## Next Steps After MVP

1. Add WebSocket support for real-time updates
2. Implement actual API calls to Vanguard agents
3. Add more interactive features (filters, exports, etc.)
4. Create additional use case templates
5. Add role-based action permissions
6. Implement workflow orchestration