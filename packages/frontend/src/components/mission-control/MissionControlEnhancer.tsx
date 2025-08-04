import { useEffect } from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';

/**
 * Component that enhances Mission Control with data attributes and event handling
 * for proper state restoration without modifying the original component
 */
export const MissionControlEnhancer: React.FC = () => {
  const {
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    setSelectedVertical,
    setSelectedUseCase
  } = useMissionControlPersistence();

  useEffect(() => {
    // Function to add data attributes to elements for easier selection
    const enhanceElements = () => {
      // Add data attributes to vertical cards
      const verticalCards = document.querySelectorAll('.cursor-pointer');
      verticalCards.forEach(card => {
        const titleElement = card.querySelector('h3');
        if (titleElement) {
          const title = titleElement.textContent?.toLowerCase();
          if (title?.includes('energy')) {
            card.setAttribute('data-vertical', 'energy');
          } else if (title?.includes('healthcare')) {
            card.setAttribute('data-vertical', 'healthcare');
          } else if (title?.includes('finance')) {
            card.setAttribute('data-vertical', 'finance');
          } else if (title?.includes('manufacturing')) {
            card.setAttribute('data-vertical', 'manufacturing');
          } else if (title?.includes('retail')) {
            card.setAttribute('data-vertical', 'retail');
          } else if (title?.includes('logistics')) {
            card.setAttribute('data-vertical', 'logistics');
          } else if (title?.includes('education')) {
            card.setAttribute('data-vertical', 'education');
          } else if (title?.includes('pharma')) {
            card.setAttribute('data-vertical', 'pharma');
          } else if (title?.includes('government')) {
            card.setAttribute('data-vertical', 'government');
          } else if (title?.includes('telecom')) {
            card.setAttribute('data-vertical', 'telecom');
          }
        }
      });

      // Add data attributes to use case elements
      const useCaseElements = document.querySelectorAll('.bg-gray-800');
      useCaseElements.forEach(element => {
        const textContent = element.textContent?.toLowerCase();
        if (textContent?.includes('oilfield land lease')) {
          element.setAttribute('data-usecase', 'energy-oilfield-land-lease');
        } else if (textContent?.includes('grid anomaly')) {
          element.setAttribute('data-usecase', 'energy-grid-anomaly');
        } else if (textContent?.includes('load forecasting')) {
          element.setAttribute('data-usecase', 'energy-load-forecasting');
        }
        // Add more use cases as needed
      });
    };

    // Function to restore visual state
    const restoreVisualState = () => {
      if (!selectedVertical || !selectedUseCase) return;

      console.log('[MissionControlEnhancer] Restoring visual state:', {
        vertical: selectedVertical,
        useCase: selectedUseCase
      });

      // Highlight the selected vertical
      const verticalCards = document.querySelectorAll('[data-vertical]');
      verticalCards.forEach(card => {
        const cardVertical = card.getAttribute('data-vertical');
        if (cardVertical === selectedVertical) {
          // Add highlight classes
          card.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-gray-900');
          
          // Simulate click to load use cases
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          card.dispatchEvent(clickEvent);
        }
      });

      // After a delay, highlight the selected use case
      setTimeout(() => {
        const useCaseElements = document.querySelectorAll('[data-usecase]');
        useCaseElements.forEach(element => {
          const elementUseCase = element.getAttribute('data-usecase');
          if (elementUseCase === selectedUseCase) {
            // Add highlight classes
            element.classList.add('ring-2', 'ring-amber-500', 'bg-amber-500/10');
            
            // Scroll into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Simulate click to load tab data
            setTimeout(() => {
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              element.dispatchEvent(clickEvent);
            }, 300);
          }
        });
      }, 1000);
    };

    // Function to handle click events and persist selections
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const closestVertical = target.closest('[data-vertical]');
      const closestUseCase = target.closest('[data-usecase]');

      if (closestVertical) {
        const vertical = closestVertical.getAttribute('data-vertical');
        if (vertical) {
          setSelectedVertical(vertical);
          console.log('[MissionControlEnhancer] Vertical selected:', vertical);
        }
      }

      if (closestUseCase) {
        const useCase = closestUseCase.getAttribute('data-usecase');
        if (useCase) {
          const useCaseDetails = {
            id: useCase,
            title: closestUseCase.textContent || useCase,
            vertical: selectedVertical || useCase.split('-')[0]
          };
          setSelectedUseCase(useCase, useCaseDetails);
          console.log('[MissionControlEnhancer] Use case selected:', useCase);
        }
      }
    };

    // Initial enhancement
    const initTimeout = setTimeout(() => {
      enhanceElements();
      restoreVisualState();
    }, 500);

    // Re-enhance when DOM changes
    const observer = new MutationObserver(() => {
      enhanceElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Add global click listener
    document.addEventListener('click', handleClick);

    // Listen for restore events
    const handleRestore = (event: CustomEvent) => {
      console.log('[MissionControlEnhancer] Handling restore event:', event.detail);
      setTimeout(() => {
        enhanceElements();
        restoreVisualState();
      }, 500);
    };

    window.addEventListener('missionControlFullRestore', handleRestore as EventListener);
    window.addEventListener('restoreUseCaseSelection', handleRestore as EventListener);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      observer.disconnect();
      document.removeEventListener('click', handleClick);
      window.removeEventListener('missionControlFullRestore', handleRestore as EventListener);
      window.removeEventListener('restoreUseCaseSelection', handleRestore as EventListener);
    };
  }, [selectedVertical, selectedUseCase, setSelectedVertical, setSelectedUseCase]);

  // This component doesn't render anything
  return null;
};