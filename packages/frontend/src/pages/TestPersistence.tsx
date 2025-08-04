import React from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

/**
 * Test page to verify persistence is working correctly
 * This allows us to test the persistence without modifying Mission Control
 */
const TestPersistence: React.FC = () => {
  const {
    state,
    selectedVertical,
    selectedUseCase,
    selectedUseCaseDetails,
    setSelectedVertical,
    setSelectedUseCase,
    clearState,
  } = useMissionControlPersistence();

  const testUseCases = [
    {
      id: 'energy-oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      vertical: 'energy',
      active: true,
    },
    {
      id: 'healthcare-clinical-trials',
      name: 'Clinical Trial Management',
      vertical: 'healthcare',
      active: true,
    },
  ];

  const handleSelectUseCase = (useCase: typeof testUseCases[0]) => {
    const vertical = useCase.vertical || useCase.id.split('-')[0];
    setSelectedVertical(vertical);
    setSelectedUseCase(useCase.id, useCase);
    console.log('Selected use case:', useCase);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Persistence Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Actions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Select Use Case:</h3>
                <div className="space-y-2">
                  {testUseCases.map((useCase) => (
                    <Button
                      key={useCase.id}
                      onClick={() => handleSelectUseCase(useCase)}
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      {useCase.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <Button
                  onClick={clearState}
                  variant="danger"
                  className="w-full"
                >
                  Clear All State
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Current State */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Persisted State</h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-400">Selected Vertical:</span>
                <p className="text-white font-mono">
                  {selectedVertical || 'None'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Selected Use Case ID:</span>
                <p className="text-white font-mono">
                  {selectedUseCase || 'None'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Use Case Details:</span>
                <pre className="text-white text-xs bg-gray-800 p-2 rounded mt-1 overflow-auto">
                  {selectedUseCaseDetails 
                    ? JSON.stringify(selectedUseCaseDetails, null, 2)
                    : 'None'}
                </pre>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <span className="text-sm text-gray-400">Full State Object:</span>
                <pre className="text-white text-xs bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-48">
                  {state ? JSON.stringify(state, null, 2) : 'No state'}
                </pre>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Navigation Links */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => window.location.href = '/mission-control'}
            variant="primary"
          >
            Go to Mission Control
          </Button>
          <Button
            onClick={() => window.location.href = '/use-case-dashboard'}
            variant="primary"
          >
            Go to Use Case Dashboard
          </Button>
        </div>
        
        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click one of the use case buttons above to select it</li>
            <li>Check that the state updates on the right</li>
            <li>Navigate to Use Case Dashboard - it should show the selected use case</li>
            <li>Come back to this page - the selection should persist</li>
            <li>Refresh the page (F5) - the selection should still persist</li>
            <li>Click "Clear All State" to reset</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default TestPersistence;