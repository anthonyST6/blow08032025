import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Save, Download, Upload, Trash2 } from 'lucide-react';
import { missionControlPersistence } from '../../services/mission-control-persistence.service';
import { useMissionControlPersistence } from '../../hooks/useMissionControlPersistence';

interface PersistenceIndicatorProps {
  className?: string;
  showActions?: boolean;
}

export const PersistenceIndicator: React.FC<PersistenceIndicatorProps> = ({ 
  className = '', 
  showActions = true 
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { state, clearState, exportState, importState } = useMissionControlPersistence();

  useEffect(() => {
    // Listen for state changes to show save indicator
    const unsubscribe = missionControlPersistence.onStateChange(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 500);
      setTimeout(() => setSaveStatus('idle'), 2000);
    });

    return unsubscribe;
  }, []);

  const handleClearState = () => {
    if (window.confirm('Are you sure you want to clear all Mission Control data? This action cannot be undone.')) {
      clearState();
    }
  };

  const handleExport = () => {
    const stateJson = exportState();
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-control-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importState(content);
        if (success) {
          alert('State imported successfully!');
        } else {
          alert('Failed to import state. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing state: ' + error);
      }
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Save className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return state ? 'Auto-save enabled' : 'No active session';
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Save Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon()}
        <span className="text-gray-600 dark:text-gray-400">{getStatusText()}</span>
      </div>

      {/* Action Buttons */}
      {showActions && state && (
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={() => setShowExportDialog(true)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title="Export state"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import Button */}
          <button
            onClick={() => setShowImportDialog(true)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title="Import state"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClearState}
            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Clear all data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Export Mission Control State</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Download your current Mission Control state as a JSON file. You can import this later to restore your session.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import Mission Control State</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a previously exported JSON file to restore your Mission Control state.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="mb-6 w-full"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};