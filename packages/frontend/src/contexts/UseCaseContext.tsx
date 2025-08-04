import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UseCase } from '../types/usecase.types';
import { useCaseService } from '../services/usecase.service';
import { verticals } from '../config/verticals';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface UnifiedUseCaseData {
  summary: {
    activeItems: number;
    successRate: number;
    costSavings: number;
    efficiencyGain: number;
    metrics?: Array<{
      name: string;
      value: number | string;
      unit: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }>;
  };
  // Domain-specific data
  domainData?: {
    leases?: any[];
    compliance?: any;
    financial?: any;
    energy?: any;
  };
  // Operational data
  operations?: {
    workflows?: any[];
    agents?: any[];
    deployments?: any[];
  };
  // Logs and outputs
  logs?: {
    integration?: any[];
    audit?: any[];
    outputs?: any[];
  };
  certifications?: any[];
  [key: string]: any;
}

interface UseCaseContextType {
  useCases: UseCase[];
  selectedUseCase: string;
  setSelectedUseCase: (id: string) => void;
  activeUseCaseId: string | null;
  setActiveUseCaseId: (id: string | null) => void;
  activeUseCaseData: UnifiedUseCaseData | null;
  setActiveUseCaseData: (data: UnifiedUseCaseData | null) => void;
  isLoading: boolean;
  error: string | null;
  // New methods
  launchUseCase: (useCaseId: string) => Promise<void>;
  resetContext: () => void;
  refreshData: () => Promise<void>;
  isLaunching: boolean;
  isDeploying: boolean;
}

const UseCaseContext = createContext<UseCaseContextType | undefined>(undefined);

// Baseline dummy data for when no use case is active
const BASELINE_DUMMY_DATA: UnifiedUseCaseData = {
  summary: {
    activeItems: 42,
    successRate: 94.5,
    costSavings: 2340000,
    efficiencyGain: 67,
    metrics: [
      { name: "Active Processes", value: 12, unit: "count", trend: "up", change: 15 },
      { name: "System Health", value: 98, unit: "%", trend: "stable", change: 0 },
      { name: "Data Quality", value: 91, unit: "%", trend: "up", change: 3 },
      { name: "Cost Reduction", value: 2.34, unit: "M$", trend: "up", change: 12 }
    ]
  }
};

// Default fallback use cases
const FALLBACK_USE_CASES: UseCase[] = [
  {
    id: 'oilfield-land-lease',
    name: 'Oilfield Land Lease',
    description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
    category: 'Real Estate',
    vertical: 'Energy',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: 'energy-load-forecasting',
    name: 'Energy Load Forecasting',
    description: 'AI-powered workflow for predicting energy consumption patterns and optimizing grid load distribution',
    category: 'Operations',
    vertical: 'Energy',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-22'),
  },
];

