# KiloCode Implementation Prompt: Global Use Case Context

Implement global use case context across the entire Vanguards platform, with automatic propagation and reset behavior:

## 1. GLOBAL CONTEXT STORE

### Update UseCaseContext (`packages/frontend/src/contexts/UseCaseContext.tsx`)

```typescript
// Add to UnifiedUseCaseData interface
interface UnifiedUseCaseData {
  summary: {
    activeItems: number;
    successRate: number;
    costSavings: number;
    efficiencyGain: number;
    metrics?: Array<{
      name: string;
      value: number | string;
      unit: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }>;
  };
  // Domain-specific data
  domainData?: {
    leases?: any[];
    compliance?: any;
    financial?: any;
    energy?: any;
  };
  // Operational data
  operations?: {
    workflows?: any[];
    agents?: any[];
    deployments?: any[];
  };
  // Logs and outputs
  logs?: {
    integration?: any[];
    audit?: any[];
    outputs?: any[];
  };
  certifications?: any[];
}

// Add baseline data constant
const BASELINE_DUMMY_DATA: UnifiedUseCaseData = {
  summary: {
    activeItems: 42,
    successRate: 94.5,
    costSavings: 2340000,
    efficiencyGain: 67,
    metrics: [
      { name: "Active Processes", value: 12, unit: "count", trend: "up", change: 15 },
      { name: "System Health", value: 98, unit: "%", trend: "stable", change: 0 },
      { name: "Data Quality", value: 91, unit: "%", trend: "up", change: 3 },
      { name: "Cost Reduction", value: 2.34, unit: "M$", trend: "up", change: 12 }
    ]
  }
};

// Add new methods to context
interface UseCaseContextType {
  // ... existing properties
  launchUseCase: (useCaseId: string) => Promise<void>;
  resetContext: () => void;
  refreshData: () => Promise<void>;
  isLaunching: boolean;
  isDeploying: boolean;
}

// Implement launchUseCase method
const launchUseCase = async (useCaseId: string) => {
  setIsLaunching(true);
  setError(null);
  
  try {
    // Set active use case
    setActiveUseCaseId(useCaseId);
    
    // Run workflows
    await api.post(`/api/usecases/${useCaseId}/runWorkflows`);
    
    // Deploy agents
    await api.post(`/api/usecases/${useCaseId}/deploy`);
    
    // Wait for deployment (mock with delay)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch unified data
    const response = await api.get(`/api/usecases/${useCaseId}/data`);
    setActiveUseCaseData(response.data);
    
    toast.success('Use case launched successfully');
  } catch (err) {
    console.error('Failed to launch use case:', err);
    toast.error('Failed to launch use case');
    setError('Failed to launch use case');
    // Reset on error
    setActiveUseCaseId(null);
    setActiveUseCaseData(null);
  } finally {
    setIsLaunching(false);
  }
};

// Implement resetContext method
const resetContext = () => {
  setActiveUseCaseId(null);
  setActiveUseCaseData(null);
  localStorage.removeItem('activeUseCaseId');
  toast.success('Context reset to baseline');
};

// Update the provider to use baseline data when no active use case
const displayData = activeUseCaseId ? activeUseCaseData : BASELINE_DUMMY_DATA;
```

## 2. USE CASE LAUNCHER BEHAVIOR

### Update UseCaseLauncher (`packages/frontend/src/pages/UseCaseLauncher.tsx`)

```typescript
import { useUseCaseContext } from '../contexts/UseCaseContext';

const UseCaseLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { launchUseCase, isLaunching } = useUseCaseContext();
  
  const handleLaunch = async (useCase: UseCase) => {
    try {
      // Show launching state
      toast.loading(`Launching ${useCase.name}...`, { id: 'launch-toast' });
      
      // Launch use case (triggers workflows and deployment)
      await launchUseCase(useCase.id);
      
      // Dismiss loading toast
      toast.dismiss('launch-toast');
      
      // Redirect to workflows page
      setTimeout(() => {
        navigate('/workflows');
      }, 500);
    } catch (error) {
      toast.dismiss('launch-toast');
      toast.error('Failed to launch use case');
    }
  };
  
  // Update button to show loading state
  <Button
    variant="primary"
    size="sm"
    onClick={() => handleLaunch(useCase)}
    disabled={isLaunching}
  >
    {isLaunching ? (
      <>
        <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
        Launching...
      </>
    ) : (
      <>
        <PlayIcon className="w-4 h-4 mr-1" />
        Launch
      </>
    )}
  </Button>
};
```

## 3. MISSION CONTROL RESET BUTTON

### Update Dashboard (`packages/frontend/src/pages/Dashboard.tsx`)

