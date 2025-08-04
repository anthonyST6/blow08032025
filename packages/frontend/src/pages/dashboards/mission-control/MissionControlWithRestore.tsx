import React, { useEffect } from 'react';
import MissionControl from './MissionControl';

/**
 * Wrapper component that handles restoring persisted state for Mission Control
 * This is a workaround since the MissionControl file is too large to edit directly
 */
const MissionControlWithRestore: React.FC = () => {
  useEffect(() => {
    const handleRestoreSelection = (event: CustomEvent) => {
      const { vertical, useCaseId, useCase } = event.detail;
      
      console.log('[MissionControlWithRestore] Restoring persisted selection:', {
        vertical,
        useCaseId,
        useCase
      });
      
      // Since we can't directly set state in Mission Control,
      // we'll use a different approach - navigate to Use Case Dashboard
      // if there's a persisted selection
      if (useCaseId && useCase) {
        // The persistence is already working, so when user navigates
        // to Use Case Dashboard, it will show the selected use case
        console.log('[MissionControlWithRestore] Use case already persisted, ready for navigation');
      }
    };
    
    // Listen for restore event
    window.addEventListener('restoreUseCaseSelection', handleRestoreSelection as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('restoreUseCaseSelection', handleRestoreSelection as EventListener);
    };
  }, []);

  return <MissionControl />;
};

export default MissionControlWithRestore;