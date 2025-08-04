import React, { useEffect } from 'react';
import { useMissionControlPersistence } from '../../../hooks/useMissionControlPersistence';
import MissionControl from './MissionControl';

/**
 * Wrapper component for Mission Control that handles state persistence
 * This ensures that use case selections are properly saved and restored
 */
const MissionControlWrapper: React.FC = () => {
  const {
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    setSelectedVertical,
    setSelectedUseCase,
  } = useMissionControlPersistence();

  // Create a modified version of MissionControl that uses persisted state
  const handleUseCaseSelection = (useCase: any) => {
    // Extract the vertical from the use case ID (e.g., 'energy-oilfield-land-lease' -> 'energy')
    const vertical = useCase.id.split('-')[0];
    
    // Save both vertical and use case to persistence
    setSelectedVertical(vertical);
    setSelectedUseCase(useCase.id, useCase);
    
    console.log('Persisting use case selection:', {
      vertical,
      useCaseId: useCase.id,
      useCase
    });
  };

  // Log current persisted state for debugging
  useEffect(() => {
    console.log('Current persisted state:', {
      selectedVertical,
      selectedUseCase,
      selectedUseCaseDetails
    });
  }, [selectedVertical, selectedUseCase, selectedUseCaseDetails]);

  return (
    <div>
      {/* Pass the persistence handler to the original Mission Control */}
      <MissionControl 
        onUseCaseSelect={handleUseCaseSelection}
        initialSelectedUseCase={selectedUseCaseDetails}
      />
    </div>
  );
};

export default MissionControlWrapper;