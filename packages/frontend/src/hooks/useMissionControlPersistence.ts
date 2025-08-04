import { useState, useEffect, useCallback } from 'react';
import { 
  missionControlPersistence, 
  MissionControlState, 
  ExecutionRecord 
} from '../services/mission-control-persistence.service';

export interface UseMissionControlPersistenceReturn {
  // State
  state: MissionControlState | null;
  isLoading: boolean;
  
  // Getters
  selectedVertical: string | null;
  selectedUseCase: string | null;
  selectedUseCaseDetails: any | null;
  uploadedData: any | null;
  executionHistory: ExecutionRecord[];
  currentStep: string | null;
  hasSelectedUseCase: boolean;
  
  // Actions
  setSelectedVertical: (vertical: string | null) => void;
  setSelectedUseCase: (useCase: string | null, details?: any) => void;
  setUploadedData: (data: any) => void;
  setCurrentStep: (step: string | null) => void;
  addExecution: (execution: ExecutionRecord) => void;
  clearState: () => void;
  exportState: () => string;
  importState: (jsonString: string) => boolean;
}

export function useMissionControlPersistence(): UseMissionControlPersistenceReturn {
  const [state, setState] = useState<MissionControlState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const loadState = () => {
      const savedState = missionControlPersistence.getState();
      setState(savedState);
      setIsLoading(false);
    };

    loadState();

    // Subscribe to state changes
    const unsubscribeChange = missionControlPersistence.onStateChange((newState) => {
      setState(newState);
    });

    const unsubscribeClear = missionControlPersistence.onStateClear(() => {
      setState(null);
    });

    // Cleanup
    return () => {
      unsubscribeChange();
      unsubscribeClear();
    };
  }, []);

  // Actions
  const setSelectedVertical = useCallback((vertical: string | null) => {
    missionControlPersistence.updateState({
      selectedVertical: vertical,
      // Clear use case when vertical changes
      selectedUseCase: null,
      selectedUseCaseDetails: null
    });
  }, []);

  const setSelectedUseCase = useCallback((useCase: string | null, details?: any) => {
    missionControlPersistence.updateState({
      selectedUseCase: useCase,
      selectedUseCaseDetails: details || null
    });
  }, []);

  const setUploadedData = useCallback((data: any) => {
    missionControlPersistence.updateState({
      uploadedData: data
    });
  }, []);

  const setCurrentStep = useCallback((step: string | null) => {
    missionControlPersistence.updateState({
      currentStep: step
    });
  }, []);

  const addExecution = useCallback((execution: ExecutionRecord) => {
    missionControlPersistence.addExecutionRecord(execution);
  }, []);

  const clearState = useCallback(() => {
    missionControlPersistence.clearState();
  }, []);

  const exportState = useCallback(() => {
    return missionControlPersistence.exportState();
  }, []);

  const importState = useCallback((jsonString: string) => {
    return missionControlPersistence.importState(jsonString);
  }, []);

  // Computed values
  const selectedVertical = state?.selectedVertical || null;
  const selectedUseCase = state?.selectedUseCase || null;
  const selectedUseCaseDetails = state?.selectedUseCaseDetails || null;
  const uploadedData = state?.uploadedData || null;
  const executionHistory = state?.executionHistory || [];
  const currentStep = state?.currentStep || null;
  const hasSelectedUseCase = !!(selectedVertical && selectedUseCase);

  return {
    // State
    state,
    isLoading,
    
    // Getters
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    uploadedData,
    executionHistory,
    currentStep,
    hasSelectedUseCase,
    
    // Actions
    setSelectedVertical,
    setSelectedUseCase,
    setUploadedData,
    setCurrentStep,
    addExecution,
    clearState,
    exportState,
    importState
  };
}