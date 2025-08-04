import { useMissionControlPersistence } from './useMissionControlPersistence';
import { useNavigate } from 'react-router-dom';

export const useSelectedUseCase = () => {
  const navigate = useNavigate();
  const { 
    selectedUseCase, 
    selectedUseCaseDetails,
    clearState 
  } = useMissionControlPersistence();
  
  const returnToMissionControl = () => {
    // Don't clear state - user might want to come back
    navigate('/mission-control');
  };
  
  const clearAndReturn = () => {
    // Clear selection and return
    clearState();
    navigate('/mission-control');
  };
  
  return {
    useCaseId: selectedUseCase,
    useCaseDetails: selectedUseCaseDetails,
    hasSelection: !!selectedUseCase,
    returnToMissionControl,
    clearAndReturn
  };
};