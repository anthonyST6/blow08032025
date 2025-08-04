import React, { useEffect } from 'react';
import { useMissionControlPersistence } from '../../hooks/useMissionControlPersistence';
import { PersistenceIndicator } from './PersistenceIndicator';
import { DashboardResetButton } from './ClearStateButton';

/**
 * Example wrapper component showing how to integrate persistence
 * into Mission Control V2
 * 
 * Usage in MissionControlV2.tsx:
 * 
 * 1. Import the hook:
 *    import { useMissionControlPersistence } from '../../hooks/useMissionControlPersistence';
 * 
 * 2. Use the hook in your component:
 *    const {
 *      selectedVertical,
 *      selectedUseCase,
 *      setSelectedVertical,
 *      setSelectedUseCase,
 *      // ... other methods
 *    } = useMissionControlPersistence();
 * 
 * 3. Update your state setters to use the persistence methods
 * 4. Add the UI components where needed
 */

interface MissionControlPersistenceWrapperProps {
  children: React.ReactNode;
}

export const MissionControlPersistenceWrapper: React.FC<MissionControlPersistenceWrapperProps> = ({ 
  children 
}) => {
  const {
    selectedVertical,
    selectedUseCase,
    uploadedData,
    currentStep,
    isLoading
  } = useMissionControlPersistence();

  // Log persistence state for debugging
  useEffect(() => {
    console.log('Mission Control Persistence State:', {
      selectedVertical,
      selectedUseCase,
      uploadedData,
      currentStep,
      isLoading
    });
  }, [selectedVertical, selectedUseCase, uploadedData, currentStep, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Persistence Controls Header */}
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-4">
          <PersistenceIndicator />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <DashboardResetButton 
            onClear={() => {
              // Optional: Navigate to home or refresh
              window.location.href = '/';
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
};

/**
 * Example integration code for MissionControlV2.tsx:
 */
export const INTEGRATION_EXAMPLE = `
// In your MissionControlV2.tsx file:

import { useMissionControlPersistence } from '../../hooks/useMissionControlPersistence';
import { PersistenceIndicator } from '../../components/mission-control/PersistenceIndicator';
import { DashboardResetButton } from '../../components/mission-control/ClearStateButton';

export const MissionControlV2: React.FC = () => {
  // Replace your existing state with the persistence hook
  const {
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    uploadedData,
    currentStep,
    setSelectedVertical,
    setSelectedUseCase,
    setUploadedData,
    setCurrentStep,
    addExecution,
    clearState
  } = useMissionControlPersistence();

  // Your existing component logic...

  // When user selects a vertical:
  const handleVerticalSelect = (vertical: string) => {
    setSelectedVertical(vertical);
  };

  // When user selects a use case:
  const handleUseCaseSelect = (useCase: string, details?: any) => {
    setSelectedUseCase(useCase, details);
  };

  // When user uploads data:
  const handleDataUpload = (data: any) => {
    setUploadedData(data);
  };

  // When workflow step changes:
  const handleStepChange = (step: string) => {
    setCurrentStep(step);
  };

  // When execution completes:
  const handleExecutionComplete = (executionId: string, status: string) => {
    addExecution({
      id: executionId,
      useCaseId: selectedUseCase!,
      timestamp: new Date().toISOString(),
      status: status as any,
      results: { /* your results */ }
    });
  };

  return (
    <div>
      {/* Add persistence indicator in header */}
      <div className="flex justify-between items-center mb-6">
        <h1>Mission Control</h1>
        <div className="flex items-center gap-4">
          <PersistenceIndicator />
          <DashboardResetButton />
        </div>
      </div>

      {/* Your existing UI... */}
    </div>
  );
};
`;