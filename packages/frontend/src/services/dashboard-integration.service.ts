import { EventEmitter } from 'events';
import { persistenceService } from './persistence.service';
import { apiService } from './apiService';
import { User, AgentAnalysis, AuditLog, Workflow } from '../types';

export interface DashboardEvent {
  type: DashboardEventType;
  source: DashboardSource;
  data: any;
  timestamp: Date;
}

export enum DashboardEventType {
  // Navigation events
  NAVIGATE_TO_DASHBOARD = 'navigate_to_dashboard',
  SWITCH_USE_CASE = 'switch_use_case',
  
  // Data events
  RISK_ALERT = 'risk_alert',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  AGENT_STATUS_CHANGE = 'agent_status_change',
  WORKFLOW_COMPLETED = 'workflow_completed',
  
  // Action events
  REQUEST_REVIEW = 'request_review',
  APPROVE_ACTION = 'approve_action',
  REJECT_ACTION = 'reject_action',
  GENERATE_REPORT = 'generate_report',
  
  // System events
  SYSTEM_HEALTH_UPDATE = 'system_health_update',
  USER_ROLE_CHANGE = 'user_role_change',
  CONFIGURATION_CHANGE = 'configuration_change',
}

export enum DashboardSource {
  MISSION_CONTROL = 'mission_control',
  ADMIN = 'admin',
  RISK_OFFICER = 'risk_officer',
  COMPLIANCE_REVIEWER = 'compliance_reviewer',
  USE_CASE = 'use_case',
}

export interface DashboardMessage {
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

class DashboardIntegrationService extends EventEmitter {
  private static instance: DashboardIntegrationService;
  private messages: DashboardMessage[] = [];
  private activeListeners: Map<string, Function> = new Map();
  
  private constructor() {
    super();
    this.initialize();
  }
  
  static getInstance(): DashboardIntegrationService {
    if (!DashboardIntegrationService.instance) {
      DashboardIntegrationService.instance = new DashboardIntegrationService();
    }
    return DashboardIntegrationService.instance;
  }
  
  private initialize() {
    // Load persisted messages
    const savedMessages = persistenceService.get('dashboard_messages');
    if (savedMessages) {
      this.messages = savedMessages;
    }
    
    // Set up cross-dashboard event handling
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // Handle risk alerts from Risk Officer Dashboard
    this.on(DashboardEventType.RISK_ALERT, (event: DashboardEvent) => {
      this.sendMessage({
        id: this.generateId(),
        from: event.source,
        to: DashboardSource.COMPLIANCE_REVIEWER,
        type: 'warning',
        title: 'Risk Alert',
        message: `New risk alert requires compliance review: ${event.data.description}`,
        data: event.data,
        actions: [
          { label: 'Review Now', action: 'navigate_to_review', primary: true },
          { label: 'Dismiss', action: 'dismiss' }
        ],
        timestamp: new Date()
      });
    });
    
    // Handle compliance violations
    this.on(DashboardEventType.COMPLIANCE_VIOLATION, (event: DashboardEvent) => {
      this.sendMessage({
        id: this.generateId(),
        from: event.source,
        to: 'all',
        type: 'error',
        title: 'Compliance Violation',
        message: `Compliance violation detected: ${event.data.violation}`,
        data: event.data,
        timestamp: new Date()
      });
    });
    
    // Handle workflow completions
    this.on(DashboardEventType.WORKFLOW_COMPLETED, (event: DashboardEvent) => {
      this.sendMessage({
        id: this.generateId(),
        from: event.source,
        to: DashboardSource.ADMIN,
        type: 'info',
        title: 'Workflow Completed',
        message: `Workflow "${event.data.workflowName}" completed successfully`,
        data: event.data,
        timestamp: new Date()
      });
    });
  }
  
  // Emit a dashboard event
  emitDashboardEvent(type: DashboardEventType, source: DashboardSource, data: any) {
    const event: DashboardEvent = {
      type,
      source,
      data,
      timestamp: new Date()
    };
    
    this.emit(type, event);
    
    // Log the event
    console.log('[Dashboard Integration] Event emitted:', event);
  }
  
