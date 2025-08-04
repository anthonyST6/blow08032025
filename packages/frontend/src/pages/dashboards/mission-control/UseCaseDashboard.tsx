import React, { useEffect } from 'react';
import { useSelectedUseCase } from '../../../hooks/useSelectedUseCase';
import { useUseCaseWebSocket } from '../../../hooks/useWebSocket';
import { useUseCaseContent } from '../../../hooks/useUseCaseTemplate';
import { BlankState } from '../../../components/use-case-dashboard/BlankState';
import { UseCaseHeader } from '../../../components/use-case-dashboard/UseCaseHeader';
import { toast } from 'react-hot-toast';

const UseCaseDashboard: React.FC = () => {
  const { useCaseId, hasSelection } = useSelectedUseCase();
  const {
    isConnected,
    executionStatus,
    executionProgress,
    executionError,
    subscribe
  } = useUseCaseWebSocket(useCaseId || undefined);
  const { renderContent, loading, error, hasAccess } = useUseCaseContent(useCaseId);
  
  // Log the current selection for debugging
  useEffect(() => {
    if (useCaseId) {
      console.log('Current Use Case:', useCaseId);
      console.log('Loading:', loading, 'Error:', error, 'Has Access:', hasAccess);
    }
  }, [useCaseId, loading, error, hasAccess]);
  
  // Handle WebSocket events
  useEffect(() => {
    if (!isConnected || !useCaseId) return;
    
    const unsubscribers = [
      // Handle use case updates
      subscribe('usecase:update', (data: any) => {
        console.log('Use case update:', data);
        // Could trigger a refetch of use case data here
      }),
      
      // Handle Vanguard agent results
      subscribe('vanguard:result', (data: any) => {
        console.log('Vanguard result:', data);
        toast.success(`Vanguard ${data.agentId} completed: ${data.result}`);
      }),
      
      // Handle alerts
      subscribe('alert:new', (data: any) => {
        console.log('New alert:', data);
        if (data.severity === 'error') {
          toast.error(data.message);
        } else if (data.severity === 'warning') {
          toast(data.message, { icon: '⚠️' });
        } else {
          toast(data.message);
        }
      })
    ];
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, useCaseId, subscribe]);
  
  // Log execution status changes
  useEffect(() => {
    if (executionStatus) {
      console.log('Execution status:', executionStatus, 'Progress:', executionProgress);
    }
    if (executionError) {
      console.error('Execution error:', executionError);
      toast.error(`Execution failed: ${executionError.message}`);
    }
  }, [executionStatus, executionProgress, executionError]);
  
  // If no use case is selected, show blank state
  if (!hasSelection) {
    return <BlankState />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <UseCaseHeader />
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default UseCaseDashboard;