import React from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';
import { useNavigate } from 'react-router-dom';

/**
 * Component that displays the persisted state and allows quick navigation
 * to the Use Case Dashboard when a use case is already selected
 */
export const PersistedStateIndicator: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedUseCase,
    selectedUseCaseDetails,
    selectedVertical,
    clearState
  } = useMissionControlPersistence();

  if (!selectedUseCase || !selectedUseCaseDetails) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-yellow-500 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-500 mb-1">
            Active Selection
          </h4>
          <p className="text-white text-sm mb-2">
            {selectedUseCaseDetails.title || selectedUseCase}
          </p>
          <p className="text-gray-400 text-xs mb-3">
            {selectedVertical && `Vertical: ${selectedVertical}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/mission-control/use-case')}
              className="px-3 py-1 bg-yellow-500 text-black text-xs font-semibold rounded hover:bg-yellow-400 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => {
                clearState();
                window.location.reload();
              }}
              className="px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded hover:bg-gray-600 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
        <button
          onClick={() => clearState()}
          className="ml-2 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PersistedStateIndicator;