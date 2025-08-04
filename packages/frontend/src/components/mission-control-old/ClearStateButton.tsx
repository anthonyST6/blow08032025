import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useMissionControlPersistence } from '../../hooks/useMissionControlPersistence';

interface ClearStateButtonProps {
  className?: string;
  variant?: 'default' | 'danger' | 'minimal';
  showIcon?: boolean;
  showText?: boolean;
  onClear?: () => void;
}

export const ClearStateButton: React.FC<ClearStateButtonProps> = ({
  className = '',
  variant = 'default',
  showIcon = true,
  showText = true,
  onClear
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { clearState, hasSelectedUseCase } = useMissionControlPersistence();

  const handleClear = () => {
    clearState();
    onClear?.();
    setShowConfirmDialog(false);
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium transition-all duration-200';
    
    switch (variant) {
      case 'danger':
        return `${baseClasses} px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`;
      case 'minimal':
        return `${baseClasses} px-3 py-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400`;
      default:
        return `${baseClasses} px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`;
    }
  };

  // Don't show button if there's no active session
  if (!hasSelectedUseCase) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmDialog(true)}
        className={`${getButtonClasses()} ${className}`}
        title="Clear all Mission Control data"
      >
        {showIcon && <RotateCcw className="w-4 h-4" />}
        {showText && <span>Reset</span>}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Clear Mission Control Data?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This will clear all your current selections, uploaded data, and execution history. 
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                The following will be cleared:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
                <li>• Selected vertical and use case</li>
                <li>• Uploaded data files</li>
                <li>• Execution history</li>
                <li>• Current workflow progress</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export a preset version for the header
export const HeaderClearButton: React.FC<{ className?: string }> = ({ className }) => (
  <ClearStateButton 
    variant="minimal" 
    showText={false} 
    className={className}
  />
);

// Export a preset version for the main dashboard
export const DashboardResetButton: React.FC<{ className?: string; onClear?: () => void }> = ({ 
  className, 
  onClear 
}) => (
  <ClearStateButton 
    variant="danger" 
    className={className}
    onClear={onClear}
  />
);