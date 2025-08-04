# Mission Control Enhancement Plan

## Overview
This document outlines the plan to enhance the Mission Control dashboard by adding new components from the original mockup design while preserving all existing functionality.

## Current Dashboard Structure Analysis

### Existing Layout (Top to Bottom):
1. **Header Section** (Lines 220-282)
   - Logo and "Mission Control" title
   - Vertical selector, system time, and operator info

2. **Main Content Area** (Lines 284-591)
   - Vertical Dashboard (optional, toggleable)
   - SIA Governance Metrics
   - System Overview Grid (2 columns):
     - Quick Actions (left)
     - System Status (right)
   - Real-Time Activity Feed

### Insertion Point
The new Mission Control section will be inserted between the System Overview Grid (line 561) and the Real-Time Activity Feed (line 563).

## New Components Design

### 1. Active Missions Panel
```typescript
interface Mission {
  id: string;
  name: string;
  category: 'data-analysis' | 'threat-detection' | 'compliance-check' | 'system-optimization';
  progress: number; // 0-100
  status: 'active' | 'pending' | 'completed';
  startTime: Date;
  estimatedCompletion: Date;
  assignedAgents: string[];
}
```

**Features:**
- Scrollable list of active missions
- Progress bars with category-specific colors
- Click to view mission details
- Real-time progress updates via WebSocket

### 2. Agents Performance Graph
```typescript
interface AgentPerformancePoint {
  timestamp: Date;
  productivity: number; // 0-100
  efficiency: number; // 0-100
  agentId: string;
}
```

**Features:**
- Line chart showing 24-hour window
- Two lines: Productivity (blue) and Efficiency (green)
- Hover tooltips with exact values
- Click on data points to view agent details

### 3. Task Summary Box
```typescript
interface TaskSummary {
  completed: number;
  ongoing: number;
  pending: number;
  failureRate: number;
  averageCompletionTime: number; // in minutes
}
```

**Features:**
- Three large number displays with icons
- Color-coded status indicators
- Animated transitions on updates
- Click to filter activity feed by task status

### 4. Alerts Panel
```typescript
interface Alert {
  id: string;
  type: 'security' | 'performance' | 'data-sync' | 'agent-health';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
}
```

**Features:**
- Scrollable list of recent alerts
- Color-coded by severity
- Click to open diagnostic modal
- Acknowledge/dismiss functionality
- Real-time updates

## Component Layout Structure

```jsx
{/* Mission Control Section - Insert after System Overview */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="space-y-6"
>
  <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
    <RocketLaunchIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
    Mission Control Operations
  </h2>
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Active Missions */}
    <Card variant="glass-dark" effect="glow" className="lg:col-span-1">
      <ActiveMissionsPanel />
    </Card>
    
    {/* Middle Column - Performance & Tasks */}
    <div className="space-y-6 lg:col-span-1">
      <Card variant="glass" effect="float">
        <AgentsPerformanceGraph />
      </Card>
      <Card variant="gradient" effect="shimmer">
        <TaskSummaryBox />
      </Card>
    </div>
    
    {/* Right Column - Alerts */}
    <Card variant="glass-dark" effect="glow" className="lg:col-span-1">
      <AlertsPanel />
    </Card>
  </div>
</motion.div>
```

## State Management Plan

### New State Variables
```typescript
// Mission Control State
const [missions, setMissions] = useState<Mission[]>([]);
const [agentPerformance, setAgentPerformance] = useState<AgentPerformancePoint[]>([]);
const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
const [alerts, setAlerts] = useState<Alert[]>([]);

// Modal States
const [showAlertModal, setShowAlertModal] = useState(false);
const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
const [showMissionModal, setShowMissionModal] = useState(false);
const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
```

### Data Flow
1. **Initial Load**: Fetch all mission control data on component mount
2. **Real-time Updates**: WebSocket subscription for live updates
3. **User Interactions**: Handle clicks, acknowledgments, and navigation
4. **Data Refresh**: Periodic refresh every 30 seconds as fallback

## Mock Data Generators

### 1. generateMissions()
```typescript
export const generateMissions = (): Mission[] => {
  const categories = ['data-analysis', 'threat-detection', 'compliance-check', 'system-optimization'];
  const missionNames = {
    'data-analysis': ['Customer Behavior Analysis', 'Market Trend Prediction', 'Performance Metrics Analysis'],
    'threat-detection': ['Network Anomaly Scan', 'Security Vulnerability Assessment', 'Intrusion Detection'],
    'compliance-check': ['GDPR Compliance Audit', 'SOC2 Verification', 'Data Privacy Review'],
    'system-optimization': ['Resource Allocation', 'Query Optimization', 'Cache Performance Tuning']
  };
  
  return Array.from({ length: 8 }, (_, i) => {
    const category = categories[i % categories.length];
    const names = missionNames[category];
    const progress = Math.floor(Math.random() * 100);
    
    return {
      id: `mission-${i + 1}`,
      name: names[Math.floor(Math.random() * names.length)],
      category,
      progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'active' : 'pending',
      startTime: new Date(Date.now() - Math.random() * 3600000),
      estimatedCompletion: new Date(Date.now() + Math.random() * 7200000),
      assignedAgents: [`agent-${i % 3 + 1}`, `agent-${(i + 1) % 3 + 1}`]
    };
  });
};
```

