import React, { useEffect, useRef } from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';

interface MissionControlStateRestorerProps {
  children: React.ReactNode;
}

/**
 * Component that handles full state restoration for Mission Control
 * including visual highlights, selections, and tab data
 */
export const MissionControlStateRestorer: React.FC<MissionControlStateRestorerProps> = ({
  children
}) => {
  const {
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    uploadedData,
    executionHistory,
    currentStep
  } = useMissionControlPersistence();
  
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    // Only restore once when component mounts and we have persisted state
    if (!hasRestoredRef.current && selectedUseCase && selectedVertical) {
      hasRestoredRef.current = true;
      
      // Delay to ensure Mission Control is fully mounted
      const restoreTimeout = setTimeout(() => {
        console.log('[MissionControlStateRestorer] Restoring full state:', {
          vertical: selectedVertical,
          useCase: selectedUseCase,
          details: selectedUseCaseDetails
        });

        // Emit a more comprehensive restore event
        const restoreEvent = new CustomEvent('missionControlFullRestore', {
          detail: {
            vertical: selectedVertical,
            useCaseId: selectedUseCase,
            useCase: selectedUseCaseDetails,
            uploadedData,
            executionHistory,
            currentStep,
            // Include flags for what should be restored
            restoreFlags: {
              highlightVertical: true,
              selectUseCase: true,
              loadTabData: true,
              scrollToUseCase: true
            }
          },
          bubbles: true
        });
        
        window.dispatchEvent(restoreEvent);

        // Also try to programmatically click the vertical and use case
        // This is a fallback approach if Mission Control doesn't handle the event
        const attemptVisualRestore = () => {
          // Find and highlight the vertical card
          const verticalCards = document.querySelectorAll('[data-vertical]');
          verticalCards.forEach(card => {
            const cardVertical = card.getAttribute('data-vertical');
            if (cardVertical === selectedVertical) {
              card.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-gray-900');
            }
          });

          // Find and highlight the use case
          const useCaseElements = document.querySelectorAll('[data-usecase]');
          useCaseElements.forEach(element => {
            const elementUseCase = element.getAttribute('data-usecase');
            if (elementUseCase === selectedUseCase) {
              element.classList.add('ring-2', 'ring-amber-500', 'bg-amber-500/10');
              // Scroll into view
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });

          // Try to restore tab data by simulating the selection
          const useCaseButton = document.querySelector(`[data-usecase="${selectedUseCase}"]`);
          if (useCaseButton && useCaseButton instanceof HTMLElement) {
            // Create a synthetic click event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            useCaseButton.dispatchEvent(clickEvent);
          }
        };

        // Try visual restore after a short delay
        setTimeout(attemptVisualRestore, 200);
      }, 500);

      return () => clearTimeout(restoreTimeout);
    }
  }, [selectedVertical, selectedUseCase, selectedUseCaseDetails, uploadedData, executionHistory, currentStep]);

  // Listen for manual restore requests
  useEffect(() => {
    const handleManualRestore = () => {
      hasRestoredRef.current = false; // Reset to allow re-restoration
    };

    window.addEventListener('requestMissionControlRestore', handleManualRestore);
    return () => window.removeEventListener('requestMissionControlRestore', handleManualRestore);
  }, []);

  return <>{children}</>;
};

/**
 * Helper to manually trigger a restore
 */
export const requestMissionControlRestore = () => {
  window.dispatchEvent(new CustomEvent('requestMissionControlRestore', { bubbles: true }));
};