export const UseCaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCases, setUseCases] = useState<UseCase[]>(FALLBACK_USE_CASES);
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(null);
  const [activeUseCaseData, setActiveUseCaseData] = useState<UnifiedUseCaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Load use cases on mount with timeout
  useEffect(() => {
    loadUseCases();
  }, []);

  // Load selected use case from localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem('selectedUseCase');
    if (savedSelection && useCases.some(uc => uc.id === savedSelection)) {
      setSelectedUseCase(savedSelection);
    } else if (useCases.length > 0 && !selectedUseCase) {
      setSelectedUseCase(useCases[0].id);
    }
  }, [useCases]);

  // Save selected use case to localStorage
  useEffect(() => {
    if (selectedUseCase) {
      localStorage.setItem('selectedUseCase', selectedUseCase);
    }
  }, [selectedUseCase]);

  // Load and save active use case ID
  useEffect(() => {
    const savedActiveId = localStorage.getItem('activeUseCaseId');
    if (savedActiveId) {
      setActiveUseCaseId(savedActiveId);
    }
  }, []);

  useEffect(() => {
    if (activeUseCaseId) {
      localStorage.setItem('activeUseCaseId', activeUseCaseId);
    } else {
      localStorage.removeItem('activeUseCaseId');
    }
  }, [activeUseCaseId]);

  // Clear activeUseCaseData when activeUseCaseId changes to null
  useEffect(() => {
    if (!activeUseCaseId) {
      setActiveUseCaseData(null);
    }
  }, [activeUseCaseId]);

  const loadUseCases = async () => {
    setIsLoading(true);
    setError(null);

    // Generate use cases from verticals configuration
    const verticalUseCases: UseCase[] = [];
    Object.entries(verticals).forEach(([verticalId, vertical]) => {
      vertical.useCases.forEach(useCase => {
        verticalUseCases.push({
          id: `${verticalId}-${useCase.id}`,
          name: useCase.name,
          description: useCase.description,
          category: 'General',
          vertical: vertical.name,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    // Create a timeout promise
    const timeoutPromise = new Promise<UseCase[]>((resolve) => {
      setTimeout(() => {
        console.log('API timeout, using verticals configuration data');
        resolve(verticalUseCases);
      }, 1000); // 1 second timeout
    });

    try {
      // Race between API call and timeout
      const result = await Promise.race([
        useCaseService.getUseCases(),
        timeoutPromise
      ]);

      setUseCases(result.length > 0 ? result : verticalUseCases);
    } catch (err) {
      console.error('Failed to load use cases:', err);
      setError('Failed to load use cases');
      setUseCases(verticalUseCases);
    } finally {
      setIsLoading(false);
    }
  };

  // Launch use case with automatic workflow triggering
  const launchUseCase = async (useCaseId: string) => {
    setIsLaunching(true);
    setError(null);
    
    try {
      // Set active use case
      setActiveUseCaseId(useCaseId);
      localStorage.setItem('activeUseCaseId', useCaseId);
      
      // Run workflows
      try {
        await api.post(`/api/usecases/${useCaseId}/runWorkflows`);
      } catch (err) {
        console.log('Workflow API not available, continuing...');
      }
      
      // Deploy agents
      setIsDeploying(true);
      try {
        await api.post(`/api/usecases/${useCaseId}/deploy`);
      } catch (err) {
        console.log('Deploy API not available, continuing...');
      }
      
      // Wait for deployment (mock with delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch unified data
      try {
        const response = await api.get(`/api/usecases/${useCaseId}/data`);
        setActiveUseCaseData(response.data);
      } catch (err) {
        // Use mock data if API not available
        const mockData = generateMockUseCaseData(useCaseId);
        setActiveUseCaseData(mockData);
      }
      
      toast.success('Use case launched successfully');
    } catch (err) {
      console.error('Failed to launch use case:', err);
      toast.error('Failed to launch use case');
      setError('Failed to launch use case');
      // Reset on error
      setActiveUseCaseId(null);
      setActiveUseCaseData(null);
      localStorage.removeItem('activeUseCaseId');
    } finally {
      setIsLaunching(false);
      setIsDeploying(false);
    }
  };

  // Reset context to baseline
  const resetContext = () => {
    setActiveUseCaseId(null);
    setActiveUseCaseData(null);
    localStorage.removeItem('activeUseCaseId');
    toast.success('Context reset to baseline');
  };

  // Refresh current use case data
  const refreshData = async () => {
    if (!activeUseCaseId) return;
    
    try {
      const response = await api.get(`/api/usecases/${activeUseCaseId}/data`);
      setActiveUseCaseData(response.data);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Generate mock data for a use case
  const generateMockUseCaseData = (useCaseId: string): UnifiedUseCaseData => {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    
    if (useCaseId === 'oilfield-land-lease') {
      return {
        summary: {
          activeItems: 156,
          successRate: 97.2,
          costSavings: 4560000,
          efficiencyGain: 82,
          metrics: [
            { name: "Active Leases", value: 156, unit: "count", trend: "up", change: 12 },
            { name: "Compliance Rate", value: 97.2, unit: "%", trend: "up", change: 2.3 },
            { name: "Cost Savings", value: 4.56, unit: "M$", trend: "up", change: 18 },
            { name: "Processing Time", value: 2.3, unit: "hours", trend: "down", change: -45 }
          ]
        },
        domainData: {
          leases: [
            { id: 1, name: "Permian Basin Lease #1", status: "active", expiryDate: "2025-12-31" },
            { id: 2, name: "Eagle Ford Lease #3", status: "active", expiryDate: "2026-06-30" },
            { id: 3, name: "Bakken Formation Lease #7", status: "pending", expiryDate: "2025-03-15" }
          ],
          compliance: {
            overallScore: 97.2,
            violations: 3,
            warnings: 12,
            lastAudit: "2024-03-15"
          }
        },
        operations: {
          workflows: [
            { id: "wf-1", name: "Lease Document Processing", status: "active", runs: 234 },
            { id: "wf-2", name: "Compliance Validation", status: "active", runs: 189 }
          ],
          agents: [
            { id: "agent-1", name: "Document Analyzer", status: "online", load: 67 },
            { id: "agent-2", name: "Compliance Checker", status: "online", load: 45 }
          ]
        }
      };
    }
    
    // Default mock data for other use cases
    return {
      summary: {
        activeItems: 78,
        successRate: 92.5,
        costSavings: 3200000,
        efficiencyGain: 75,
        metrics: [
          { name: "Active Items", value: 78, unit: "count", trend: "up", change: 8 },
          { name: "Success Rate", value: 92.5, unit: "%", trend: "stable", change: 0.5 },
          { name: "Cost Savings", value: 3.2, unit: "M$", trend: "up", change: 15 },
          { name: "Efficiency", value: 75, unit: "%", trend: "up", change: 5 }
        ]
      }
    };
  };

  const value: UseCaseContextType = {
    useCases,
    selectedUseCase,
    setSelectedUseCase,
    activeUseCaseId,
    setActiveUseCaseId,
    activeUseCaseData,
    setActiveUseCaseData,
    isLoading,
    error,
    launchUseCase,
    resetContext,
    refreshData,
    isLaunching,
    isDeploying,
  };

  return (
    <UseCaseContext.Provider value={value}>
      {children}
    </UseCaseContext.Provider>
  );
};

export const useUseCaseContext = () => {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCaseContext must be used within a UseCaseProvider');
  }
  return context;
};