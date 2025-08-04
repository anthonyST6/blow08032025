/**
 * Unified Dashboard Wrapper
 * 
 * This component demonstrates how to create a dashboard that works with both
 * demo data and ingested data using the shared component library.
 * It can be used as a template for both demo and run dashboards.
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  FileText,
  DollarSign,
  Shield,
  Settings,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { generateOilfieldTabContent } from './OilfieldLandLeaseSharedDashboard';
import { OilfieldDemoData } from '../../services/oilfieldDataTransformer.service';
import { Alert, AlertDescription } from '../ui/Alert';
import {
  useDashboardStore,
  selectHasData,
  selectIsLiveData,
  selectDisplayData,
  selectDataStatus
} from '../../store/dashboardStore';
import { WebSocketStatus } from '../WebSocketStatus';

interface UnifiedDashboardWrapperProps {
  useCase: 'oilfield' | 'supply-chain' | 'healthcare';
  mode: 'demo' | 'run';
  demoData?: OilfieldDemoData; // For demo mode
  ingestedData?: any; // For run mode
  onDataIngest?: () => void; // Callback when user wants to ingest data
  onRefresh?: () => void; // Callback to refresh data
}

export const UnifiedDashboardWrapper: React.FC<UnifiedDashboardWrapperProps> = ({
  useCase,
  mode,
  demoData,
  ingestedData,
  onDataIngest,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use Zustand store for state management
  const {
    transformedData,
    isTransforming,
    transformationError,
    dataTimestamp,
    setDemoData,
    ingestData,
    refreshData
  } = useDashboardStore();
  
  const hasData = useDashboardStore(selectHasData);
  const isLiveData = useDashboardStore(selectIsLiveData);
  const displayData = useDashboardStore(selectDisplayData);
  const dataStatus = useDashboardStore(selectDataStatus);

  // Set demo data when provided
  useEffect(() => {
    if (mode === 'demo' && demoData) {
      setDemoData(demoData);
    }
  }, [mode, demoData, setDemoData]);

  // Ingest data when provided
  useEffect(() => {
    if (mode === 'run' && ingestedData) {
      ingestData(ingestedData);
    }
  }, [mode, ingestedData, ingestData]);

  // Determine which data to use
  const dataToUse = mode === 'demo' ? demoData : transformedData;

  // Handle data request (for empty states)
  const handleDataRequest = () => {
    if (mode === 'run' && onDataIngest) {
      onDataIngest();
    }
  };

  // Handle refresh with Zustand
  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    }
    await refreshData();
  };

  // Get tab content based on use case
  const getTabContent = () => {
    if (!dataToUse) {
      // Return empty state for all tabs
      return {
        overview: <EmptyDataState onDataIngest={handleDataRequest} mode={mode} />,
        financial: <EmptyDataState onDataIngest={handleDataRequest} mode={mode} />,
        risk: <EmptyDataState onDataIngest={handleDataRequest} mode={mode} />,
        operations: <EmptyDataState onDataIngest={handleDataRequest} mode={mode} />
      };
    }

    switch (useCase) {
      case 'oilfield':
        return generateOilfieldTabContent(
          dataToUse,
          isLiveData,
          hasData,
          handleDataRequest
        );
      // Add other use cases here
      default:
        return {};
    }
  };

  const tabContent = getTabContent();

  // Define tabs based on mode
  const tabs = mode === 'demo' 
    ? ['overview', 'financial', 'risk', 'operations']
    : ['data-ingestion', 'overview', 'financial', 'risk', 'operations'];

  const tabLabels: Record<string, { label: string; icon: React.ElementType }> = {
    'data-ingestion': { label: 'Data Ingestion', icon: Database },
    'overview': { label: 'Overview', icon: FileText },
    'financial': { label: 'Financial Analysis', icon: DollarSign },
    'risk': { label: 'Risk Assessment', icon: Shield },
    'operations': { label: 'Operations', icon: Settings }
  };

  return (
    <div className="space-y-6">
      {/* Header with status and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            {useCase === 'oilfield' && 'Oilfield Land Lease Dashboard'}
            {/* Add other use case titles */}
          </h2>
          {isLiveData && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Live Data</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* WebSocket Status */}
          <WebSocketStatus />
        
          {/* Refresh Button */}
          {mode === 'run' && hasData && (
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {transformationError && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            {transformationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isTransforming && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          <AlertDescription className="text-blue-400">
            Transforming ingested data...
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          {tabs.map((tab) => {
            const { label, icon: Icon } = tabLabels[tab];
            return (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Data Ingestion Tab (Run mode only) */}
        {mode === 'run' && (
          <TabsContent value="data-ingestion" className="space-y-6">
            <DataIngestionTab
              hasData={hasData}
              onDataIngest={onDataIngest}
              dataStatus={dataStatus}
              dataTimestamp={dataTimestamp}
            />
          </TabsContent>
        )}

        {/* Dashboard Tabs */}
        {Object.entries(tabContent).map(([key, content]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Empty Data State Component
const EmptyDataState: React.FC<{ 
  onDataIngest?: () => void; 
  mode: 'demo' | 'run';
}> = ({ onDataIngest, mode }) => (
  <Card className="p-12 text-center bg-gray-800/50 border-gray-700">
    <Database className="w-16 h-16 mx-auto mb-4 text-gray-500" />
    <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
    <p className="text-gray-400 mb-6">
      {mode === 'demo' 
        ? 'Demo data is not available for this dashboard.'
        : 'Start by ingesting data to populate this dashboard.'}
    </p>
    {mode === 'run' && onDataIngest && (
      <Button onClick={onDataIngest} className="mx-auto">
        Go to Data Ingestion
      </Button>
    )}
  </Card>
);

// Data Ingestion Tab Component
const DataIngestionTab: React.FC<{
  hasData: boolean;
  onDataIngest?: () => void;
  dataStatus: 'empty' | 'processing' | 'success' | 'error';
  dataTimestamp?: string | null;
}> = ({ hasData, onDataIngest, dataStatus, dataTimestamp }) => (
  <div className="space-y-6">
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Data Ingestion Status</h3>
      
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          {dataStatus === 'empty' && (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-300">No data ingested yet</span>
            </>
          )}
          {dataStatus === 'processing' && (
            <>
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-gray-300">Processing ingested data...</span>
            </>
          )}
          {dataStatus === 'success' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300">
                Data successfully ingested and transformed
                {dataTimestamp && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({new Date(dataTimestamp).toLocaleString()})
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">How to Ingest Data:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
            <li>Prepare your data in the required format (CSV, JSON, or Excel)</li>
            <li>Click the "Ingest Data" button below</li>
            <li>Select your data file and configure mapping if needed</li>
            <li>The system will automatically transform and populate all dashboard tabs</li>
          </ol>
        </div>

        {/* Action Button */}
        {onDataIngest && (
          <Button
            onClick={onDataIngest}
            className="w-full"
            size="large"
          >
            <Database className="w-5 h-5 mr-2" />
            {hasData ? 'Ingest New Data' : 'Start Data Ingestion'}
          </Button>
        )}
      </div>
    </Card>

    {/* Data Format Guide */}
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Expected Data Format</h3>
      <div className="space-y-3 text-sm text-gray-400">
        <p>Your data should include the following fields:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Lease ID, Name, and Location</li>
          <li>Status (Active, Pending, Expired)</li>
          <li>Financial metrics (Revenue, Royalty Rates)</li>
          <li>Risk assessments and compliance status</li>
          <li>Production data and operational metrics</li>
        </ul>
        <p className="mt-4">
          The system will automatically map your data to the dashboard components.
        </p>
      </div>
    </Card>
  </div>
);

export default UnifiedDashboardWrapper;