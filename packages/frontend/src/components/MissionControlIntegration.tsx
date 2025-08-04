import React, { useEffect } from 'react';
import { 
  DashboardSource, 
  DashboardEventType 
} from '../services/dashboard-integration.service';
import { 
  useDashboardIntegration, 
  useMissionControlCoordinator 
} from '../hooks/useDashboardIntegration';
import { DashboardNotifications } from './DashboardNotifications';

interface MissionControlIntegrationProps {
  onNavigateToUseCase?: (useCaseId: string) => void;
  onSystemAlert?: (alert: any) => void;
}

export const MissionControlIntegration: React.FC<MissionControlIntegrationProps> = ({
  onNavigateToUseCase,
  onSystemAlert
}) => {
  const {
    emitEvent,
    sendMessage,
    navigateTo,
    requestData,
    shareData
  } = useDashboardIntegration({
    source: DashboardSource.MISSION_CONTROL,
    eventTypes: [
      DashboardEventType.RISK_ALERT,
      DashboardEventType.COMPLIANCE_VIOLATION,
      DashboardEventType.SYSTEM_HEALTH_UPDATE,
      DashboardEventType.WORKFLOW_COMPLETED
    ]
  });

  const {
    dashboardStates,
    coordinateAction,
    broadcastToAll,
    collectDashboardData
  } = useMissionControlCoordinator();

  // Example: Handle use case selection
  const handleUseCaseSelection = (useCaseId: string, useCaseData: any) => {
    // Emit event to notify other dashboards
    emitEvent(DashboardEventType.SWITCH_USE_CASE, {
      useCaseId,
      useCaseData
    });

    // Share use case data with other dashboards
    shareData(DashboardSource.RISK_OFFICER, 'selected_use_case', useCaseData);
    shareData(DashboardSource.COMPLIANCE_REVIEWER, 'selected_use_case', useCaseData);

    // Send notification
    sendMessage(
      'all',
      'Use Case Changed',
      `Switched to use case: ${useCaseData.name}`,
      {
        type: 'info',
        data: useCaseData
      }
    );
  };

  // Example: Handle risk alert from Risk Officer Dashboard
  const handleRiskAlert = async (severity: 'low' | 'medium' | 'high' | 'critical') => {
    if (severity === 'critical') {
      // Coordinate emergency response
      const approvals = await coordinateAction('emergency_response', {
        severity,
        timestamp: new Date()
      });

      // Broadcast to all dashboards
      broadcastToAll(
        DashboardEventType.RISK_ALERT,
        { severity, approvals },
        {
          title: 'Critical Risk Alert',
          content: 'Emergency response protocol activated'
        }
      );
    }
  };

  // Example: Collect system-wide data for reporting
  const generateSystemReport = async () => {
    try {
      // Collect data from all dashboards
      const allData = await collectDashboardData();
      
      // Get specific data from each dashboard
      const systemHealth = await requestData(DashboardSource.ADMIN, 'system_health');
      const riskAnalysis = await requestData(DashboardSource.RISK_OFFICER, 'risk_analysis');
      const complianceStatus = await requestData(DashboardSource.COMPLIANCE_REVIEWER, 'compliance_status');

      // Compile report
      const report = {
        timestamp: new Date(),
        systemHealth,
        riskAnalysis,
        complianceStatus,
        dashboardStates: Array.from(allData.entries())
      };

      // Send report notification
      sendMessage(
        DashboardSource.ADMIN,
        'System Report Generated',
        'Comprehensive system report is ready for review',
        {
          type: 'info',
          data: report,
          actions: [
            { label: 'View Report', action: 'view_report', primary: true },
            { label: 'Download', action: 'download_report' }
          ]
        }
      );

      return report;
    } catch (error) {
      console.error('Failed to generate system report:', error);
      throw error;
    }
  };

  // Example: Navigate to specific dashboard with context
  const navigateToRiskDashboard = (riskData: any) => {
    // Share context data
    shareData(DashboardSource.RISK_OFFICER, 'navigation_context', riskData);
    
    // Navigate
    navigateTo(DashboardSource.RISK_OFFICER, {
      redirect: '/risk-officer',
      context: riskData
    });
  };

  // Listen for system-wide events
  useEffect(() => {
    const handleSystemEvent = (event: any) => {
      console.log('Mission Control received system event:', event);
      
      if (onSystemAlert && event.type === DashboardEventType.RISK_ALERT) {
        onSystemAlert(event.data);
      }
    };

    // Subscribe to critical events
    const unsubscribe = dashboardIntegration.subscribeToDashboardEvents(
      DashboardSource.MISSION_CONTROL,
      [
        DashboardEventType.RISK_ALERT,
        DashboardEventType.COMPLIANCE_VIOLATION,
        DashboardEventType.SYSTEM_HEALTH_UPDATE
      ],
      handleSystemEvent
    );

    return unsubscribe;
  }, [onSystemAlert]);

  return (
    <>
      {/* Dashboard Notifications */}
      <DashboardNotifications 
        source={DashboardSource.MISSION_CONTROL}
        position="top-right"
      />

      {/* Integration Controls (for demo purposes) */}
      <div className="hidden">
        <button onClick={() => handleUseCaseSelection('test-123', { name: 'Test Use Case' })}>
          Test Use Case Selection
        </button>
        <button onClick={() => handleRiskAlert('critical')}>
          Test Critical Alert
        </button>
        <button onClick={generateSystemReport}>
          Generate System Report
        </button>
        <button onClick={() => navigateToRiskDashboard({ context: 'test' })}>
          Navigate to Risk Dashboard
        </button>
      </div>
    </>
  );
};

// Example integration for other dashboards
export const AdminDashboardIntegration: React.FC = () => {
  const { emitEvent, sendMessage } = useDashboardIntegration({
    source: DashboardSource.ADMIN,
    eventTypes: [DashboardEventType.SYSTEM_HEALTH_UPDATE]
  });

  // Example: Notify about system health changes
  const notifySystemHealthChange = (health: any) => {
    emitEvent(DashboardEventType.SYSTEM_HEALTH_UPDATE, health);
    
    if (health.status === 'critical') {
      sendMessage(
        'all',
        'System Health Critical',
        'Immediate attention required - system health is critical',
        {
          type: 'error',
          data: health
        }
      );
    }
  };

  return (
    <DashboardNotifications 
      source={DashboardSource.ADMIN}
      position="top-right"
    />
  );
};

// Import the dashboard integration service to ensure it's available
import { dashboardIntegration } from '../services/dashboard-integration.service';