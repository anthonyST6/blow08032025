import { outputRepository } from './outputRepository.service';

// Browser-compatible EventEmitter implementation
class EventEmitter {
  private events: { [key: string]: Array<(...args: any[]) => void> } = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listenerToRemove: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      listener(...args);
    });
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export interface IntegrationLogEntry {
  id: string;
  timestamp: Date;
  sourceAgent: string;
  targetAgent: string;
  eventType: 'Data Transfer' | 'Validation' | 'Error' | 'Connection' | 'Processing';
  message: string;
  useCaseId: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  useCaseId: string;
  workflowId?: string;
}

export interface OutputArtifact {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  type: 'document' | 'image' | 'report' | 'data' | 'code' | 'pdf' | 'json' | 'xlsx' | 'txt';
  size: number;
  agent: string;
  useCaseId: string;
  workflowId?: string;
  content?: string;
  url?: string;
}

class WorkflowEventsService extends EventEmitter {
  private integrationLogs: IntegrationLogEntry[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private outputs: OutputArtifact[] = [];
  private isSimulating = false;

  constructor() {
    super();
  }

  // Start simulating workflow execution
  startWorkflowSimulation(useCaseId: string) {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    console.log('WorkflowEventsService: Starting simulation for', useCaseId);

    if (useCaseId === 'oilfield-land-lease') {
      this.simulateOilfieldWorkflow();
    }
  }

  private simulateOilfieldWorkflow() {
    const steps = [
      // Step 1: Data Ingestion
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Data Ingest Agent',
          targetAgent: 'Oilfield Lease Orchestrator Agent',
          eventType: 'Connection',
          message: 'Establishing connection for data transfer',
          useCaseId: 'oilfield-land-lease',
        });
      },
      // Step 2: Data Transfer
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Data Ingest Agent',
          targetAgent: 'Oilfield Lease Orchestrator Agent',
          eventType: 'Data Transfer',
          message: 'Transferring 1,247 lease records',
          useCaseId: 'oilfield-land-lease',
          metadata: { recordCount: 1247, format: 'CSV' },
        });
        
        this.addAuditLog({
          agent: 'Data Ingest Agent',
          action: 'Data Validation',
          status: 'success',
          message: 'Validated 1,247 lease records successfully',
          useCaseId: 'oilfield-land-lease',
        });
      },
      // Step 3: Orchestrator Distribution
      () => {
        ['Lease Expiration Risk Agent', 'Revenue Forecast Agent', 'Compliance Analysis Agent'].forEach(agent => {
          this.addIntegrationLog({
            sourceAgent: 'Oilfield Lease Orchestrator Agent',
            targetAgent: agent,
            eventType: 'Data Transfer',
            message: `Distributing lease data to ${agent}`,
            useCaseId: 'oilfield-land-lease',
          });
        });
      },
      // Step 4: Risk Analysis
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Lease Expiration Risk Agent',
          targetAgent: 'Document Generation Agent',
          eventType: 'Processing',
          message: 'Analyzing lease expiration risks',
          useCaseId: 'oilfield-land-lease',
        });
        
        this.addAuditLog({
          agent: 'Lease Expiration Risk Agent',
          action: 'Risk Assessment',
          status: 'warning',
          message: 'Identified 47 leases expiring within 90 days',
          useCaseId: 'oilfield-land-lease',
        });
      },
      // Step 5: Revenue Forecast
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Revenue Forecast Agent',
          targetAgent: 'Document Generation Agent',
          eventType: 'Processing',
          message: 'Calculating revenue projections',
          useCaseId: 'oilfield-land-lease',
        });
        
        this.addAuditLog({
          agent: 'Revenue Forecast Agent',
          action: 'Financial Analysis',
          status: 'success',
          message: 'Generated 12-month revenue forecast: $4.2M projected',
          useCaseId: 'oilfield-land-lease',
        });
      },
      // Step 6: Compliance Check
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Compliance Analysis Agent',
          targetAgent: 'Document Generation Agent',
          eventType: 'Validation',
          message: 'Performing regulatory compliance checks',
          useCaseId: 'oilfield-land-lease',
        });
        
        this.addAuditLog({
          agent: 'Compliance Analysis Agent',
          action: 'Compliance Verification',
          status: 'success',
          message: 'All leases meet current regulatory requirements',
          useCaseId: 'oilfield-land-lease',
        });
      },
      // Step 7: Document Generation
      () => {
        this.addIntegrationLog({
          sourceAgent: 'Document Generation Agent',
          targetAgent: 'Output Storage',
          eventType: 'Processing',
          message: 'Generating compliance reports and recommendations',
          useCaseId: 'oilfield-land-lease',
        });
        
        // Generate outputs
        this.addOutput({
          name: 'Lease_Renewal_Report.pdf',
          description: 'Comprehensive report on lease renewals with risk assessment and recommendations',
          type: 'pdf',
          size: 2516582, // 2.4MB in bytes
          agent: 'Document Generation Agent',
          useCaseId: 'oilfield-land-lease',
          content: 'Executive Summary: 47 leases require immediate attention...',
        });
        
        this.addOutput({
          name: 'Risk_Scoring_Summary.json',
          description: 'JSON data file containing risk scores for all analyzed leases',
          type: 'json',
          size: 159744, // 156KB in bytes
          agent: 'Lease Expiration Risk Agent',
          useCaseId: 'oilfield-land-lease',
          content: JSON.stringify({ highRisk: 47, mediumRisk: 123, lowRisk: 1077 }, null, 2),
        });
        
        this.addOutput({
          name: 'Revenue_Forecast.xlsx',
          description: 'Excel spreadsheet with 12-month revenue projections and analysis',
          type: 'xlsx',
          size: 913408, // 892KB in bytes
          agent: 'Revenue Forecast Agent',
          useCaseId: 'oilfield-land-lease',
          content: 'Monthly projections for next 12 months...',
        });
        
        this.addOutput({
          name: 'Compliance_Report.pdf',
          description: 'Regulatory compliance analysis for all active leases',
          type: 'pdf',
          size: 1843200, // 1.8MB in bytes
          agent: 'Compliance Analysis Agent',
          useCaseId: 'oilfield-land-lease',
          content: 'Compliance Status: All leases meet current regulatory requirements...',
        });
        
        this.addOutput({
          name: 'Agent_Decision_Log.txt',
          description: 'Detailed log of all agent decisions and rationale',
          type: 'txt',
          size: 524288, // 512KB in bytes
          agent: 'Oilfield Lease Orchestrator Agent',
          useCaseId: 'oilfield-land-lease',
          content: 'Agent Decision Log\n==================\n[2024-01-29 14:23:45] Data Ingest Agent: Validated 1,247 records...',
        });
      },
      // Step 8: Completion
      () => {
        this.addAuditLog({
          agent: 'Oilfield Lease Orchestrator Agent',
          action: 'Workflow Completion',
          status: 'success',
          message: 'Workflow completed successfully in 3.7 seconds',
          useCaseId: 'oilfield-land-lease',
          workflowId: `workflow-${Date.now()}`,
        });
        
        this.isSimulating = false;
      },
    ];

    // Execute steps with delays
    steps.forEach((step, index) => {
      setTimeout(step, (index + 1) * 2000); // 2 second intervals
    });
  }

  // Add integration log entry
  addIntegrationLog(entry: Omit<IntegrationLogEntry, 'id' | 'timestamp'>) {
    const logEntry: IntegrationLogEntry = {
      id: `int-log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...entry,
    };
    
    this.integrationLogs.push(logEntry);
    this.emit('integrationLog', logEntry);
    console.log('WorkflowEventsService: Integration log added', logEntry);
  }

  // Add audit log entry
  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logEntry: AuditLogEntry = {
      id: `audit-log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...entry,
    };
    
    this.auditLogs.push(logEntry);
    this.emit('auditLog', logEntry);
    console.log('WorkflowEventsService: Audit log added', logEntry);
  }

  // Add output artifact
  addOutput(output: Omit<OutputArtifact, 'id' | 'timestamp'>) {
    const artifact: OutputArtifact = {
      id: `output-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...output,
    };
    
    this.outputs.push(artifact);
    
    // Store in repository for persistent access
    outputRepository.storeOutput(artifact, output.workflowId);
    
    this.emit('outputArtifact', artifact);
    console.log('WorkflowEventsService: Output added', artifact);
  }

  // Get logs filtered by use case
  getIntegrationLogs(useCaseId?: string): IntegrationLogEntry[] {
    if (!useCaseId) return this.integrationLogs;
    return this.integrationLogs.filter(log => log.useCaseId === useCaseId);
  }

  getAuditLogs(useCaseId?: string): AuditLogEntry[] {
    if (!useCaseId) return this.auditLogs;
    return this.auditLogs.filter(log => log.useCaseId === useCaseId);
  }

  getOutputs(useCaseId?: string): OutputArtifact[] {
    if (!useCaseId) return this.outputs;
    return this.outputs.filter(output => output.useCaseId === useCaseId);
  }

  getOutputArtifacts(useCaseId?: string): OutputArtifact[] {
    if (!useCaseId) return [...this.outputs];
    return this.outputs.filter(output => output.useCaseId === useCaseId);
  }

  // Clear logs for a specific use case
  clearLogs(useCaseId: string) {
    this.integrationLogs = this.integrationLogs.filter(log => log.useCaseId !== useCaseId);
    this.auditLogs = this.auditLogs.filter(log => log.useCaseId !== useCaseId);
    this.outputs = this.outputs.filter(output => output.useCaseId !== useCaseId);
  }

  // Clear all logs
  clearAllLogs() {
    this.integrationLogs = [];
    this.auditLogs = [];
    this.outputs = [];
  }
}

export const workflowEventsService = new WorkflowEventsService();