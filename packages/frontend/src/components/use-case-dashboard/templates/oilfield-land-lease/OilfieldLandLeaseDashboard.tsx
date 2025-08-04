import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  SparklesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { useAuditLogger, ActionType } from '../../../../hooks/useAuditLogger';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';
import { webSocketService, WebSocketMessage } from '../../../../services/websocket.service';

interface Lease {
  id: string;
  name: string;
  status: string;
  expirationDays: number;
  value: number;
  location: string;
  compliance: {
    security: boolean;
    integrity: boolean;
    accuracy: boolean;
  };
}

interface DashboardMetrics {
  totalLeases: number;
  portfolioValue: number;
  expiringSoon: number;
  complianceRate: number;
}

export const OilfieldLandLeaseDashboard: React.FC = () => {
  const [selectedLease, setSelectedLease] = useState<string | null>(null);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeases: 0,
    portfolioValue: 0,
    expiringSoon: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const { logAction } = useAuditLogger();

  // Fetch lease data on component mount and setup WebSocket
  useEffect(() => {
    fetchLeaseData();
    
    // Subscribe to WebSocket updates for this use case
    const unsubscribe = webSocketService.subscribeToUseCase(
      'energy-oilfield-land-lease',
      handleWebSocketMessage
    );
    
    // Check WebSocket connection status
    setWsConnected(webSocketService.getConnectionStatus());
    
    // Subscribe to connection status changes
    const unsubscribeStatus = webSocketService.subscribeAll((message) => {
      if (message.data?.connected !== undefined) {
        setWsConnected(message.data.connected);
      }
    });
    
    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, []);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'use_case_update':
        // Handle real-time lease updates
        if (message.data.leases) {
          setLeases(message.data.leases);
        }
        if (message.data.metrics) {
          setMetrics(message.data.metrics);
        }
        break;
        
      case 'vanguard_result':
        // Handle vanguard execution results
        if (message.data.leaseId && message.data.updates) {
          setLeases(prevLeases =>
            prevLeases.map(lease =>
              lease.id === message.data.leaseId
                ? { ...lease, ...message.data.updates }
                : lease
            )
          );
        }
        break;
    }
  };

  const fetchLeaseData = async () => {
    try {
      setLoading(true);
      // Fetch lease data from the backend
      const response = await api.get('/usecases/energy-oilfield-land-lease/data');
      
      if (response.data) {
        setLeases(response.data.leases || []);
        setMetrics(response.data.metrics || {
          totalLeases: 0,
          portfolioValue: 0,
          expiringSoon: 0,
          complianceRate: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch lease data:', error);
      toast.error('Failed to load lease data');
      
      // Fallback to mock data if API fails
      const mockLeases = [
        {
          id: 'LEASE-001',
          name: 'Eagle Ford Shale Unit A-1',
          status: 'active',
          expirationDays: 180,
          value: 8500000,
          location: 'Karnes County, TX',
          compliance: { security: true, integrity: true, accuracy: true }
        },
        {
          id: 'LEASE-002',
          name: 'Permian Basin Block 42',
          status: 'expiring-soon',
          expirationDays: 45,
          value: 12300000,
          location: 'Midland County, TX',
          compliance: { security: true, integrity: false, accuracy: true }
        },
        {
          id: 'LEASE-003',
          name: 'Bakken Formation Tract 7',
          status: 'under-review',
          expirationDays: 90,
          value: 6200000,
          location: 'McKenzie County, ND',
          compliance: { security: true, integrity: true, accuracy: false }
        }
      ];
      
      setLeases(mockLeases);
      setMetrics({
        totalLeases: 1247,
        portfolioValue: 485000000,
        expiringSoon: 23,
        complianceRate: 94.5
      });
    } finally {
      setLoading(false);
    }
  };

  const executeVanguardAction = async (action: string, leaseId?: string) => {
    setExecutingAction(action);
    
    // Log action initiation
    await logAction({
      actionType: ActionType.VANGUARD_EXECUTION,
      actionDetails: {
        component: 'OilfieldLandLeaseDashboard',
        description: `Executing ${action}`,
        parameters: { action, leaseId }
      }
    });
    
    try {
      // Map action names to vanguard endpoints
      let endpoint = '';
      let payload: any = {};
      
      switch (action) {
        case 'Validate All Lease Data':
          endpoint = '/mission-control/agents/vanguards/accuracy-vanguard/execute';
          payload = { action: 'validate-all', useCaseId: 'energy-oilfield-land-lease' };
          break;
        case 'Analyze Renewals':
          endpoint = '/mission-control/agents/vanguards/negotiation-vanguard/execute';
          payload = { action: 'analyze-renewal', leaseId, useCaseId: 'energy-oilfield-land-lease' };
          break;
        case 'Optimize Portfolio':
          endpoint = '/mission-control/agents/vanguards/optimization-vanguard/execute';
          payload = { action: 'optimize-portfolio', useCaseId: 'energy-oilfield-land-lease' };
          break;
      }
      
      // Execute vanguard action via API
      const response = await api.post(endpoint, payload);
      
      // Log result
      await logAction({
        actionType: ActionType.VANGUARD_RESULT,
        actionDetails: {
          component: 'OilfieldLandLeaseDashboard',
          description: `${action} completed successfully`,
          result: response.data
        }
      });
      
      toast.success(`${action} completed successfully!`);
      
      // Refresh data after action
      await fetchLeaseData();
    } catch (error: any) {
      console.error('Vanguard action failed:', error);
      toast.error(`Failed to execute ${action}`);
      
      // Log failure
      await logAction({
        actionType: ActionType.VANGUARD_RESULT,
        actionDetails: {
          component: 'OilfieldLandLeaseDashboard',
          description: `${action} failed`,
          result: { status: 'error', error: error?.message || 'Unknown error' }
        }
      });
    } finally {
      setExecutingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2 text-sm">
          <WifiIcon className={`w-4 h-4 ${wsConnected ? 'text-green-500' : 'text-gray-500'}`} />
          <span className={wsConnected ? 'text-green-400' : 'text-gray-400'}>
            {wsConnected ? 'Real-time updates active' : 'Real-time updates offline'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Leases</p>
              <p className="text-2xl font-bold text-white">{metrics.totalLeases.toLocaleString()}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                ${(metrics.portfolioValue / 1000000).toFixed(0)}M
              </p>
            </div>
            <MapPinIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-400">{metrics.expiringSoon}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Compliance</p>
              <p className="text-2xl font-bold text-green-400">{metrics.complianceRate}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lease Portfolio */}
        <div className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Active Leases</h3>
          
          <div className="space-y-3">
            {leases.map((lease: Lease) => (
              <div
                key={lease.id}
                onClick={() => setSelectedLease(lease.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedLease === lease.id
                    ? 'bg-amber-900/20 border-amber-600'
                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{lease.name}</h4>
                    <p className="text-sm text-gray-400">{lease.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      ${(lease.value / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires in {lease.expirationDays} days
                    </p>
                  </div>
                </div>
                
                {/* SIA Compliance Indicators */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">SIA:</span>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.security ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.integrity ? 'bg-red-500' : 'bg-gray-600'
                    }`} />
                    <div className={`w-2 h-2 rounded-full ${
                      lease.compliance.accuracy ? 'bg-green-500' : 'bg-gray-600'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vanguard Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            Vanguard Actions
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => executeVanguardAction('Validate All Lease Data')}
              disabled={!!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Validate All Data</span>
                {executingAction === 'Validate All Lease Data' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Accuracy Vanguard</p>
            </button>
            
            <button
              onClick={() => executeVanguardAction('Analyze Renewals', selectedLease || undefined)}
              disabled={!selectedLease || !!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Analyze Selected Lease</span>
                {executingAction === 'Analyze Renewals' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Negotiation Vanguard</p>
            </button>
            
            <button
              onClick={() => executeVanguardAction('Optimize Portfolio')}
              disabled={!!executingAction}
              className="w-full p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 
                       text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Optimize Portfolio</span>
                {executingAction === 'Optimize Portfolio' && (
                  <ArrowPathIcon className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Optimization Vanguard</p>
            </button>
          </div>
          
          {selectedLease && (
            <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-700">
              <p className="text-xs text-amber-400">
                Selected: {leases.find((l: Lease) => l.id === selectedLease)?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};