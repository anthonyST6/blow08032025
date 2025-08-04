import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';
import { Trash2 } from 'lucide-react';

/**
 * Component that manages the button layout in Mission Control
 * Adds a Clear Use Case button between Upload Data and Start Deployment
 */
export const MissionControlButtonLayout: React.FC = () => {
  const { clearState, selectedUseCase } = useMissionControlPersistence();
  const [buttonContainer, setButtonContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const setupButtonLayout = () => {
      // Find all button containers
      const containers = document.querySelectorAll('.flex.items-center.justify-between');
      
      containers.forEach(container => {
        // Look for the container with both Upload Data and Start Deployment buttons
        const buttons = container.querySelectorAll('button');
        let hasUploadData = false;
        let hasStartDeployment = false;
        
        buttons.forEach(button => {
          const text = button.textContent || '';
          if (text.includes('Upload Data')) hasUploadData = true;
          if (text.includes('Start Deployment')) hasStartDeployment = true;
        });
        
        if (hasUploadData && hasStartDeployment && !container.querySelector('[data-button-layout-modified]')) {
          // Mark as modified to prevent duplicate processing
          container.setAttribute('data-button-layout-modified', 'true');
          
          // Create a new container for our button
          const clearButtonContainer = document.createElement('div');
          clearButtonContainer.id = 'clear-use-case-container';
          clearButtonContainer.className = 'flex-shrink-0';
          
          // Find the Start Deployment button
          const deployButton = Array.from(buttons).find(btn => 
            btn.textContent?.includes('Start Deployment')
          );
          
          if (deployButton && deployButton.parentElement) {
            // Insert our container before the Start Deployment button
            deployButton.parentElement.insertBefore(clearButtonContainer, deployButton);
            
            // Add some margin to the Start Deployment button
            deployButton.classList.add('ml-4');
            
            // Set our container for portal rendering
            setButtonContainer(clearButtonContainer);
          }
        }
      });
    };

    // Initial setup
    const timeout = setTimeout(setupButtonLayout, 500);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      setupButtonLayout();
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

  const handleClear = () => {
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
      
      // Emit clear event
      window.dispatchEvent(new CustomEvent('clearUseCaseSelection', {
        bubbles: true
      }));

      // Reload to ensure complete reset
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Only render if we have a container and a selected use case
  if (!buttonContainer || !selectedUseCase) {
    return null;
  }

  return createPortal(
    <button
      onClick={handleClear}
      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      title="Clear current use case and reset to original state"
    >
      <Trash2 className="w-5 h-5" />
      <span>Clear Use Case</span>
    </button>,
    buttonContainer
  );
};