  // Send a message between dashboards
  sendMessage(message: DashboardMessage) {
    this.messages.push(message);
    
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
    
    // Persist messages
    persistenceService.set('dashboard_messages', this.messages);
    
    // Emit message event
    this.emit('message', message);
  }
  
  // Get messages for a specific dashboard
  getMessages(dashboard: DashboardSource, unreadOnly = false): DashboardMessage[] {
    return this.messages.filter(msg => 
      (msg.to === dashboard || msg.to === 'all') &&
      (!unreadOnly || !this.isMessageRead(msg.id, dashboard))
    );
  }
  
  // Mark message as read
  markMessageAsRead(messageId: string, dashboard: DashboardSource) {
    const readMessages = persistenceService.get(`messages_read_${dashboard}`) || [];
    if (!readMessages.includes(messageId)) {
      readMessages.push(messageId);
      persistenceService.set(`messages_read_${dashboard}`, readMessages);
    }
  }
  
  // Check if message is read
  private isMessageRead(messageId: string, dashboard: DashboardSource): boolean {
    const readMessages = persistenceService.get(`messages_read_${dashboard}`) || [];
    return readMessages.includes(messageId);
  }
  
  // Navigate to another dashboard
  navigateToDashboard(target: DashboardSource, data?: any) {
    this.emitDashboardEvent(
      DashboardEventType.NAVIGATE_TO_DASHBOARD,
      DashboardSource.MISSION_CONTROL,
      { target, data }
    );
  }
  
  // Request cross-dashboard data
  async requestDashboardData(source: DashboardSource, dataType: string): Promise<any> {
    switch (dataType) {
      case 'system_health':
        if (source === DashboardSource.ADMIN) {
          // For now, return mock data since getSystemHealth is not in the API
          return {
            status: 'healthy',
            services: {
              database: { status: 'up', latency: 12 },
              redis: { status: 'up', latency: 5 },
              api: { status: 'up', latency: 45 }
            },
            lastChecked: new Date().toISOString()
          };
        }
        break;
        
      case 'risk_analysis':
        if (source === DashboardSource.RISK_OFFICER) {
          // For now, return mock data since getRiskTrends is not in the API
          return [
            { date: new Date().toISOString(), value: 85, category: 'overall' },
            { date: new Date().toISOString(), value: 92, category: 'compliance' },
            { date: new Date().toISOString(), value: 78, category: 'security' }
          ];
        }
        break;
        
      case 'compliance_status':
        if (source === DashboardSource.COMPLIANCE_REVIEWER) {
          // Return compliance data
          return {
            score: 85,
            violations: 3,
            pendingReviews: 12
          };
        }
        break;
    }
    
    return null;
  }
  
  // Share data between dashboards
  shareData(source: DashboardSource, target: DashboardSource, dataType: string, data: any) {
    const key = `shared_data_${source}_${target}_${dataType}`;
    persistenceService.set(key, {
      data,
      timestamp: new Date(),
      source,
      target
    });
    
    // Emit data sharing event
    this.emit('data_shared', {
      source,
      target,
      dataType,
      data
    });
  }
  
  // Get shared data
  getSharedData(source: DashboardSource, target: DashboardSource, dataType: string): any {
    const key = `shared_data_${source}_${target}_${dataType}`;
    const sharedData = persistenceService.get(key);
    
    if (sharedData && this.isDataFresh(sharedData.timestamp)) {
      return sharedData.data;
    }
    
    return null;
  }
  
  // Check if data is fresh (less than 5 minutes old)
  private isDataFresh(timestamp: Date | string): boolean {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }
  
