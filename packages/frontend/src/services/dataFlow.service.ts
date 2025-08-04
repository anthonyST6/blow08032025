/**
 * Data Flow Service
 * 
 * Manages the seamless flow of data between all components in the Seraphim Vanguards platform.
 * Ensures data consistency and real-time updates across Mission Control, Operations Center,
 * Agent Activities, and Certifications.
 */

import { IngestedData } from '../components/DataIngestion';
import { AgentNode } from '../types/usecase.types';
import { toast } from 'react-hot-toast';

// Extended IngestedData with parsed data for easier access
export interface IngestedDataWithParsed extends IngestedData {
  parsedData?: any[];
}

export interface WorkflowData {
  workflowId: string;
  useCaseId: string;
  ingestedData: IngestedDataWithParsed;
  agents: AgentNode[];
  status: 'pending' | 'deploying' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  results?: any;
  certificationStatus?: 'pending' | 'certified' | 'failed';
}

export interface DataFlowEvent {
  type: 'data_ingested' | 'workflow_started' | 'agent_deployed' | 'agent_activity' | 
        'workflow_completed' | 'certification_generated' | 'error';
  workflowId: string;
  timestamp: Date;
  data: any;
}

class DataFlowService {
  private workflows: Map<string, WorkflowData> = new Map();
  private eventListeners: Map<string, Set<(event: DataFlowEvent) => void>> = new Map();
  private storagePrefix = 'seraphim-workflow-';

  /**
   * Initialize a new workflow with ingested data
   */
  initializeWorkflow(
    workflowId: string,
    useCaseId: string,
    ingestedData: IngestedData,
    agents: AgentNode[]
  ): void {
    // Extend ingested data with parsed data for easier access
    const extendedData: IngestedDataWithParsed = {
      ...ingestedData,
      parsedData: ingestedData.dataPreview || []
    };

    const workflowData: WorkflowData = {
      workflowId,
      useCaseId,
      ingestedData: extendedData,
      agents,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };

    this.workflows.set(workflowId, workflowData);
    this.persistWorkflow(workflowId, workflowData);
    
    this.emitEvent({
      type: 'data_ingested',
      workflowId,
      timestamp: new Date(),
      data: { ingestedData }
    });
  }

  /**
   * Update workflow status
   */
  updateWorkflowStatus(
    workflowId: string,
    status: WorkflowData['status'],
    progress?: number
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.status = status;
    if (progress !== undefined) {
      workflow.progress = progress;
    }
    if (status === 'completed' || status === 'failed') {
      workflow.endTime = new Date();
    }

    this.workflows.set(workflowId, workflow);
    this.persistWorkflow(workflowId, workflow);
    
    this.emitEvent({
      type: 'workflow_started',
      workflowId,
      timestamp: new Date(),
      data: { status, progress }
    });
  }

  /**
   * Record agent deployment
   */
  recordAgentDeployment(
    workflowId: string,
    agentId: string,
    status: 'deploying' | 'deployed' | 'failed'
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    this.emitEvent({
      type: 'agent_deployed',
      workflowId,
      timestamp: new Date(),
      data: { agentId, status }
    });
  }

  /**
   * Record agent activity
   */
  recordAgentActivity(
    workflowId: string,
    agentId: string,
    activity: {
      type: string;
      message: string;
      data?: any;
      progress?: number;
    }
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    this.emitEvent({
      type: 'agent_activity',
      workflowId,
      timestamp: new Date(),
      data: { agentId, activity }
    });

    // Update overall workflow progress if provided
    if (activity.progress !== undefined) {
      this.updateWorkflowStatus(workflowId, 'running', activity.progress);
    }
  }

