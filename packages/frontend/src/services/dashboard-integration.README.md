# Dashboard Integration System

## Overview

The Dashboard Integration System enables seamless communication and data sharing between different dashboards in the Seraphim Vanguards application. It provides a centralized event-driven architecture for cross-dashboard interactions.

## Key Components

### 1. Dashboard Integration Service (`dashboard-integration.service.ts`)
- Central event bus for dashboard communication
- Message queue system for notifications
- Data sharing and persistence
- Cross-dashboard coordination

### 2. Dashboard Integration Hook (`useDashboardIntegration.ts`)
- React hook for easy integration
- Automatic message handling
- Event subscription management
- Data request/response handling

### 3. Dashboard Notifications Component (`DashboardNotifications.tsx`)
- Visual notification system
- Real-time message display
- Action handling for interactive messages
- Unread message tracking

## Usage Examples

### Basic Integration in a Dashboard

```typescript
import { DashboardSource } from '../services/dashboard-integration.service';
import { useDashboardIntegration } from '../hooks/useDashboardIntegration';
import { DashboardNotifications } from '../components/DashboardNotifications';

function MyDashboard() {
  const {
    messages,
    unreadCount,
    emitEvent,
    sendMessage,
    navigateTo,
    requestData,
    shareData
  } = useDashboardIntegration({
    source: DashboardSource.ADMIN,
    eventTypes: [
      DashboardEventType.SYSTEM_HEALTH_UPDATE,
      DashboardEventType.USER_ROLE_CHANGE
    ]
  });

  // Send a message to another dashboard
  const notifyRiskOfficer = () => {
    sendMessage(
      DashboardSource.RISK_OFFICER,
      'New Risk Detected',
      'A high-risk pattern has been identified in the system',
      {
        type: 'warning',
        data: { riskLevel: 'high', timestamp: new Date() },
        actions: [
          { label: 'Review', action: 'review_risk', primary: true },
          { label: 'Dismiss', action: 'dismiss' }
        ]
      }
    );
  };

  // Share data with another dashboard
  const shareAnalysisResults = (results: any) => {
    shareData(DashboardSource.COMPLIANCE_REVIEWER, 'analysis_results', results);
  };

  // Request data from another dashboard
  const getSystemHealth = async () => {
    const health = await requestData(DashboardSource.ADMIN, 'system_health');
    console.log('System health:', health);
  };

  return (
    <div>
      {/* Add notifications to your dashboard */}
      <DashboardNotifications 
        source={DashboardSource.ADMIN}
        position="top-right"
      />
      
      {/* Your dashboard content */}
    </div>
  );
}
```

### Mission Control Coordinator

```typescript
import { useMissionControlCoordinator } from '../hooks/useDashboardIntegration';

function MissionControl() {
  const {
    dashboardStates,
    coordinateAction,
    broadcastToAll,
    collectDashboardData
  } = useMissionControlCoordinator();

  // Coordinate an action across multiple dashboards
  const handleEmergencyShutdown = async () => {
    const approvals = await coordinateAction('emergency_shutdown', {
      reason: 'Critical security breach detected',
      initiatedBy: 'admin'
    });
    
    console.log('Approvals received:', approvals);
  };

  // Broadcast to all dashboards
  const announceSystemUpdate = () => {
    broadcastToAll(
      DashboardEventType.SYSTEM_UPDATE,
      { version: '2.0.0', features: ['new-feature-1', 'new-feature-2'] },
      {
        title: 'System Update Available',
        content: 'A new system update is available. Please review the changes.'
      }
    );
  };

  // Collect data from all dashboards
  const generateReport = async () => {
    const allData = await collectDashboardData();
    console.log('Collected data:', allData);
  };
}
```

## Event Types

### Navigation Events
- `NAVIGATE_TO_DASHBOARD`: Navigate to another dashboard
- `SWITCH_USE_CASE`: Switch the active use case

### Data Events
- `RISK_ALERT`: Risk-related alerts
- `COMPLIANCE_VIOLATION`: Compliance violations
- `AGENT_STATUS_CHANGE`: Agent status updates
- `WORKFLOW_COMPLETED`: Workflow completion notifications

### Action Events
- `REQUEST_REVIEW`: Request review from another dashboard
- `APPROVE_ACTION`: Approve an action
- `REJECT_ACTION`: Reject an action
- `GENERATE_REPORT`: Generate a report

### System Events
- `SYSTEM_HEALTH_UPDATE`: System health changes
- `USER_ROLE_CHANGE`: User role modifications
- `CONFIGURATION_CHANGE`: Configuration updates

## Dashboard Sources

- `MISSION_CONTROL`: Main control dashboard
- `ADMIN`: Administrator dashboard
- `RISK_OFFICER`: Risk management dashboard
- `COMPLIANCE_REVIEWER`: Compliance review dashboard
- `USE_CASE`: Use case specific dashboards

## Message Structure

```typescript
interface DashboardMessage {
  id: string;
  from: DashboardSource;
  to: DashboardSource | 'all';
  type: 'info' | 'warning' | 'error' | 'action';
  title: string;
  message: string;
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  timestamp: Date;
}
```

## Data Sharing

### Share Data
```typescript
shareData(DashboardSource.RISK_OFFICER, 'risk_analysis', analysisData);
```

### Get Shared Data
```typescript
const sharedData = getSharedData(DashboardSource.ADMIN, 'system_config');
```

## Best Practices

1. **Event Naming**: Use descriptive event names that clearly indicate the action
2. **Message Types**: Use appropriate message types (info, warning, error, action)
3. **Data Validation**: Always validate data before sharing or processing
4. **Error Handling**: Implement proper error handling for failed communications
5. **Performance**: Avoid excessive messaging; batch updates when possible
6. **Security**: Don't share sensitive data through the integration system

## Integration Checklist

- [ ] Import dashboard integration hook
- [ ] Add DashboardNotifications component
- [ ] Define dashboard source
- [ ] Subscribe to relevant events
- [ ] Implement message handlers
- [ ] Add data sharing logic
- [ ] Test cross-dashboard communication
- [ ] Handle errors gracefully
- [ ] Document custom events

## Troubleshooting

### Messages not appearing
- Check if DashboardNotifications component is rendered
- Verify dashboard source is correct
- Ensure messages are sent to correct destination

### Events not triggering
- Verify event subscription in useDashboardIntegration
- Check event type matches exactly
- Ensure event emitter is properly initialized

### Data sharing issues
- Check if data is serializable (no functions, circular references)
- Verify both dashboards use same data key
- Check TTL hasn't expired (5 minutes default)