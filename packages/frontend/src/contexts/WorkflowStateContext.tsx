import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WorkflowState {
  activeWorkflows: Map<string, any>;
  activeDeployments: Map<string, any>;
  ingestedData: Record<string, any>;
  certificationResults: Map<string, any>;
}

interface WorkflowStateContextType {
  workflowState: WorkflowState;
  setActiveWorkflow: (workflowId: string, data: any) => void;
  removeActiveWorkflow: (workflowId: string) => void;
  setActiveDeployment: (deploymentId: string, data: any) => void;
  removeActiveDeployment: (deploymentId: string) => void;
  setIngestedData: (useCaseId: string, data: any) => void;
  setCertificationResults: (workflowId: string, results: any) => void;
  getActiveWorkflow: (workflowId: string) => any;
  getActiveDeployment: (deploymentId: string) => any;
}

const WorkflowStateContext = createContext<WorkflowStateContextType | undefined>(undefined);

export const useWorkflowState = () => {
  const context = useContext(WorkflowStateContext);
  if (!context) {
    throw new Error('useWorkflowState must be used within a WorkflowStateProvider');
  }
  return context;
};

interface WorkflowStateProviderProps {
  children: ReactNode;
}

export const WorkflowStateProvider: React.FC<WorkflowStateProviderProps> = ({ children }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem('workflowState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          activeWorkflows: new Map(parsed.activeWorkflows || []),
          activeDeployments: new Map(parsed.activeDeployments || []),
          ingestedData: parsed.ingestedData || {},
          certificationResults: new Map(parsed.certificationResults || []),
        };
      } catch (error) {
        console.error('Failed to parse saved workflow state:', error);
      }
    }
    
    return {
      activeWorkflows: new Map(),
      activeDeployments: new Map(),
      ingestedData: {},
      certificationResults: new Map(),
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    const stateToSave = {
      activeWorkflows: Array.from(workflowState.activeWorkflows.entries()),
      activeDeployments: Array.from(workflowState.activeDeployments.entries()),
      ingestedData: workflowState.ingestedData,
      certificationResults: Array.from(workflowState.certificationResults.entries()),
    };
    localStorage.setItem('workflowState', JSON.stringify(stateToSave));
  }, [workflowState]);

  const setActiveWorkflow = (workflowId: string, data: any) => {
    setWorkflowState(prev => {
      const newState = { ...prev };
      newState.activeWorkflows = new Map(prev.activeWorkflows);
      newState.activeWorkflows.set(workflowId, data);
      return newState;
    });
  };

  const removeActiveWorkflow = (workflowId: string) => {
    setWorkflowState(prev => {
      const newState = { ...prev };
      newState.activeWorkflows = new Map(prev.activeWorkflows);
      newState.activeWorkflows.delete(workflowId);
      return newState;
    });
  };

  const setActiveDeployment = (deploymentId: string, data: any) => {
    setWorkflowState(prev => {
      const newState = { ...prev };
      newState.activeDeployments = new Map(prev.activeDeployments);
      newState.activeDeployments.set(deploymentId, data);
      return newState;
    });
  };

  const removeActiveDeployment = (deploymentId: string) => {
    setWorkflowState(prev => {
      const newState = { ...prev };
      newState.activeDeployments = new Map(prev.activeDeployments);
      newState.activeDeployments.delete(deploymentId);
      return newState;
    });
  };

  const setIngestedData = (useCaseId: string, data: any) => {
    setWorkflowState(prev => ({
      ...prev,
      ingestedData: {
        ...prev.ingestedData,
        [useCaseId]: data,
      },
    }));
  };

  const setCertificationResults = (workflowId: string, results: any) => {
    setWorkflowState(prev => {
      const newState = { ...prev };
      newState.certificationResults = new Map(prev.certificationResults);
      newState.certificationResults.set(workflowId, results);
      return newState;
    });
  };

  const getActiveWorkflow = (workflowId: string) => {
    return workflowState.activeWorkflows.get(workflowId);
  };

  const getActiveDeployment = (deploymentId: string) => {
    return workflowState.activeDeployments.get(deploymentId);
  };

  const value: WorkflowStateContextType = {
    workflowState,
    setActiveWorkflow,
    removeActiveWorkflow,
    setActiveDeployment,
    removeActiveDeployment,
    setIngestedData,
    setCertificationResults,
    getActiveWorkflow,
    getActiveDeployment,
  };

  return (
    <WorkflowStateContext.Provider value={value}>
      {children}
    </WorkflowStateContext.Provider>
  );
};