```typescript
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { activeUseCaseId, activeUseCaseData, resetContext } = useUseCaseContext();
  
  // Use context data or baseline
  const displayData = activeUseCaseData || BASELINE_DUMMY_DATA;
  
  return (
    <div className="min-h-screen bg-seraphim-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center">
              <img src="/seraphim-vanguards-logo.png" alt="Seraphim Vanguards" className="h-44 w-auto object-contain" />
            </div>
            
            {/* Center - Mission Control with Active Use Case */}
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-seraphim-text flex items-center whitespace-nowrap">
                <SparklesIcon className="h-6 w-6 text-seraphim-gold mr-2 animate-pulse-gold" />
                Mission Control
              </h1>
              {activeUseCaseId && (
                <p className="text-sm text-gray-400 mt-1">
                  Active: {useCases.find(uc => uc.id === activeUseCaseId)?.name || 'Unknown'}
                </p>
              )}
            </div>
            
            {/* Right - System Time, Operator, and Reset Button */}
            <div className="flex justify-end items-center gap-4">
              {/* Reset Button - Only show when use case is active */}
              {activeUseCaseId && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset? All data will return to the default baseline.')) {
                      resetContext();
                    }
                  }}
                  className="flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Reset Use Case
                </Button>
              )}
              
              {/* Existing time and operator cards */}
              <Card variant="glass" padding="sm" className="min-w-[120px]">
                {/* ... existing time card ... */}
              </Card>
              
              <Card variant="glass" padding="sm" className="min-w-[150px]">
                {/* ... existing operator card ... */}
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update all data displays to use displayData */}
      {/* ... rest of dashboard using displayData ... */}
    </div>
  );
};
```

## 4. TAB SYNCHRONIZATION

### Update all tabs to use global context

Example for Workflows tab (`packages/frontend/src/pages/Workflows.tsx`):

```typescript
const Workflows: React.FC = () => {
  const { activeUseCaseId, activeUseCaseData } = useUseCaseContext();
  const [workflows, setWorkflows] = useState<UseCaseWorkflow[]>([]);
  
  // Remove manual use case selection
  // Automatically load workflows for active use case
  useEffect(() => {
    if (activeUseCaseId) {
      // Load from context data if available
      if (activeUseCaseData?.operations?.workflows) {
        setWorkflows(activeUseCaseData.operations.workflows);
      } else {
        // Fallback to API call
        loadWorkflows(activeUseCaseId);
      }
    } else {
      // Show empty state
      setWorkflows([]);
    }
  }, [activeUseCaseId, activeUseCaseData]);
  
  // Remove use case dropdown
  // Show active use case info instead
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <CogIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Workflows
        </h1>
        {activeUseCaseId ? (
          <p className="text-sm text-gray-400 mt-1">
            Active Use Case: {useCases.find(uc => uc.id === activeUseCaseId)?.name}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            Select a use case in the Launcher to begin
          </p>
        )}
      </div>
      
      {/* Show workflows or empty state based on context */}
      {!activeUseCaseId ? (
        <Card className="p-12 text-center">
          <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-white">
            No Active Use Case
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Select a use case in the Launcher to view workflows
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/use-cases')}>
              Go to Use Case Launcher
            </Button>
          </div>
        </Card>
      ) : (
        // Show workflows for active use case
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            // ... existing workflow cards ...
          ))}
        </div>
      )}
    </div>
  );
};
```

### Apply similar pattern to all other tabs:
- Agent Orchestration
- Operations
- Integration Log
- Audit Console
- Output Viewer
- Certifications

## 5. MOCK API ENDPOINTS

### Create mock endpoints (`packages/backend/src/routes/usecase.routes.ts`)

```typescript
// Get baseline dummy data
router.get('/usecases/default/data', async (req, res) => {
  res.json({
    summary: {
      activeItems: 42,
      successRate: 94.5,
      costSavings: 2340000,
      efficiencyGain: 67,
      metrics: [
        { name: "Active Processes", value: 12, unit: "count", trend: "up", change: 15 },
        { name: "System Health", value: 98, unit: "%", trend: "stable", change: 0 },
        { name: "Data Quality", value: 91, unit: "%", trend: "up", change: 3 }
      ]
    }
  });
});

// Get use case specific data
router.get('/usecases/:id/data', async (req, res) => {
  const { id } = req.params;
  
  // Generate dummy data based on use case
  const data = generateUseCaseData(id);
  
  res.json(data);
});

// Run workflows
router.post('/usecases/:id/runWorkflows', async (req, res) => {
  // Simulate workflow execution
  setTimeout(() => {
    res.json({ success: true, message: 'Workflows started' });
  }, 1000);
});

// Deploy agents
router.post('/usecases/:id/deploy', async (req, res) => {
  // Simulate deployment
  setTimeout(() => {
    res.json({ success: true, message: 'Deployment initiated' });
  }, 1500);
});
```

## 6. EXPECTED BEHAVIOR

1. **Initial State**: Mission Control shows baseline dummy data
2. **Use Case Selection**: User picks "Oilfield Land Lease" in Launcher
3. **Automatic Actions**:
   - Sets activeUseCaseId globally
   - Triggers workflows automatically
   - Deploys agents automatically
   - Loads unified data
   - Redirects to Workflows tab
4. **All Tabs Update**: Every tab shows Oilfield Land Lease data
5. **Reset**: Click "Reset Use Case" in Mission Control
   - Clears activeUseCaseId
   - All tabs revert to baseline/empty state
   - Mission Control shows baseline dummy data

## 7. TESTING CHECKLIST

- [ ] Launcher triggers workflows automatically
- [ ] All tabs react to context changes
- [ ] No manual use case selection in other tabs
- [ ] Reset button only appears when use case is active
- [ ] Reset clears all data across platform
- [ ] Baseline data shows when no use case active
- [ ] Loading states during launch process
- [ ] Error handling if launch fails
- [ ] LocalStorage persistence works
- [ ] Page refresh maintains context