  /**
   * Complete workflow and store results
   */
  completeWorkflow(
    workflowId: string,
    results: any,
    certificationStatus: 'certified' | 'failed' = 'certified'
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.status = 'completed';
    workflow.progress = 100;
    workflow.endTime = new Date();
    workflow.results = results;
    workflow.certificationStatus = certificationStatus;

    this.workflows.set(workflowId, workflow);
    this.persistWorkflow(workflowId, workflow);
    
    this.emitEvent({
      type: 'workflow_completed',
      workflowId,
      timestamp: new Date(),
      data: { results, certificationStatus }
    });

    if (certificationStatus === 'certified') {
      this.emitEvent({
        type: 'certification_generated',
        workflowId,
        timestamp: new Date(),
        data: { certificationStatus }
      });
    }
  }

  /**
   * Get workflow data
   */
  getWorkflowData(workflowId: string): WorkflowData | undefined {
    // Try memory first
    let workflow = this.workflows.get(workflowId);
    
    // If not in memory, try localStorage
    if (!workflow) {
      const stored = localStorage.getItem(`${this.storagePrefix}${workflowId}`);
      if (stored) {
        try {
          workflow = JSON.parse(stored);
          if (workflow) {
            // Restore dates
            workflow.startTime = new Date(workflow.startTime);
            if (workflow.endTime) {
              workflow.endTime = new Date(workflow.endTime);
            }
            this.workflows.set(workflowId, workflow);
          }
        } catch (error) {
          console.error('Failed to parse stored workflow:', error);
        }
      }
    }
    
    return workflow;
  }

  /**
   * Get all workflows for a use case
   */
  getWorkflowsByUseCase(useCaseId: string): WorkflowData[] {
    const workflows: WorkflowData[] = [];
    
    // Check memory
    this.workflows.forEach((workflow) => {
      if (workflow.useCaseId === useCaseId) {
        workflows.push(workflow);
      }
    });
    
    // Check localStorage for any we might have missed
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const workflow = JSON.parse(stored);
            if (workflow.useCaseId === useCaseId && 
                !workflows.find(w => w.workflowId === workflow.workflowId)) {
              workflows.push(workflow);
            }
          }
        } catch (error) {
          console.error('Failed to parse stored workflow:', error);
        }
      }
    }
    
    return workflows;
  }

  /**
   * Subscribe to data flow events
   */
  subscribe(
    workflowId: string,
    callback: (event: DataFlowEvent) => void
  ): () => void {
    if (!this.eventListeners.has(workflowId)) {
      this.eventListeners.set(workflowId, new Set());
    }
    
    this.eventListeners.get(workflowId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(workflowId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(workflowId);
        }
      }
    };
  }

  /**
   * Subscribe to all events for a use case
   */
  subscribeToUseCase(
    useCaseId: string,
    callback: (event: DataFlowEvent) => void
  ): () => void {
    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to all existing workflows for this use case
    const workflows = this.getWorkflowsByUseCase(useCaseId);
    workflows.forEach(workflow => {
      unsubscribers.push(this.subscribe(workflow.workflowId, callback));
    });
    
    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: DataFlowEvent): void {
    const listeners = this.eventListeners.get(event.workflowId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Persist workflow to localStorage
   */
  private persistWorkflow(workflowId: string, workflow: WorkflowData): void {
    try {
      localStorage.setItem(
        `${this.storagePrefix}${workflowId}`,
        JSON.stringify(workflow)
      );
    } catch (error) {
      console.error('Failed to persist workflow:', error);
      toast.error('Failed to save workflow data');
    }
  }

  /**
   * Clean up old workflows (older than 7 days)
   */
  cleanupOldWorkflows(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Clean from memory
    this.workflows.forEach((workflow, id) => {
      if (workflow.startTime < sevenDaysAgo) {
        this.workflows.delete(id);
      }
    });
    
    // Clean from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const workflow = JSON.parse(stored);
            const startTime = new Date(workflow.startTime);
            if (startTime < sevenDaysAgo) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key!);
        }
      }
    }
  }
}

// Export singleton instance
export const dataFlowService = new DataFlowService();

// Clean up old workflows on initialization
dataFlowService.cleanupOldWorkflows();