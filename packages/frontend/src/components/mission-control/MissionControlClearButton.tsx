import React from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';
import { Trash2 } from 'lucide-react';

interface MissionControlClearButtonProps {
  onClear?: () => void;
}

/**
 * Button component to clear the entire use case selection and reset to original state
 */
export const MissionControlClearButton: React.FC<MissionControlClearButtonProps> = ({ onClear }) => {
  const { clearState, selectedUseCase } = useMissionControlPersistence();

  const handleClear = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to clear the current use case?\n\n' +
      'This will:\n' +
      '• Clear all tab data (Executive Summary, Agents, etc.)\n' +
      '• Remove the selected use case\n' +
      '• Reset to the original state'
    );

    if (confirmed) {
      // Clear persistence state
      clearState();
      
      // Emit clear event for Mission Control to handle
      window.dispatchEvent(new CustomEvent('clearUseCaseSelection', {
        bubbles: true
      }));

      // Call optional callback
      if (onClear) {
        onClear();
      }

      // Reload the page to ensure complete reset
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Only show button if a use case is selected
  if (!selectedUseCase) {
    return null;
  }

  return (
    <button
      onClick={handleClear}
      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
      title="Clear current use case and reset to original state"
    >
      <Trash2 className="w-5 h-5" />
      <span>Clear Use Case</span>
    </button>
  );
};

/**
 * Injector component that adds the clear button to the Mission Control UI
 */
export const MissionControlClearButtonInjector: React.FC = () => {
  React.useEffect(() => {
    const injectButton = () => {
      // Find the container with Upload Data and Start Deployment buttons
      const buttonContainers = document.querySelectorAll('.flex.items-center.justify-between');
      
      buttonContainers.forEach(container => {
        // Check if this is the right container (has Upload Data button)
        const uploadButton = container.querySelector('button');
        const hasUploadData = uploadButton?.textContent?.includes('Upload Data');
        
        if (hasUploadData && !container.querySelector('[data-clear-button]')) {
          // Create wrapper for buttons
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center gap-4 flex-1';
          wrapper.setAttribute('data-clear-button', 'true');
          
          // Move existing buttons to wrapper
          const existingButtons = Array.from(container.children);
          existingButtons.forEach(child => {
            wrapper.appendChild(child);
          });
          
          // Add wrapper back to container
          container.appendChild(wrapper);
          
          // Adjust container styles
          container.classList.add('flex', 'items-center', 'justify-between', 'gap-4');
          
          // Create and add clear button container
          const clearButtonContainer = document.createElement('div');
          clearButtonContainer.id = 'mission-control-clear-button';
          clearButtonContainer.className = 'ml-auto';
          wrapper.appendChild(clearButtonContainer);
          
          // Adjust Start Deployment button position
          const deployButton = wrapper.querySelector('button:last-of-type');
          if (deployButton && deployButton.textContent?.includes('Start Deployment')) {
            deployButton.classList.add('ml-4');
          }
        }
      });
    };

    // Initial injection
    const timeout = setTimeout(injectButton, 1000);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      injectButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return null;
};