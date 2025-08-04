import React, { useEffect } from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';

interface MissionControlPersistenceWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that intercepts use case selections from Mission Control
 * and persists them to localStorage using the persistence service.
 *
 * This is a minimal, non-invasive solution that doesn't require modifying
 * the large Mission Control component directly.
 */
export const MissionControlPersistenceWrapper: React.FC<MissionControlPersistenceWrapperProps> = ({
  children
}) => {
  const {
    setSelectedVertical,
    setSelectedUseCase,
    selectedUseCase: persistedUseCaseId,
    selectedUseCaseDetails,
    selectedVertical
  } = useMissionControlPersistence();

  useEffect(() => {
    // Function to handle use case selection events
    const handleUseCaseSelect = (event: CustomEvent) => {
      const useCase = event.detail;
      
      if (useCase && useCase.id) {
        // Extract vertical from use case ID (e.g., 'energy-oilfield-land-lease' -> 'energy')
        const vertical = useCase.vertical || useCase.id.split('-')[0];
        
        // Persist the selection
        setSelectedVertical(vertical);
        setSelectedUseCase(useCase.id, useCase);
        
        console.log('[MissionControlPersistenceWrapper] Persisted use case selection:', {
          vertical,
          useCaseId: useCase.id,
          useCase
        });
      }
    };

    // Function to handle clear selection events
    const handleClearSelection = () => {
      setSelectedVertical(null);
      setSelectedUseCase(null);
      console.log('[MissionControlPersistenceWrapper] Cleared use case selection');
    };

    // Listen for custom events from Mission Control
    window.addEventListener('useCaseSelected', handleUseCaseSelect as EventListener);
    window.addEventListener('clearUseCaseSelection', handleClearSelection);

    // Log current persisted state on mount
    console.log('[MissionControlPersistenceWrapper] Current persisted state:', {
      persistedUseCaseId,
      selectedUseCaseDetails,
      selectedVertical
    });

    // Emit restore event if we have persisted state
    if (persistedUseCaseId && selectedUseCaseDetails) {
      // Delay to ensure Mission Control is mounted
      setTimeout(() => {
        console.log('[MissionControlPersistenceWrapper] Emitting restore event');
        window.dispatchEvent(new CustomEvent('restoreUseCaseSelection', {
          detail: {
            vertical: selectedVertical,
            useCaseId: persistedUseCaseId,
            useCase: selectedUseCaseDetails
          },
          bubbles: true
        }));
      }, 100);
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('useCaseSelected', handleUseCaseSelect as EventListener);
      window.removeEventListener('clearUseCaseSelection', handleClearSelection);
    };
  }, [setSelectedVertical, setSelectedUseCase, persistedUseCaseId, selectedUseCaseDetails, selectedVertical]);

  // Render children without modification
  return <>{children}</>;
};

/**
 * Helper function to emit use case selection event
 * This should be called from Mission Control when a use case is selected
 * 
 * Example usage in Mission Control:
 * onClick={() => {
 *   setSelectedUseCase(useCase);
 *   emitUseCaseSelection(useCase);
 * }}
 */
export const emitUseCaseSelection = (useCase: any) => {
  window.dispatchEvent(new CustomEvent('useCaseSelected', { 
    detail: useCase,
    bubbles: true 
  }));
};

/**
 * Helper function to emit clear selection event
 * This should be called when clearing the selection
 */
export const emitClearSelection = () => {
  window.dispatchEvent(new CustomEvent('clearUseCaseSelection', {
    bubbles: true
  }));
};

/**
 * Helper function to emit restore selection event
 * This is used internally by the wrapper to restore persisted state
 */
export const emitRestoreSelection = (vertical: string, useCaseId: string, useCase: any) => {
  window.dispatchEvent(new CustomEvent('restoreUseCaseSelection', {
    detail: {
      vertical,
      useCaseId,
      useCase
    },
    bubbles: true
  }));
};