### 2. generateAgentPerformance()
```typescript
export const generateAgentPerformance = (): AgentPerformancePoint[] => {
  const points: AgentPerformancePoint[] = [];
  const now = Date.now();
  const agents = ['agent-1', 'agent-2', 'agent-3'];
  
  // Generate 24 hours of data, one point per hour
  for (let i = 23; i >= 0; i--) {
    agents.forEach(agentId => {
      points.push({
        timestamp: new Date(now - i * 3600000),
        productivity: 70 + Math.random() * 25 + (i < 12 ? 5 : 0), // Higher in recent hours
        efficiency: 75 + Math.random() * 20 + (i < 12 ? 3 : 0),
        agentId
      });
    });
  }
  
  return points;
};
```

### 3. generateTaskSummary()
```typescript
export const generateTaskSummary = (): TaskSummary => {
  const completed = Math.floor(Math.random() * 200) + 300;
  const ongoing = Math.floor(Math.random() * 50) + 20;
  const pending = Math.floor(Math.random() * 100) + 50;
  
  return {
    completed,
    ongoing,
    pending,
    failureRate: Math.random() * 5 + 2, // 2-7%
    averageCompletionTime: Math.floor(Math.random() * 30) + 15 // 15-45 minutes
  };
};
```

### 4. generateAlerts()
```typescript
export const generateAlerts = (): Alert[] => {
  const alertTemplates = [
    { type: 'security', title: 'Unauthorized Access Attempt', severity: 'critical' },
    { type: 'performance', title: 'Agent Response Time Degradation', severity: 'high' },
    { type: 'data-sync', title: 'Database Sync Failure', severity: 'medium' },
    { type: 'agent-health', title: 'Agent Node Unreachable', severity: 'high' },
    { type: 'security', title: 'Anomalous Query Pattern Detected', severity: 'medium' },
    { type: 'performance', title: 'Memory Usage Above Threshold', severity: 'low' }
  ];
  
  return alertTemplates.map((template, i) => ({
    id: `alert-${i + 1}`,
    ...template,
    description: `${template.title} detected in ${['Production', 'Staging', 'Development'][i % 3]} environment`,
    timestamp: new Date(Date.now() - Math.random() * 3600000),
    source: `monitor-${i % 3 + 1}`,
    acknowledged: false
  }));
};
```

## Modal Designs

### Alert Diagnostic Modal
```jsx
<Modal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)}>
  <div className="p-6 bg-seraphim-black rounded-lg">
    <h3 className="text-xl font-bold text-seraphim-text mb-4">
      Alert Diagnostics
    </h3>
    {selectedAlert && (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-seraphim-text-dim">Type</p>
            <p className="text-seraphim-text">{selectedAlert.type}</p>
          </div>
          <div>
            <p className="text-sm text-seraphim-text-dim">Severity</p>
            <p className={`text-${getSeverityColor(selectedAlert.severity)}`}>
              {selectedAlert.severity}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-seraphim-text-dim mb-2">Diagnostic Information</p>
          <pre className="bg-black/50 p-4 rounded text-xs text-green-400">
            {JSON.stringify(generateDiagnosticData(selectedAlert), null, 2)}
          </pre>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => acknowledgeAlert(selectedAlert.id)}>
            Acknowledge
          </Button>
          <Button variant="primary" onClick={() => navigateToSource(selectedAlert)}>
            View Source
          </Button>
        </div>
      </div>
    )}
  </div>
</Modal>
```

### Mission Details Sidebar
```jsx
<Drawer isOpen={showMissionModal} onClose={() => setShowMissionModal(false)} position="right">
  <div className="p-6 bg-seraphim-black h-full">
    <h3 className="text-xl font-bold text-seraphim-text mb-4">
      Mission Details
    </h3>
    {selectedMission && (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm text-seraphim-text-dim mb-2">Progress</h4>
          <ProgressBar value={selectedMission.progress} />
        </div>
        <div>
          <h4 className="text-sm text-seraphim-text-dim mb-2">Assigned Agents</h4>
          <div className="space-y-2">
            {selectedMission.assignedAgents.map(agent => (
              <AgentCard key={agent} agentId={agent} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm text-seraphim-text-dim mb-2">Timeline</h4>
          <Timeline 
            start={selectedMission.startTime}
            estimated={selectedMission.estimatedCompletion}
            current={new Date()}
          />
        </div>
      </div>
    )}
  </div>
</Drawer>
```

## Implementation Steps

1. **Create Mock Data Service** (30 min)
   - Add generators to `mockData.service.ts`
   - Create TypeScript interfaces

2. **Build Individual Components** (3 hours)
   - ActiveMissionsPanel component
   - AgentsPerformanceGraph component
   - TaskSummaryBox component
   - AlertsPanel component

3. **Integrate into Dashboard** (1 hour)
   - Add state management
   - Insert Mission Control section
   - Wire up data flow

4. **Add Modals and Interactions** (2 hours)
   - Alert diagnostic modal
   - Mission details sidebar
   - Click handlers and navigation

5. **Add Real-time Updates** (1 hour)
   - WebSocket integration
   - Live data updates
   - Animation transitions

6. **Testing and Polish** (1 hour)
   - Responsive design testing
   - Animation fine-tuning
   - Error handling

## Total Estimated Time: 8.5 hours

## Success Criteria
- All new components render correctly
- No existing functionality is broken
- Smooth animations and transitions
- Responsive design works on all screen sizes
- Real-time updates function properly
- User interactions are intuitive