  // Coordinate actions across dashboards
  async coordinateAction(action: string, source: DashboardSource, data: any): Promise<any> {
    switch (action) {
      case 'emergency_shutdown':
        // Notify all dashboards
        this.sendMessage({
          id: this.generateId(),
          from: source,
          to: 'all',
          type: 'error',
          title: 'Emergency Shutdown',
          message: 'System emergency shutdown initiated',
          data,
          timestamp: new Date()
        });
        break;
        
      case 'approve_high_risk_action':
        // Require approval from multiple dashboards
        const approvals = await this.requestApprovals(
          [DashboardSource.RISK_OFFICER, DashboardSource.COMPLIANCE_REVIEWER],
          'High Risk Action Approval',
          data
        );
        return approvals;
        
      case 'generate_comprehensive_report':
        // Collect data from all dashboards
        const reportData = await this.collectReportData();
        return reportData;
    }
  }
  
  // Request approvals from multiple dashboards
  private async requestApprovals(
    dashboards: DashboardSource[],
    title: string,
    data: any
  ): Promise<Map<DashboardSource, boolean>> {
    const approvals = new Map<DashboardSource, boolean>();
    
    // Send approval requests
    dashboards.forEach(dashboard => {
      this.sendMessage({
        id: this.generateId(),
        from: DashboardSource.MISSION_CONTROL,
        to: dashboard,
        type: 'action',
        title,
        message: 'Your approval is required for this action',
        data,
        actions: [
          { label: 'Approve', action: 'approve', primary: true },
          { label: 'Reject', action: 'reject' }
        ],
        timestamp: new Date()
      });
    });
    
    // In a real implementation, this would wait for actual responses
    // For now, we'll simulate approvals
    dashboards.forEach(dashboard => {
      approvals.set(dashboard, true);
    });
    
    return approvals;
  }
  
  // Collect data from all dashboards for reporting
  private async collectReportData(): Promise<any> {
    const reportData: any = {
      timestamp: new Date(),
      dashboards: {}
    };
    
    // Collect from Admin Dashboard
    try {
      const systemHealth = await this.requestDashboardData(DashboardSource.ADMIN, 'system_health');
      reportData.dashboards.admin = { systemHealth };
    } catch (error) {
      console.error('Failed to collect admin data:', error);
    }
    
    // Collect from Risk Officer Dashboard
    try {
      const riskAnalysis = await this.requestDashboardData(DashboardSource.RISK_OFFICER, 'risk_analysis');
      reportData.dashboards.riskOfficer = { riskAnalysis };
    } catch (error) {
      console.error('Failed to collect risk data:', error);
    }
    
    // Collect from Compliance Dashboard
    try {
      const complianceStatus = await this.requestDashboardData(DashboardSource.COMPLIANCE_REVIEWER, 'compliance_status');
      reportData.dashboards.compliance = { complianceStatus };
    } catch (error) {
      console.error('Failed to collect compliance data:', error);
    }
    
    return reportData;
  }
  
  // Subscribe to dashboard events
  subscribeToDashboardEvents(
    dashboard: DashboardSource,
    eventTypes: DashboardEventType[],
    callback: (event: DashboardEvent) => void
  ): () => void {
    const listenerId = `${dashboard}_${Date.now()}`;
    
    const listener = (event: DashboardEvent) => {
      if (eventTypes.includes(event.type)) {
        callback(event);
      }
    };
    
    this.activeListeners.set(listenerId, listener);
    
    eventTypes.forEach(eventType => {
      this.on(eventType, listener);
    });
    
    // Return unsubscribe function
    return () => {
      eventTypes.forEach(eventType => {
        this.off(eventType, listener);
      });
      this.activeListeners.delete(listenerId);
    };
  }
  
  // Generate unique ID
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Clear all messages
  clearMessages(dashboard?: DashboardSource) {
    if (dashboard) {
      this.messages = this.messages.filter(msg => 
        msg.to !== dashboard && msg.to !== 'all'
      );
    } else {
      this.messages = [];
    }
    
    persistenceService.set('dashboard_messages', this.messages);
  }
}

export const dashboardIntegration = DashboardIntegrationService.getInstance();