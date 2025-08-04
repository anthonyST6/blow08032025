/**
 * Oilfield Dashboard Example
 * 
 * This component demonstrates how to use the UnifiedDashboardWrapper
 * for both demo and run modes, showing the seamless transition between
 * demo data and live ingested data.
 */

import React, { useState, useEffect } from 'react';
import { UnifiedDashboardWrapper } from './UnifiedDashboardWrapper';
import { OilfieldDemoData, OilfieldDataTransformerService } from '../../services/oilfieldDataTransformer.service';
import { IngestedDataRow } from '../../services/ingestedData.service';

interface OilfieldDashboardExampleProps {
  mode: 'demo' | 'run';
}

export const OilfieldDashboardExample: React.FC<OilfieldDashboardExampleProps> = ({ mode }) => {
  const [demoData, setDemoData] = useState<OilfieldDemoData | null>(null);
  const [ingestedData, setIngestedData] = useState<IngestedDataRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load demo data on mount (for demo mode)
  useEffect(() => {
    if (mode === 'demo') {
      // In a real implementation, this would load from your existing demo data
      const data = generateDemoData();
      setDemoData(data);
    }
  }, [mode]);

  // Handle data ingestion (for run mode)
  const handleDataIngest = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would open a file picker or data ingestion UI
      // For now, we'll simulate it
      console.log('Opening data ingestion interface...');
      
      // Simulate data ingestion after 2 seconds
      setTimeout(() => {
        // Simulate ingested data
        const simulatedData: IngestedDataRow[] = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            category: 'lease',
            status: 'active',
            value: 125000,
            anomalyScore: 15,
            confidenceScore: 95,
            metrics: {
              accuracy: 90,
              confidence: 95,
              performance: 92
            }
          },
          // Add more simulated rows as needed
        ];
        
        setIngestedData(simulatedData);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error ingesting data:', error);
      setIsLoading(false);
    }
  };

  // Handle data refresh (for run mode)
  const handleRefresh = async () => {
    console.log('Refreshing data...');
    // In a real implementation, this would re-fetch or re-process the data
    // Could also trigger WebSocket updates
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <UnifiedDashboardWrapper
        useCase="oilfield"
        mode={mode}
        demoData={mode === 'demo' ? demoData || undefined : undefined}
        ingestedData={mode === 'run' ? ingestedData || undefined : undefined}
        onDataIngest={mode === 'run' ? handleDataIngest : undefined}
        onRefresh={mode === 'run' ? handleRefresh : undefined}
      />
    </div>
  );
};

// Helper function to generate demo data (placeholder)
function generateDemoData(): OilfieldDemoData {
  return {
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
    expirationTimeline: Array.from({ length: 365 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5)
    })),
    royaltyTrends: Array.from({ length: 180 }, (_, i) => ({
      date: new Date(Date.now() - (179 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 18.5 + (Math.random() - 0.5) * 2
    })),
    geographicDistribution: [
      { region: 'Permian Basin', leases: 45, production: 1.8, risk: 'low' },
      { region: 'Eagle Ford', leases: 38, production: 1.2, risk: 'medium' },
      { region: 'Bakken', leases: 32, production: 0.9, risk: 'low' },
      { region: 'Marcellus', leases: 28, production: 0.7, risk: 'high' },
      { region: 'Haynesville', leases: 13, production: 0.4, risk: 'medium' }
    ],
    productionByLease: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 1250 + (Math.random() - 0.5) * 300
    })),
    complianceStatus: {
      compliant: 128,
      pendingReview: 12,
      nonCompliant: 3,
      requiresAction: 13
    },
    financialMetrics: {
      totalRevenue: 50.4,
      avgRevenuePerLease: 0.32,
      projectedRevenue: 58.0,
      costSavings: 4.2
    },
    riskAssessment: {
      highRisk: 8,
      mediumRisk: 23,
      lowRisk: 125,
      mitigatedRisks: 15
    }
  };
}

export default OilfieldDashboardExample;