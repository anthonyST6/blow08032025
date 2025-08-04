import React, { useState, useEffect } from 'react';
import { vanguardActionsService, VanguardAction } from '../../services/vanguardActions.service';
import {
  ChevronDownIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface VanguardActionsDropdownProps {
  useCaseId?: string;
  onActionSelect?: (action: VanguardAction) => void;
}

const VanguardActionsDropdown: React.FC<VanguardActionsDropdownProps> = ({ 
  useCaseId, 
  onActionSelect 
}) => {
  const [actions, setActions] = useState<VanguardAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<VanguardAction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [generatingLedger, setGeneratingLedger] = useState(false);

  // Fetch actions on component mount or when useCase changes
  useEffect(() => {
    console.log('VanguardActionsDropdown mounted/updated with useCaseId:', useCaseId);
    if (useCaseId) {
      fetchActions();
    }
  }, [useCaseId]);

  const fetchActions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching vanguard actions for use case:', useCaseId);
      const fetchedActions = await vanguardActionsService.getAllActions(useCaseId);
      console.log('Fetched actions:', fetchedActions);
      setActions(fetchedActions);
    } catch (err) {
      setError('Failed to fetch vanguard actions');
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSelect = (action: VanguardAction) => {
    setSelectedAction(action);
    setShowDetails(true);
    if (onActionSelect) {
      onActionSelect(action);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!selectedAction) return;
    
    setGeneratingReceipt(true);
    try {
      const receipt = await vanguardActionsService.generateActionReceipt(selectedAction.id);
      
      // Download the receipt
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vanguard-action-receipt-${selectedAction.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating receipt:', err);
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const handleGenerateLedger = async () => {
    setGeneratingLedger(true);
    try {
      const date = new Date();
      const ledger = await vanguardActionsService.generateDailyLedger(date);
      
      // Download the ledger
      const blob = new Blob([JSON.stringify(ledger, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vanguard-daily-ledger-${date.toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ledger:', err);
    } finally {
      setGeneratingLedger(false);
    }
  };

  const getActionTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      read: 'text-blue-400',
      write: 'text-green-400',
      update: 'text-amber-400',
      escalate: 'text-red-400',
      recommend: 'text-purple-400',
      reject: 'text-red-500',
      approve: 'text-green-500',
    };
    return colors[type] || 'text-gray-400';
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'read':
        return <InformationCircleIcon className="h-4 w-4" />;
      case 'write':
      case 'update':
        return <DocumentArrowDownIcon className="h-4 w-4" />;
      case 'escalate':
      case 'reject':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'recommend':
      case 'approve':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ShieldCheckIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropdown Header */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-amber-500" />
              Vanguard Actions Audit Trail
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Complete audit trail of all vanguard agent actions with proof of execution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActions}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-md transition-all"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleGenerateLedger}
              disabled={generatingLedger}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/50 rounded-md transition-all"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Daily Ledger
            </button>
          </div>
        </div>

        {/* Actions Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{actions.length}</div>
            <p className="text-xs text-gray-400 mt-1">Total Actions</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {actions.filter(a => a.status === 'success').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">Success</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {actions.filter(a => a.status === 'partial').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">Partial</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {actions.filter(a => a.status === 'failed').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">Failed</p>
          </div>
        </div>

        {/* Actions List */}
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading vanguard actions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheckIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No vanguard actions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {actions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionSelect(action)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getActionTypeColor(action.actionType.toLowerCase())}`}>
                      {getActionTypeIcon(action.actionType.toLowerCase())}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{action.agent}</p>
                        <span className={`text-xs font-medium ${getActionTypeColor(action.actionType.toLowerCase())}`}>
                          {action.actionType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{action.recordAffected} - {action.systemTargeted}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {new Date(action.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {action.agent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      action.status === 'success' ? 'bg-green-900/50 text-green-400' :
                      action.status === 'partial' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Details Modal */}
      {selectedAction && showDetails && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-300">Action Details</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Action ID</p>
                <p className="text-sm text-gray-300">{selectedAction.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vanguard Agent</p>
                <p className="text-sm text-gray-300">{selectedAction.agent}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Action Type</p>
                <p className={`text-sm font-medium ${getActionTypeColor(selectedAction.actionType.toLowerCase())}`}>
                  {selectedAction.actionType.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-sm font-medium ${
                  selectedAction.status === 'success' ? 'text-green-400' :
                  selectedAction.status === 'partial' ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {selectedAction.status.toUpperCase()}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-300">{selectedAction.responseConfirmation}</p>
            </div>
            
            {selectedAction.payloadSummary && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Payload Summary</p>
                <pre className="text-xs text-gray-300 bg-gray-800 rounded p-3 overflow-x-auto">
                  {JSON.stringify(selectedAction.payloadSummary, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
              <button
                onClick={handleGenerateReceipt}
                disabled={generatingReceipt}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/50 rounded-md transition-all"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                {generatingReceipt ? 'Generating...' : 'Generate Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VanguardActionsDropdown;