/**
 * Data Flow Test Component
 * 
 * This component tests the complete data flow from ingestion through
 * transformation to display across all dashboard tabs.
 */

import React, { useState } from 'react';
import { UnifiedDashboardWrapper } from './UnifiedDashboardWrapper';
import { generateIngestedData, IngestedDataRow } from '../../services/ingestedData.service';
import { OilfieldDataTransformerService } from '../../services/oilfieldDataTransformer.service';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useDashboardStore } from '../../store/dashboardStore';

export const DataFlowTest: React.FC = () => {
  const [testMode, setTestMode] = useState<'demo' | 'run'>('demo');
  const [ingestedData, setIngestedData] = useState<IngestedDataRow[] | null>(null);
  
  // Get store state for monitoring
  const { 
    transformedData, 
    isIngesting, 
    isTransforming,
    ingestionError,
    transformationError,
    dataTimestamp 
  } = useDashboardStore();

  // Generate demo data
  const demoData = OilfieldDataTransformerService.generateEmptyData();
  
  // Populate demo data with some values
  const populatedDemoData = {
    ...demoData,
    leaseMetrics: {
      totalLeases: 156,
      activeLeases: 142,
      expiringIn30Days: 8,
      expiringIn90Days: 23,
      averageRoyaltyRate: 18.5,
      totalAcreage: 56940,
      monthlyRevenue: 4.2,
      yearlyRevenue: 50.4
    },
    leasesByStatus: [
      { status: 'Active', count: 142, value: 3.8 },
      { status: 'Pending Renewal', count: 8, value: 0.2 },
      { status: 'In Negotiation', count: 4, value: 0.1 },
      { status: 'Expired', count: 2, value: 0.1 }
    ],
    complianceStatus: {
      compliant: 128,
      pendingReview: 12,
      nonCompliant: 3,
      requiresAction: 13
    }
  };

  // Simulate data ingestion
  const handleDataIngest = () => {
    console.log('Starting data ingestion test...');
    
    // Generate test data
    const testData = generateIngestedData({
      id: 'oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      description: 'Test use case',
      siaScores: { security: 95, integrity: 92, accuracy: 94 }
    } as any);
    
    setIngestedData(testData.ingestedRows);
    console.log('Ingested data:', testData.ingestedRows.length, 'rows');
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('Refreshing data...');
    if (ingestedData) {
      // Re-ingest with new timestamp
      const refreshedData = ingestedData.map(row => ({
        ...row,
        timestamp: new Date().toISOString()
      }));
      setIngestedData(refreshedData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {/* Test Controls */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Data Flow Test Controls</h2>
        
        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-4">
            <Button
              variant={testMode === 'demo' ? 'primary' : 'secondary'}
              onClick={() => setTestMode('demo')}
            >
              Demo Mode
            </Button>
            <Button
              variant={testMode === 'run' ? 'primary' : 'secondary'}
              onClick={() => setTestMode('run')}
            >
              Run Mode
            </Button>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Mode:</span>
              <span className="ml-2 text-white font-medium">{testMode}</span>
            </div>
            <div>
              <span className="text-gray-400">Has Ingested Data:</span>
              <span className="ml-2 text-white font-medium">{ingestedData ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Is Ingesting:</span>
              <span className="ml-2 text-white font-medium">{isIngesting ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Is Transforming:</span>
              <span className="ml-2 text-white font-medium">{isTransforming ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Has Transformed Data:</span>
              <span className="ml-2 text-white font-medium">{transformedData ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Data Timestamp:</span>
              <span className="ml-2 text-white font-medium">
                {dataTimestamp ? new Date(dataTimestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {(ingestionError || transformationError) && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded">
              <p className="text-sm text-red-400">
                {ingestionError || transformationError}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Dashboard */}
      <UnifiedDashboardWrapper
        useCase="oilfield"
        mode={testMode}
        demoData={testMode === 'demo' ? populatedDemoData : undefined}
        ingestedData={testMode === 'run' ? ingestedData || undefined : undefined}
        onDataIngest={handleDataIngest}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default DataFlowTest;